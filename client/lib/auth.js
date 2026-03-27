export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('st_token') : null;

export const setToken = (token) =>
  typeof window !== 'undefined' && localStorage.setItem('st_token', token);

export const clearToken = () =>
  typeof window !== 'undefined' && localStorage.removeItem('st_token');

export const getOperator = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('st_operator') || 'null');
  } catch {
    return null;
  }
};

export const setOperator = (op) =>
  typeof window !== 'undefined' && localStorage.setItem('st_operator', JSON.stringify(op));

export const clearOperator = () =>
  typeof window !== 'undefined' && localStorage.removeItem('st_operator');

export const isLoggedIn = () => !!getToken();
