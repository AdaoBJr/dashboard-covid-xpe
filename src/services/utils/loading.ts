import loadingImg from '../../assets/icons/loading.png';

export const loadingAnimation = ({
  isFetching = false,
  querySelector,
}: {
  isFetching: boolean;
  querySelector: string;
}) => {
  if (isFetching) {
    const loading = document.querySelector(querySelector)!;
    loading.innerHTML = `
      <img class="animate-spin" src=${loadingImg} />
      <p class="font-semibold">Loading...</p>
      `;
  } else {
    const loading = document.querySelector('#loading')!;
    loading.innerHTML = ``;
  }
};
