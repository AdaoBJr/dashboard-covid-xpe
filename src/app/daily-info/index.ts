import * as dayjs from 'dayjs';
import { Chart } from 'chart.js';
import Chartjs from 'chart.js/auto';

import { loadingAnimation, useCovidApi } from '../../services';
import { GetCountryByAllStatus, GetCountryByStatus } from '../../types';

const { getCountries, getCountryByStatus, getCountryByAllStatus } = useCovidApi();

(async () => {
  const inputInitialDate = document.querySelector<HTMLInputElement>('#initial_date')!;
  const inputFinalDate = document.querySelector<HTMLInputElement>('#final_date')!;
  const selectCountries = document.querySelector<HTMLSelectElement>('#select_country')!;
  const selectStatus = document.querySelector<HTMLSelectElement>('#select_status')!;
  const btnApply = document.querySelector<HTMLButtonElement>('#btnApply')!;
  const totalConfirmed =
    document.querySelector<HTMLParagraphElement>('#total_confirmed')!;
  const totalDeaths = document.querySelector<HTMLParagraphElement>('#total_deaths')!;
  const totalRecovered =
    document.querySelector<HTMLParagraphElement>('#total_recovered')!;
  let chart: Chart | null = null;

  //Iniciando com Loading
  loadingAnimation({ isFetching: true, querySelector: '#loading' });
  const countries = await getCountries();

  //Removendo loading com o retorno da api
  if (Object.values(countries).length > 0) {
    loadingAnimation({ isFetching: false, querySelector: '#loading' });
    insertCountriesInSelect();
  }

  btnApply.addEventListener('click', handleApplyButton);

  function insertCountriesInSelect() {
    countries.sort((a, b) => a.Country.localeCompare(b.Country));
    countries.forEach((country) => {
      const optionCountry = document.createElement('option');
      optionCountry.value = country.Slug;
      optionCountry.textContent = country.Country;
      selectCountries.appendChild(optionCountry);
    });
  }

  async function handleApplyButton() {
    // const dateFrom =
    //   inputInitialDate.value && new Date(inputInitialDate.value).toISOString();
    const dateFromExtraOneDay =
      inputInitialDate.value && dayjs(inputInitialDate.value).subtract(1, 'd').format();
    const dateTo = inputFinalDate.value && new Date(inputFinalDate.value).toISOString();
    const country = selectCountries.value;
    const status = selectStatus.value;

    const okToGetDailyData = [
      country !== 'Selecione',
      status !== 'Selecione',
      dateTo,
      dateFromExtraOneDay,
    ].every(Boolean);

    if (!okToGetDailyData) return alert('Por favor, preencha todos os campos.');
    loadingAnimation({ isFetching: true, querySelector: '#loading' });

    const [dataAllStatus, dataByStatus] = await Promise.all([
      getCountryByAllStatus({
        country,
        dateFrom: dateFromExtraOneDay,
        dateTo,
      }),
      getCountryByStatus({
        country,
        status,
        dateFrom: dateFromExtraOneDay,
        dateTo,
      }),
    ]);

    loadingAnimation({ isFetching: false, querySelector: '#loading' });
    createChartAndKPIs({ dataAllStatus, dataByStatus });
  }

  function createChartAndKPIs({
    dataAllStatus,
    dataByStatus,
  }: {
    dataAllStatus: GetCountryByAllStatus[];
    dataByStatus: GetCountryByStatus[];
  }) {
    const ctx = document.querySelector<HTMLCanvasElement>('#chart_line')!;

    //Processando os dados dos KPI's
    const totalCasesData = dataAllStatus.map(
      ({ Date, Confirmed, Deaths, Recovered }) => ({
        date: Date,
        confirmed: Confirmed,
        deaths: Deaths,
        recovered: Recovered,
      })
    );

    const dailyCasesByAllStatus = totalCasesData.map((data, i, array) => {
      if (i === 0) {
        return data;
      }
      const dailyConfirmed = data.confirmed - array[i - 1].confirmed;
      const dailyDeaths = data.deaths - array[i - 1].deaths;
      const dailyRecovered = data.recovered - array[i - 1].recovered;
      return {
        ...data,
        confirmed: dailyConfirmed,
        deaths: dailyDeaths,
        recovered: dailyRecovered,
      };
    });
    dailyCasesByAllStatus.shift();

    const initialValue = { confirmed: 0, deaths: 0, recovered: 0 };
    const totalCasesByStatus = dailyCasesByAllStatus.reduce((acc, curr) => {
      acc.confirmed += curr.confirmed;
      acc.deaths += curr.deaths;
      acc.recovered += curr.recovered;

      return acc;
    }, initialValue);

    //Adicionando dados da covid aos KPI's
    totalConfirmed.innerText = totalCasesByStatus.confirmed.toLocaleString();
    totalDeaths.innerText = totalCasesByStatus.deaths.toLocaleString();
    totalRecovered.innerText = totalCasesByStatus.recovered.toLocaleString();

    //Processando os dados para renderizar o gráfico
    const chartData = dataByStatus.map(({ Date, Cases }) => ({
      date: Date.split('T')[0],
      cases: Cases,
    }));

    const dailyData = chartData.map((data, i, array) => {
      if (i === 0) {
        return { ...data, cases: data.cases };
      }
      const dailyCases = data.cases - array[i - 1].cases;
      return { ...data, cases: dailyCases };
    });

    dailyData.shift();

    const averageCases = dailyData.reduce(
      (acc, curr, _, array) => Math.round(acc + curr.cases / array.length),
      0
    );
    console.log({ dailyData });

    const label = `${
      selectStatus.value.charAt(0).toUpperCase() + selectStatus.value.slice(1)
    } Casos`;

    //Renderizando o gráfico
    if (chart) {
      chart.destroy();
    }
    chart = new Chartjs(ctx, {
      type: 'line',
      data: {
        labels: dailyData.map(({ date }) => date),
        datasets: [
          {
            label,
            data: dailyData.map(({ cases }) => cases),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Média de Casos',
            data: Array(dailyData.length).fill(averageCases),
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            ticks: {
              autoSkip: true,
              maxTicksLimit: 20,
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
})();
