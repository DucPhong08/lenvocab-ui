import { useCallback, useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { authenticate } from '@/api/endpoints/authenticate';

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

  const signIn = useCallback(
    async (
      mode: 'login' | 'register',
      email: string,
      password: string,
      name: string,
    ) => {
      setAuthBusy(true);
      try {
        const result = await authenticate(mode, email, password, name);
        await Keychain.setGenericPassword('session', result.access_token, {
          service: SESSION_SERVICE,
        });
        setToken(result.access_token);
      } finally {
        setAuthBusy(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
    setToken(null);
  }, []);

  return { authBusy, restoringSession, signIn, signOut, token };
}
