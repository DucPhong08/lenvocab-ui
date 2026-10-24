import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authenticateGoogle } from '@/api/endpoints/googleAuth';
import { authenticate } from '@/api/endpoints/authenticate';
import { googleIdToken } from '@/services/auth/googleSignIn';
import { GOOGLE_AUTH_CONFIG } from '@/services/auth/googleConfig';
import { useSession } from '@/app/hooks/useSession';
import { useAuthForm } from '@/screens/account/hooks/useAuthForm';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
    signOut: jest.fn().mockResolvedValue(null),
  },
  isSuccessResponse: (response: { type: string }) =>
    response.type === 'success',
  isErrorWithCode: (error: { code?: string }) => Boolean(error.code),
  statusCodes: {
    SIGN_IN_CANCELLED: 'CANCELLED',
    PLAY_SERVICES_NOT_AVAILABLE: 'NO_PLAY_SERVICES',
  },
}));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(false),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/api/endpoints/googleAuth', () => ({
  authenticateGoogle: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  GOOGLE_AUTH_CONFIG.webClientId = 'test-web';
  GOOGLE_AUTH_CONFIG.iosClientId = 'test-ios';
  jest
    .mocked(GoogleSignin.signIn)
    .mockResolvedValue({
      type: 'success',
      data: { idToken: 'verified-by-backend' },
    } as never);
  jest
    .mocked(authenticateGoogle)
    .mockResolvedValue({ access_token: 'app-session' });
});
afterEach(() => {
  GOOGLE_AUTH_CONFIG.webClientId = '';
  GOOGLE_AUTH_CONFIG.iosClientId = '';
});

test('does not open Google or call backend until client IDs are configured', async () => {
  GOOGLE_AUTH_CONFIG.webClientId = '';
  await expect(googleIdToken()).rejects.toThrow('chưa được thiết lập');
  expect(GoogleSignin.signIn).not.toHaveBeenCalled();
  expect(authenticateGoogle).not.toHaveBeenCalled();
});

test('returns only the Google ID token and clears the temporary Google session', async () => {
  await expect(googleIdToken()).resolves.toBe('verified-by-backend');
  expect(GoogleSignin.configure).toHaveBeenCalledWith({
    webClientId: 'test-web',
    iosClientId: 'test-ios',
    offlineAccess: false,
  });
  expect(GoogleSignin.signOut).toHaveBeenCalledTimes(1);
});

test('cancelling the Google account chooser returns quietly', async () => {
  jest
    .mocked(GoogleSignin.signIn)
    .mockResolvedValue({ type: 'cancelled', data: null });
  await expect(googleIdToken()).resolves.toBeNull();
});

test('a successful Google SDK response without an ID token cannot create a session', async () => {
  jest
    .mocked(GoogleSignin.signIn)
    .mockResolvedValue({ type: 'success', data: { idToken: null } } as never);
  await expect(googleIdToken()).rejects.toThrow('không trả về');
});

async function session() {
  let state!: ReturnType<typeof useSession>;
  const Harness = () => {
    state = useSession();
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  return {
    renderer,
    get state() {
      return state;
    },
  };
}

test('stores only the backend JWT in Keychain after Google verification', async () => {
  const view = await session();
  try {
    await ReactTestRenderer.act(async () => view.state.signInGoogle());
    expect(authenticateGoogle).toHaveBeenCalledWith('verified-by-backend');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'session',
      'app-session',
      { service: 'lenvocab.session' },
    );
    expect(view.state.token).toBe('app-session');
    expect(view.state.authBusy).toBe(false);
  } finally {
    await ReactTestRenderer.act(async () => view.renderer.unmount());
  }
});

test('cancellation never exchanges a token or writes a session', async () => {
  const view = await session();
  jest
    .mocked(GoogleSignin.signIn)
    .mockResolvedValue({ type: 'cancelled', data: null });
  try {
    await ReactTestRenderer.act(async () => view.state.signInGoogle());
    expect(authenticateGoogle).not.toHaveBeenCalled();
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
    expect(view.state.token).toBeNull();
    expect(view.state.authBusy).toBe(false);
  } finally {
    await ReactTestRenderer.act(async () => view.renderer.unmount());
  }
});

test('backend verification failure cannot persist the Google token as an app session', async () => {
  const view = await session();
  jest
    .mocked(authenticateGoogle)
    .mockRejectedValueOnce(new Error('invalid Google token'));
  try {
    await ReactTestRenderer.act(async () => {
      await expect(view.state.signInGoogle()).rejects.toThrow(
        'invalid Google token',
      );
    });
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
    expect(view.state.token).toBeNull();
    expect(view.state.authBusy).toBe(false);
  } finally {
    await ReactTestRenderer.act(async () => view.renderer.unmount());
  }
});

test('username registration sends a null optional email without fabricating one', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = jest
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'session' }),
    });
  globalThis.fetch = fetchMock;
  try {
    await authenticate('register', ' Phong ', ' pass123 ', 'Name', '');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      username: 'phong',
      password: ' pass123 ',
      display_name: 'Name',
      email: null,
    });
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('registration form needs no email and rejects invalid usernames and oversized UTF8 passwords', async () => {
  const onAuth = jest.fn().mockResolvedValue(undefined);
  let form!: ReturnType<typeof useAuthForm>;
  const Harness = () => {
    form = useAuthForm(onAuth);
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  try {
    await ReactTestRenderer.act(async () => {
      form.setMode('register');
      form.setUsername('phong');
      form.setPassword('secret123');
    });
    await ReactTestRenderer.act(async () => form.submit());
    expect(onAuth).toHaveBeenCalledWith(
      'register',
      'phong',
      'secret123',
      '',
      '',
    );
    onAuth.mockClear();
    await ReactTestRenderer.act(async () => form.setUsername('bad name'));
    await ReactTestRenderer.act(async () => form.submit());
    expect(form.error).toContain('Username gồm');
    expect(onAuth).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      form.setUsername('phong');
      form.setPassword('ắ'.repeat(25));
    });
    await ReactTestRenderer.act(async () => form.submit());
    expect(form.error).toContain('72 byte');
    expect(onAuth).not.toHaveBeenCalled();
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});
