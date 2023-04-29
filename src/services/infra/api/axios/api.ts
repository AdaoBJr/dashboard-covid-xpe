import axios from 'axios';
import { getEnv } from '../../../../environment';

const env = getEnv();
export const api = axios.create({
  baseURL: env.URL_BASE,
});
