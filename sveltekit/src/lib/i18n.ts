import { base } from '$app/paths';

export type Lang = 'de' | 'en';

const enPrefix = `${base}/en`;

const isEnPath = (pathname: string) => pathname === enPrefix || pathname.startsWith(`${enPrefix}/`);

export const langFromUrl = (url: URL): Lang => (isEnPath(url.pathname) ? 'en' : 'de');

/** Pathname without the `/en` prefix (still including `base`), used by the `reroute` hook. */
export const stripLangPrefix = (pathname: string) =>
	isEnPath(pathname) ? `${base}${pathname.slice(enPrefix.length)}` || '/' : pathname;

/** Turns a path built with `resolve()` into the path for the given language. */
export const localize = (path: string, lang: Lang) => {
	const unprefixed = stripLangPrefix(path);
	if (lang === 'de') return unprefixed;
	const rest = unprefixed.slice(base.length);
	return rest === '' || rest === '/' ? enPrefix : `${enPrefix}${rest}`;
};

/** Same page in the other language (keeps the query string). */
export const alternatePath = (url: URL) =>
	localize(url.pathname, langFromUrl(url) === 'en' ? 'de' : 'en') + url.search;

/** `const t = tr(lang); t('Deutsch', 'English')` */
export const tr =
	(lang: Lang | undefined) =>
	(de: string, en: string) =>
		lang === 'en' ? en : de;

/** Messages shared by several server routes. */
export const msg = (lang: Lang) => {
	const t = tr(lang);
	return {
		invalidSpaceId: t('CollabSpace-ID ist ungültig.', 'CollabSpace ID is invalid.'),
		spaceIdNumber: t('CollabSpace-ID muss eine Zahl sein.', 'CollabSpace ID must be a number.'),
		spaceIdPositive: t('CollabSpace-ID muss eine positive Zahl sein.', 'CollabSpace ID must be a positive number.'),
		spaceNotFound: t('CollabSpace nicht gefunden.', 'CollabSpace not found.'),
		invalidChatId: t('CollabChat-ID ist ungültig.', 'CollabChat ID is invalid.'),
		chatNotFound: t('CollabChat nicht gefunden.', 'CollabChat not found.'),
		adminPwRequired: t('Verwaltungspasswort ist erforderlich.', 'Admin password is required.'),
		noAdminSession: t('Keine Verwaltungssitzung gefunden.', 'No admin session found.'),
		invalidAdminSession: t('Keine gültige Verwaltungssitzung gefunden.', 'No valid admin session found.'),
		invalidChatSession: t('Keine gültige Chat-Sitzung gefunden.', 'No valid chat session found.'),
		admin: t('Verwaltung', 'Admin')
	};
};
