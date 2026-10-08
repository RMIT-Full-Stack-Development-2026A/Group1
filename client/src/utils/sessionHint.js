// A hint, kept in localStorage, that this browser had a signed-in session the last time we looked.
//
// The app checks the session with the API on every full page load. Blocking the whole app on that check makes
// every first paint wait for the backend, which on a sleeping host can take many seconds. With the hint, only a
// returning, probably-signed-in visitor waits for the check; a first-time visitor sees the page at once. The hint
// is never trusted for access: the server still decides, this only decides whether to show a loading screen.

const KEY = 'ttt:session-hint';

export const hasSessionHint = () => {
    try {
        return localStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
};

export const setSessionHint = () => {
    try {
        localStorage.setItem(KEY, '1');
    } catch {
        // storage can be unavailable (private mode, blocked): the app works the same, just waits on the check
    }
};

export const clearSessionHint = () => {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // see above
    }
};
