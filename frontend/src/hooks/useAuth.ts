import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      sessionStorage.setItem('gm_token', urlToken);
      // Remove token from URL for cleaner look
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      return urlToken;
    }
    return sessionStorage.getItem('gm_token') || '';
  });

  return { token, setToken };
}
