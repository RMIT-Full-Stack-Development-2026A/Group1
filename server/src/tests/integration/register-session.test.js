import request from 'supertest';

let app;

const payload = (n) => ({
    username: `reguser${n}`,
    email: `reguser${n}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    country: 'VN'
});

const sessionCookies = (res) => (res.headers['set-cookie'] ?? []).filter((c) => c.startsWith('access_token='));
const hasAttr = (c, name) => c.split(';').map((p) => p.trim().toLowerCase()).includes(name.toLowerCase());
const cookieHeader = (res) => sessionCookies(res).filter((c) => !/^access_token=;/.test(c)).map((c) => c.split(';')[0]).join('; ');

describe('Register starts a session', () => {
    beforeAll(async () => {
        process.env.JWT_SECRET = 'test_secret';
        ({ default: app } = await import('../../app.js'));
    });

    it('sets the session cookie on register, with the production attributes', async () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        let res;
        try {
            res = await request(app).post('/api/v1/auth/register').send(payload(1));
        } finally {
            process.env.NODE_ENV = previous;
        }
        expect(res.statusCode).toBe(201);

        const current = sessionCookies(res).find((c) => !/^access_token=;/.test(c));
        expect(current).toBeDefined();
        for (const attr of ['HttpOnly', 'Secure', 'SameSite=None', 'Partitioned', 'Path=/']) {
            expect(hasAttr(current, attr)).toBe(true);
        }
    });

    it('lets the new user pass check-auth with the cookie register returned', async () => {
        const res = await request(app).post('/api/v1/auth/register').send(payload(2));
        expect(res.statusCode).toBe(201);
        expect(sessionCookies(res)).toHaveLength(1);

        const check = await request(app).get('/api/v1/auth/check-auth').set('Cookie', cookieHeader(res));
        expect(check.statusCode).toBe(200);
        expect(check.body.data.user).not.toBeNull();
        expect(String(check.body.data.user.id)).toBe(String(res.body.data.id));
    });

    it('registers as a plain player whatever role the request asks for', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({ ...payload(3), role: 'ADMIN', isPremium: true });
        expect(res.statusCode).toBe(201);
        const check = await request(app).get('/api/v1/auth/check-auth').set('Cookie', cookieHeader(res));
        expect(check.body.data.user.role).toBe('PLAYER');
        expect(check.body.data.user.isPremium).toBe(false);
    });

    it('sets no cookie when registration is rejected', async () => {
        await request(app).post('/api/v1/auth/register').send(payload(4));
        const duplicate = await request(app).post('/api/v1/auth/register').send(payload(4));
        expect(duplicate.statusCode).toBeGreaterThanOrEqual(400);
        expect(sessionCookies(duplicate)).toHaveLength(0);
    });

    it('still lets the user log in afterwards, which replaces the register session', async () => {
        const reg = await request(app).post('/api/v1/auth/register').send(payload(5));
        const login = await request(app).post('/api/v1/auth/login').send({ identifier: payload(5).email, password: 'Password123!' });
        expect(login.statusCode).toBe(200);

        const fresh = await request(app).get('/api/v1/auth/check-auth').set('Cookie', cookieHeader(login));
        expect(String(fresh.body.data.user.id)).toBe(String(reg.body.data.id));

        // The login supersedes the register session, exactly as a second login does.
        const stale = await request(app).get('/api/v1/auth/check-auth').set('Cookie', cookieHeader(reg));
        expect(stale.body.data.user).toBeNull();
    });
});
