import dayjs from "dayjs";

export function formatCurrency(
  value: number | string,
  currency: string = "USD",
): string {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safeValue);
    } catch {
      return `$${safeValue.toFixed(2)}`;
    }
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
