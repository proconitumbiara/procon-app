const formatBrazilianPhone = (digits: string) => {
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(
      3,
      7,
    )}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return digits;
};

export const normalizePhone = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return value.replace(/\D/g, "").slice(0, 11);
};

export const formatPhone = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return formatBrazilianPhone(normalizePhone(value));
};

export const normalizeAddress = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s,/, ",")
    .replace(/,\s*/g, ", ");
};


