export const isDev = () => process.env.NODE_ENV !== 'production';

export const log = (...args: any[]) => {
  if (isDev()) console.log(...args);
};

export const info = (...args: any[]) => {
  if (isDev()) console.info(...args);
};

export const warn = (...args: any[]) => {
  if (isDev()) console.warn(...args);
};

export const error = (...args: any[]) => {
  if (isDev()) console.error(...args);
};

export default { isDev, log, info, warn, error };
