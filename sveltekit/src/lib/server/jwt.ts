import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { SESSION_JWT_SECRET } from '$env/static/private';
import { redirect, type Cookies } from '@sveltejs/kit';
import { resolve } from '$app/paths';

const enc = new TextEncoder();
const jwtSecret = enc.encode(SESSION_JWT_SECRET);

export interface SessionPayload {
	userId: string;
	iat?: number;
	exp?: number;
}

function loginPath(url: URL) {
	const loginResolved = resolve('/');
	return new URL(loginResolved, url).pathname;
}

export async function requireValidJwt(
	cookies: Cookies,
	url: URL,
	cookieName = 'jwt'
): Promise<SessionPayload> {
	const login = loginPath(url);
	if (!cookies) throw redirect(302, login);
	const token = cookies.get(cookieName);
	if (!token) throw redirect(302, login);

	try {
		const { payload } = await jwtVerify(token, jwtSecret, { algorithms: ['HS256'] });
		return payload as unknown as SessionPayload;
	} catch {
		throw redirect(302, login);
	}
}

export async function checkJwt(cookies: Cookies, cookieName = 'jwt'): Promise<SessionPayload | null> {
	const token = cookies?.get(cookieName);
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, jwtSecret, { algorithms: ['HS256'] });
		return payload as unknown as SessionPayload;
	} catch {
		return null;
	}
}

export async function createSessionJWT(userId: string, maxAgeSec = 3600): Promise<string> {
	const claims: SessionPayload = {
		userId
	};

	return await new SignJWT(claims as unknown as JWTPayload)
		.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
		.setSubject(claims.userId)
		.setIssuedAt()
		.setExpirationTime(`${maxAgeSec}s`)
		.sign(jwtSecret);
}

export async function createJwt<T extends JWTPayload>(payload: T, maxAgeSec?: number): Promise<string> {
	const signer = new SignJWT(payload).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setIssuedAt();
	if (typeof maxAgeSec === 'number') {
		signer.setExpirationTime(`${maxAgeSec}s`);
	}
	return await signer.sign(jwtSecret);
}

export async function readJwt<T extends JWTPayload>(token: string): Promise<T | null> {
	try {
		const { payload } = await jwtVerify(token, jwtSecret, { algorithms: ['HS256'] });
		return payload as T;
	} catch {
		return null;
	}
}

export async function getJwtCookie<T extends JWTPayload>(
	cookies: Cookies,
	cookieName: string
): Promise<T | null> {
	const token = cookies.get(cookieName);
	if (!token) return null;
	return await readJwt<T>(token);
}

export async function setJwtCookie<T extends JWTPayload>(
	cookies: Cookies,
	cookieName: string,
	payload: T
) {
	const maxAgeSec = 60 * 60 * 24 * 8;
	
	const token = await createJwt(payload, maxAgeSec);
	cookies.set(cookieName, token, {
		path: resolve('/'),
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		...(typeof maxAgeSec === 'number' ? { maxAge: maxAgeSec } : {})
	});
}

export function clearJwtCookie(cookies: Cookies, cookieName: string, path = '/') {
	cookies.delete(cookieName, { path });
}
