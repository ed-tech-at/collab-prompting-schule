import type { Reroute } from '@sveltejs/kit';
import { stripLangPrefix } from '$lib/i18n';

// `/en/...` is served by the same routes as `/...`; the language is read from the URL.
export const reroute: Reroute = ({ url }) => stripLangPrefix(url.pathname);
