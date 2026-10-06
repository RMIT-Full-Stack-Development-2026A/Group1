/** Search inputs are literal substrings, never client-supplied regular expressions. */
export const escapeSearch = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const invalidDate = () => ({
    statusCode: 400, error: 'INVALID_DATE_RANGE',
    message: 'Use valid ISO dates, with from no later than to.'
});

export const parseDateRange = (from, to) => {
    const parse = (value, endOfDay) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) throw invalidDate();
        // Reject normalized invalid calendar dates such as February 30.
        const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
        if (isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)) throw invalidDate();
        const date = new Date(value);
        if (isNaN(date.getTime())) throw invalidDate();
        // A date-only upper bound includes the full UTC calendar day. ISO times
        // retain the caller's exact timezone offset and millisecond boundary.
        if (value.length === 10 && endOfDay) date.setUTCHours(23, 59, 59, 999);
        return date;
    };
    const range = {};
    if (from) range.$gte = parse(from, false);
    if (to) range.$lte = parse(to, true);
    if (range.$gte && range.$lte && range.$gte > range.$lte) throw invalidDate();
    return range;
};
