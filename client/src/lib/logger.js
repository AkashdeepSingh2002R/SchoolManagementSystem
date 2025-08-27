// client/src/lib/logger.js
const noop = () => {};
const isProd = import.meta.env.MODE === 'production';
export const logger = {
  log: isProd ? noop : console.log.bind(console),
  warn: isProd ? noop : console.warn.bind(console),
  error: isProd ? console.error.bind(console) : console.error.bind(console),
  debug: isProd ? noop : console.debug.bind(console),
};
