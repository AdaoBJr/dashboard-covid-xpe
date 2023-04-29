export const saveInLocalStorage = <T>(key: string, data: T) =>
  localStorage.setItem(key, JSON.stringify(data));

export const getFromLocalStorage = <T>(key: string, defaultValue?: T) => {
  let storagedItem = localStorage.getItem(key);
  if (storagedItem === 'undefined' || !storagedItem) storagedItem = null;
  return defaultValue || (JSON.parse(storagedItem as string) as T);
};

export const clearLocalStorage = (key: string) => localStorage.removeItem(key);
