import config from '../config/config';
import { setCookie, getCookie, deleteCookie } from './cookies';

const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';

const TOKEN_COOKIE = config.AUTH?.TOKEN_COOKIE || config.AUTH?.TOKEN_KEY || 'empowerup_token';
const COOKIE_MAX_AGE = (config.AUTH?.TOKEN_EXPIRY_HOURS || 24) * 60 * 60;
const SAME_SITE = config.AUTH?.COOKIE_SAMESITE || 'Lax';

const resolveCookieDomain = () => {
  // Permitir sobrescrita explícita via configuração
  const configured = config.AUTH?.COOKIE_DOMAIN;
  if (configured && configured !== 'auto') {
    return configured;
  }

  if (!isBrowser()) {
    return undefined;
  }

  const { hostname } = window.location;

  if (!hostname || hostname === 'localhost' || /^(127\.0\.0\.1|0\.0\.0\.0)$/.test(hostname)) {
    return undefined;
  }

  const parts = hostname.split('.');
  if (parts.length <= 2) {
    return `.${hostname}`;
  }

  const multiPartTlds = new Set([
    'com.br',
    'net.br',
    'org.br',
    'gov.br',
    'edu.br',
    'co.uk',
    'com.au',
    'co.jp',
  ]);

  const lastTwo = parts.slice(-2).join('.');
  if (multiPartTlds.has(lastTwo)) {
    const lastThree = parts.slice(-3).join('.');
    return `.${lastThree}`;
  }

  return `.${lastTwo}`;
};

const COOKIE_DOMAIN = resolveCookieDomain();

export const getStoredUser = () => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(config.AUTH.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('authStorage.getStoredUser: failed to parse user from localStorage', error);
    return null;
  }
};

export const getStoredToken = () => {
  const storedUser = getStoredUser();
  if (storedUser?.token) {
    return storedUser.token;
  }

  const cookieToken = getCookie(TOKEN_COOKIE);
  return cookieToken || null;
};

export const persistUserSession = (user = {}) => {
  if (!isBrowser()) return;

  const payload = { ...user };
  if (payload.token) {
    setCookie(TOKEN_COOKIE, payload.token, {
      domain: COOKIE_DOMAIN,
      maxAge: COOKIE_MAX_AGE,
      secure: isBrowser() ? window.location.protocol === 'https:' : true,
      sameSite: SAME_SITE,
    });
  }

  try {
    localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('authStorage.persistUserSession: failed to save user to localStorage', error);
  }
};

export const persistToken = (token) => {
  if (!token || !isBrowser()) return;

  const user = getStoredUser() || {};
  user.token = token;
  persistUserSession(user);
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(config.AUTH.USER_KEY);
  } catch (error) {
    console.warn('authStorage.clearAuthSession: failed to clear localStorage', error);
  }

  deleteCookie(TOKEN_COOKIE, {
    domain: COOKIE_DOMAIN,
    path: '/',
    secure: isBrowser() ? window.location.protocol === 'https:' : true,
  });
};

export const hydrateUserFromCookie = () => {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  const storedUser = getStoredUser();
  if (storedUser?.token === token) {
    return storedUser;
  }

  persistToken(token);
  return getStoredUser();
};

export default {
  getStoredToken,
  persistUserSession,
  persistToken,
  clearAuthSession,
  hydrateUserFromCookie,
  getStoredUser,
};
