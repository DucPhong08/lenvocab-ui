export const errorMessage = (error: unknown, fallback = 'Vui lòng thử lại.') =>
  error instanceof Error ? error.message : fallback;
