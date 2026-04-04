export const formatCurrency = (
  value: number | string,
  currency: string,
  locale: string = 'en-US'
) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return null;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(Number(value));
};
