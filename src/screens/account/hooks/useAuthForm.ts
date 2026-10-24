import { useState } from 'react';
import type { ScreenProps } from '@/types/screen';

export function useAuthForm(onAuth: ScreenProps['onAuth']) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!username.trim() || !password) {
      setError('Nhập username và mật khẩu để tiếp tục.');
      return;
    }
    if (mode === 'register') {
      if (!/^[a-z0-9][a-z0-9_.]{2,29}$/i.test(username.trim())) {
        setError(
          'Username gồm 3–30 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.',
        );
        return;
      }
      if (
        password.length < 6 ||
        Array.from(password).reduce((size, char) => {
          const code = char.codePointAt(0)!;
          return (
            size +
            (code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4)
          );
        }, 0) > 72
      ) {
        setError('Mật khẩu cần ít nhất 6 ký tự và không vượt quá 72 byte.');
        return;
      }
      if (
        email.trim() &&
        !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim())
      ) {
        setError('Email không hợp lệ. Bạn có thể bỏ trống trường này.');
        return;
      }
    }
    setError('');
    try {
      await onAuth(mode, username, password, name, email);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Không thể đăng nhập. Vui lòng thử lại.',
      );
    }
  };
  return {
    username,
    email,
    error,
    mode,
    name,
    password,
    setUsername,
    setEmail,
    setError,
    setMode,
    setName,
    setPassword,
    submit,
  };
}
