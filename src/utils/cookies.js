// Utilitários simples para manipulação de cookies em ambientes com janela
// Mantemos todas as operações protegidas para evitar erros em ambientes sem `document`

const isBrowser = () => typeof document !== 'undefined';

export const setCookie = (name, value, options = {}) => {
  if (!isBrowser()) return;

  const {
    domain,
    path = '/',
    maxAge,
    expires,
    secure = true,
    sameSite = 'Lax',
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value ?? '')}; path=${path}`;

  if (domain) {
    cookie += `; domain=${domain}`;
  }

  if (typeof maxAge === 'number') {
    cookie += `; max-age=${Math.max(0, Math.floor(maxAge))}`;
  } else if (expires instanceof Date) {
    cookie += `; expires=${expires.toUTCString()}`;
  }

  if (secure) {
    cookie += '; secure';
  }

  if (sameSite) {
    cookie += `; samesite=${sameSite}`;
  }

  document.cookie = cookie;
};

export const getCookie = (name) => {
  if (!isBrowser()) return null;

  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    const [cookieName, ...cookieValueParts] = cookie.split('=');
    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(cookieValueParts.join('='));
    }
  }

  return null;
};

export const deleteCookie = (name, options = {}) => {
  if (!isBrowser()) return;

  setCookie(name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
};

export default {
  setCookie,
  getCookie,
  deleteCookie,
};
