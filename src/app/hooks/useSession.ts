import { useCallback, useEffect, useRef, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { authenticate } from '@/api/endpoints/authenticate';
import { authenticateGoogle } from '@/api/endpoints/googleAuth';
import { googleIdToken } from '@/services/auth/googleSignIn';

const SESSION_SERVICE = 'lenvocab.session';

export function useSession() {
  const [token, setToken] = useState<string | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let active = true;

    Keychain.getGenericPassword({ service: SESSION_SERVICE })
      .then(value => {
        if (active && value) setToken(value.password);
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
        await Keychain.setGenericPassword('session', result.access_token, {
          service: SESSION_SERVICE,
        });
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
    await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
    setToken(null);
  }, []);

  return { authBusy, restoringSession, signIn, signInGoogle, signOut, token };
}
