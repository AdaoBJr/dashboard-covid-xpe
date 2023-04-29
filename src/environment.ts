const dev = process.env.NODE_ENV === 'development' && 'dev';
const prd = process.env.NODE_ENV === 'production' && 'prd';
const test = process.env.NODE_ENV === 'test' && 'test';

export type Environment = 'dev' | 'prd' | 'test';

export const getEnv = () => ({
  ENV: [dev, prd, test].find(Boolean)! as Environment,
  URL_BASE: 'https://api.covid19api.com/',
});
