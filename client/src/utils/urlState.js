/**
 * Helpers for keeping list filters in the URL query string, so a filtered or paginated view
 * can be bookmarked, shared and survives a reload.
 */

/** String param with a fallback when it is absent. */
export const readParam = (params, key, fallback = "") => params.get(key) ?? fallback;

/** Positive integer param with a fallback when it is absent or invalid. */
export const readPositiveInt = (params, key, fallback = 1) => {
    const value = parseInt(params.get(key), 10);
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

/**
 * Writes `{ key: [value, defaultValue] }` into the query string. A value equal to its default
 * (or empty) removes the key so the URL stays short. Uses replace so filtering does not
 * flood the browser history.
 */
export const writeParams = (setSearchParams, entries) => {
    setSearchParams(
        (previous) => {
            const next = new URLSearchParams(previous);
            Object.entries(entries).forEach(([key, [value, defaultValue]]) => {
                if (value === defaultValue || value === "" || value === null || value === undefined) {
                    next.delete(key);
                } else {
                    next.set(key, String(value));
                }
            });
            return next.toString() === previous.toString() ? previous : next;
        },
        { replace: true }
    );
};
