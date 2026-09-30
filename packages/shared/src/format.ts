export const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Prices are tax-inclusive; returns the tax portion of a line. */
export const lineTax = (qty: number, unit: number, rate: number) =>
  round2((qty * unit * rate) / (1 + rate));
