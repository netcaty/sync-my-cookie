export function autoKey(domain: string, direction: 'push' | 'merge') {
  return `__AUTO_${direction.toUpperCase()}_${domain}__`;
}

export const DOMAIN_LIST_KEY = '__DOMAIN_LIST__';
export const AUTO_CONFIG_KEY = '__AUTO_CONFIG__';
export const TOKEN_KEY = '__TOKEN__';
export const PASSWORD_KEY = '__PASSWORD__';
export const GIST_ID_KEY = '__GIST_ID__';
export const FILE_NAME_KEY = '__FILE_NAME__';
export const REFRESH_CONFIG_KEY = '__REFRESH_CONFIG__';
export const ACTIVE_DOMAINS_KEY = '__ACTIVE_DOMAINS__';
