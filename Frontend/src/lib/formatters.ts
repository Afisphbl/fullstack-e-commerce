export const formatCurrency = (
  amount: number | string,
  currency: string = "ETB"
) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency} 0.00`;

  // Ethiopian format usually has the symbol first followed by a space
  return `${currency} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
