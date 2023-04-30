import { api } from '../api';
import { getEnv } from '../../../environment';
import {
  GetSummary,
  GetCountries,
  GetCountryByStatus,
  GetCountryByAllStatus,
} from '../../../types';

export const useCovidApi = () => {
  const { URL_BASE } = getEnv();

  const getSummary = async () => {
    const res = await api.get<GetSummary>(`${URL_BASE}summary`);
    return res.data;
  };

  const getCountries = async () => {
    const res = await api.get<GetCountries[]>(`${URL_BASE}countries`);
    return res.data;
  };

  const getCountryByAllStatus = async ({
    country,
    dateFrom,
    dateTo,
  }: {
    country: string;
    dateFrom: string;
    dateTo: string;
  }) => {
    const URL = `${URL_BASE}country/${country}?from=${dateFrom}&to=${dateTo}`;

    const res = await api.get<GetCountryByAllStatus[]>(URL);
    return res.data;
  };

  const getCountryByStatus = async ({
    country,
    status,
    dateFrom,
    dateTo,
  }: {
    country: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  }) => {
    const URL = `${URL_BASE}total/country/${country}/status/${status}?from=${dateFrom}&to=${dateTo}`;

    const res = await api.get<GetCountryByStatus[]>(URL);
    return res.data;
  };

  return { getSummary, getCountries, getCountryByStatus, getCountryByAllStatus };
};
