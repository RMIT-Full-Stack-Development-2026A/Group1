import express from 'express';
import request from 'supertest';
import { generateTokenAndSetCookie, clearAccessTokenCookies } from '../../utils/token.util.js';

const appWith = (handler) => {
    const app = express();
    app.get('/', handler);
    return app;
};

const withEnv = async (env, run) => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = env;
    try { return await run(); } finally { process.env.NODE_ENV = previous; }
};

const cookies = (response) => response.headers['set-cookie'] ?? [];
const isSession = (c) => c.startsWith('access_token=');
const hasAttr = (c, name) => c.split(';').map((p) => p.trim().toLowerCase()).includes(name.toLowerCase());

describe('Session cookie attributes', () => {
    beforeAll(() => { process.env.JWT_SECRET = 'test_secret'; });

    it('is partitioned, cross-site and secure in production, and expires the unpartitioned cookie first', async () => {
        const res = await withEnv('production', () => request(appWith((req, r) => {
            generateTokenAndSetCookie(r, '507f1f77bcf86cd799439011', 'PLAYER', false, 1);
            r.end();
        })).get('/'));
        const sessionCookies = cookies(res).filter(isSession);
        expect(sessionCookies).toHaveLength(2);

        const [legacy, current] = sessionCookies;
        expect(legacy).toMatch(/^access_token=;/);
        expect(hasAttr(legacy, 'Partitioned')).toBe(false);
        expect(new Date(legacy.match(/Expires=([^;]+)/i)[1]).getTime()).toBeLessThan(Date.now());

        expect(current).not.toMatch(/^access_token=;/);
        for (const attr of ['HttpOnly', 'Secure', 'SameSite=None', 'Partitioned', 'Path=/']) {
            expect(hasAttr(current, attr)).toBe(true);
        }
        expect(current).toMatch(/Max-Age=604800/);
    });

    it('stays a plain same-site cookie outside production, where Secure and Partitioned cannot work', async () => {
        const res = await withEnv('development', () => request(appWith((req, r) => {
            generateTokenAndSetCookie(r, '507f1f77bcf86cd799439011', 'PLAYER', false, 1);
            r.end();
        })).get('/'));
        const sessionCookies = cookies(res).filter(isSession);
        expect(sessionCookies).toHaveLength(1);
        expect(hasAttr(sessionCookies[0], 'Secure')).toBe(false);
        expect(hasAttr(sessionCookies[0], 'Partitioned')).toBe(false);
        expect(hasAttr(sessionCookies[0], 'SameSite=Lax')).toBe(true);
    });

    it('clears both the partitioned and the older unpartitioned cookie on logout in production', async () => {
        const res = await withEnv('production', () => request(appWith((req, r) => {
            clearAccessTokenCookies(r);
            r.end();
        })).get('/'));
        const sessionCookies = cookies(res).filter(isSession);
        expect(sessionCookies).toHaveLength(2);
        expect(sessionCookies.every((c) => /^access_token=;/.test(c) && hasAttr(c, 'SameSite=None'))).toBe(true);
        expect(sessionCookies.filter((c) => hasAttr(c, 'Partitioned'))).toHaveLength(1);
    });
});
