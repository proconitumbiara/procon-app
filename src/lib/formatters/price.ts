const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const sanitizeMonetaryInput = (value: string) =>
  value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

export const reaisToCentavos = (value: number | string) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const numericValue =
    typeof value === "string"
      ? Number.parseFloat(sanitizeMonetaryInput(value))
      : value;

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return Math.round(numericValue * 100);
};

export const centavosToReaisNumber = (value?: number | null) => {
  if (!value) {
    return 0;
  }
  return value / 100;
};

export const formatCentavosToBRL = (value?: number | null) =>
  BRL_FORMATTER.format(centavosToReaisNumber(value));


