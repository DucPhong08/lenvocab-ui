import { useCallback, useEffect, useRef, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { clearLearning } from '@/services/offline/storage';
import { createId } from '@/utils/createId';
import { authenticate } from '@/api/endpoints/authenticate';
import { authenticateGoogle } from '@/api/endpoints/googleAuth';
import { googleIdToken } from '@/services/auth/googleSignIn';

const SESSION_SERVICE = 'lenvocab.session';

export function useSession() {
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  const cacheKeyRef = useRef(cacheKey);
  cacheKeyRef.current = cacheKey;
  const [token, setToken] = useState<string | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let active = true;

    Keychain.getGenericPassword({ service: SESSION_SERVICE })
      .then(async value => {
        if (!active || !value) return;
        let key: string | null = /^offline:[0-9a-f-]{36}$/i.test(value.username)
          ? value.username.slice(8)
          : null;
        if (!key) {
          const migratedKey = createId();
          try {
            await Keychain.setGenericPassword(
              `offline:${migratedKey}`,
              value.password,
              { service: SESSION_SERVICE },
            );
            key = migratedKey;
          } catch {
            /* Keep the existing online session if local metadata cannot be upgraded. */
          }
        }
        if (active) {
          setCacheKey(key);
          setToken(value.password);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setRestoringSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const authInFlight = useRef(false);
  const authenticateSession = useCallback(
    async (operation: () => Promise<{ access_token: string } | null>) => {
      if (authInFlight.current) return;
      authInFlight.current = true;
      setAuthBusy(true);
      try {
        const result = await operation();
        if (!result) return;
        const key = createId();
        await Keychain.setGenericPassword(
          `offline:${key}`,
          result.access_token,
          {
            service: SESSION_SERVICE,
          },
        );
        setCacheKey(key);
        setToken(result.access_token);
      } finally {
        authInFlight.current = false;
        setAuthBusy(false);
      }
    },
    [],
  );

  const signIn = useCallback(
    (
      mode: 'login' | 'register',
      username: string,
      password: string,
      name: string,
      email?: string,
    ) =>
      authenticateSession(() =>
        authenticate(mode, username, password, name, email),
      ),
    [authenticateSession],
  );
  const signInGoogle = useCallback(
    () =>
      authenticateSession(async () => {
        const idToken = await googleIdToken();
        return idToken ? authenticateGoogle(idToken) : null;
      }),
    [authenticateSession],
  );

  const signOut = useCallback(async () => {
    if (cacheKeyRef.current) await clearLearning(cacheKeyRef.current);
    await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
    setToken(null);
    setCacheKey(null);
  }, []);

  return {
    authBusy,
    restoringSession,
    signIn,
    signInGoogle,
    signOut,
    token,
    cacheKey,
  };
}
