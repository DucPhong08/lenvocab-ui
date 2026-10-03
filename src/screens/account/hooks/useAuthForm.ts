import { useState } from 'react';
import type { ScreenProps } from '@/types/screen';

export function useAuthForm(onAuth: ScreenProps['onAuth']) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (
      !email.trim() ||
      !password ||
      (mode === 'register' && password.length < 6)
    ) {
      setError(
        'Nhập email và mật khẩu hợp lệ (tối thiểu 6 ký tự khi đăng ký).',
      );
      return;
    }

    setError('');
    try {
      await onAuth(mode, email, password, name);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Không thể đăng nhập. Vui lòng thử lại.',
      );
    }
  };

  return {
    email,
    error,
    mode,
    name,
    password,
    setEmail,
    setError,
    setMode,
    setName,
    setPassword,
    submit,
  };
}
