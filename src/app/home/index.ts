import Chart from 'chart.js/auto';

import { loadingAnimation, useCovidApi } from '../../services';
import { GetSummary } from '../../types';
const { getSummary } = useCovidApi();

(async () => {
  // const container = document.querySelector<HTMLDivElement>('#container')!;
  const totalConfirmed =
    document.querySelector<HTMLParagraphElement>('#total_confirmed')!;
  const totalDeaths = document.querySelector<HTMLParagraphElement>('#total_deaths')!;
  const totalRecovered =
    document.querySelector<HTMLParagraphElement>('#total_recovered')!;

  //Iniciando com Loading
  loadingAnimation({ isFetching: true, querySelector: '#loading' });

  //Fazendo requisição a api
  const covidData = await getSummary();
  console.log({ covidData });

  //Removendo loading com o retorno da api
  if (Object.values(covidData).length > 0) {
    loadingAnimation({ isFetching: false, querySelector: '#loading' });
    createPieChart(covidData.Global);
  }

  //Adicionando dados globais da covid aos KPI's
  totalConfirmed.innerText = covidData.Global.TotalConfirmed.toLocaleString();
  totalDeaths.innerText = covidData.Global.TotalDeaths.toLocaleString();
  totalRecovered.innerText = covidData.Global.TotalRecovered.toLocaleString();

  //Gráficos
  function createPieChart(data: GetSummary['Global']) {
    const ctx = document.querySelector<HTMLCanvasElement>('#chart_pie')!;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Confirmados', 'Mortes', 'Recuperados'],
        datasets: [
          {
            data: [data.NewConfirmed, data.NewDeaths, data.NewRecovered],
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
    });
  }
})();
