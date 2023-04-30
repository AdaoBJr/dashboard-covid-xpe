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
  const divChartLine = document.querySelector<HTMLDivElement>('#div_chart_line')!;
  const divKPIs = document.querySelector<HTMLDivElement>('#daily_kpis')!;

  let chart: Chart | null = null;

  //Iniciando com Loading
  loadingAnimation({ isFetching: true, querySelector: '#loading' });
  const countries = await getCountries();
  divKPIs.innerHTML = `
    <div
      id="initial_img"
      class="flex flex-col items-center justify-center w-full gap-y-5"
    >
      <img
        src="./src/assets/icons/search.svg"
        width="200px"
        alt="lupa de busca"
      />
      <p class="font-bold">Preencha os campos ao lado para filtrar.</p>
    </div>
  `;

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
    divChartLine.innerHTML = '';
    const divContainer = document.querySelector<HTMLDivElement>('#container')!;
    divContainer.classList.remove('w-[1000px]');
    divContainer.classList.add('w-full');

    const canvasChartLine = document.createElement('canvas');
    canvasChartLine.id = 'chart_line';
    divChartLine.appendChild(canvasChartLine);
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

    //Renderizando KPI's na tela
    divKPIs.innerHTML = `
      <div
        id="confirmed"
        class="bg-primary-light px-4 py-3 text-center w-[200px] rounded"
      >
        <h5 class="font-bold">Total de Confirmados</h5>
        <p id="total_confirmed">${totalCasesByStatus.confirmed.toLocaleString()}</p>
      </div>
      <div
        id="deaths"
        class="bg-primary-light px-4 py-3 text-center w-[200px] rounded"
      >
        <h5 class="font-bold">Total de Mortes</h5>
        <p id="total_deaths">${totalCasesByStatus.deaths.toLocaleString()}</p>
      </div>
      <div
        id="recovered"
        class="bg-primary-light px-4 py-3 text-center w-[200px] rounded"
      >
        <h5 class="font-bold">Total de Recuperados</h5>
        <p id="total_recovered">${totalCasesByStatus.recovered.toLocaleString()}</p>
      </div>
    `;

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
