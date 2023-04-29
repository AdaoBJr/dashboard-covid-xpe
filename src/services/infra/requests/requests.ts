import { api } from '../api';
import { getEnv } from '../../../environment';
import { GetCountryByAllStatus, GetSummary } from '../../../types';

export const useCovidApi = () => {
  const { URL_BASE } = getEnv();

  const getSummary = async () => {
    const res = await api.get<GetSummary>(URL_BASE);
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

  return { getSummary, getCountryByAllStatus };
};
