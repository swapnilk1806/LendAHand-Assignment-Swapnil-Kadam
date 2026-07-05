export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred.';
  if (typeof error === 'string') return error;

  if (error.response) {
    const { data, status } = error.response;
    console.error('API Error:', { status, data });

    // 1. Check common message fields
    if (data?.message && typeof data.message === 'string') return data.message;
    if (data?.error && typeof data.error === 'string') return data.error;
    if (data?.msg && typeof data.msg === 'string') return data.msg;

    // 2. Object of field errors
    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors)
        .filter(v => typeof v === 'string')
        .join(', ');
      if (messages) return messages;
    }

    // 3. Array of errors
    if (Array.isArray(data?.errors)) {
      const messages = data.errors.filter((e: any) => typeof e === 'string').join(', ');
      if (messages) return messages;
    }

    // 4. Data itself is a string
    if (typeof data === 'string') return data;

    // 5. Fallback with status
    return `Request failed with status ${status}. Please check your input.`;
  }

  return error.message || 'Network error. Please check your internet connection.';
};