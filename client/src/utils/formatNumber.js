/**
 * Locale-aware number formatting shared by the dashboard, profile and pagination text.
 * Uses the visitor's locale for separators instead of hardcoded "," or ".".
 */
const integerFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const compactFormat = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const oneDecimalFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 1234 -> "1,234", 12345 -> "12.3K" */
export const formatCount = (value) => {
    const n = Number(value) || 0;
    return n >= 10000 ? compactFormat.format(n) : integerFormat.format(n);
};

/** Whole number with locale separators: 1234567 -> "1,234,567" */
export const formatInteger = (value) => integerFormat.format(Number(value) || 0);

/** One fixed decimal place: 47.25 -> "47.3" */
export const formatOneDecimal = (value) => oneDecimalFormat.format(Number(value) || 0);
