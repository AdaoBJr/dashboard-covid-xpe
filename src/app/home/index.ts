import Chart from 'chart.js/auto';

import { loadingAnimation, useCovidApi } from '../../services';
import { GetSummary } from '../../types';
const { getSummary } = useCovidApi();

(async () => {
  const totalConfirmed =
    document.querySelector<HTMLParagraphElement>('#total_confirmed')!;
  const totalDeaths = document.querySelector<HTMLParagraphElement>('#total_deaths')!;
  const totalRecovered =
    document.querySelector<HTMLParagraphElement>('#total_recovered')!;

  //Iniciando com Loading
  loadingAnimation({ isFetching: true, querySelector: '#loading' });

  //Fazendo requisição a api
  const covidData = await getSummary();

  //Removendo loading com o retorno da api
  if (Object.values(covidData).length > 0) {
    loadingAnimation({ isFetching: false, querySelector: '#loading' });
    createPieChart(covidData.Global);
    createBarChart(covidData.Countries);
  }

  //Adicionando dados globais da covid aos KPI's
  totalConfirmed.innerText = covidData.Global.TotalConfirmed.toLocaleString();
  totalDeaths.innerText = covidData.Global.TotalDeaths.toLocaleString();
  totalRecovered.innerText = covidData.Global.TotalRecovered.toLocaleString();

  //Gráficos
  function createPieChart({
    NewConfirmed,
    NewDeaths,
    NewRecovered,
  }: GetSummary['Global']) {
    const ctx = document.querySelector<HTMLCanvasElement>('#chart_pie')!;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Confirmados', 'Mortes', 'Recuperados'],
        datasets: [
          {
            data: [NewConfirmed, NewDeaths, NewRecovered],
            backgroundColor: [
              'rgba(75, 192, 192, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 206, 86, 0.5)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribuição de Novos Casos',
            font: {
              size: 16,
            },
          },
        },
      },
    });
  }

  function createBarChart(Countries: GetSummary['Countries']) {
    const ctx = document.querySelector<HTMLCanvasElement>('#chart_bar')!;
    const top10CountriesDeaths = Countries.sort((a, b) => b.TotalDeaths - a.TotalDeaths);
    const labels = top10CountriesDeaths.map(({ Country }) => Country).slice(0, 10);
    const data = top10CountriesDeaths.map(({ TotalDeaths }) => TotalDeaths).slice(0, 10);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            label: 'Total Mortes',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Top 10 Países por Morte',
            font: {
              size: 16,
            },
          },
        },
      },
    });
  }
})();
