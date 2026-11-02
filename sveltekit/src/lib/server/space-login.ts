import { fail } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import prisma from '$lib/server/db';
import { setJwtCookie } from '$lib/server/jwt';
import { msg, tr, type Lang } from '$lib/i18n';

type LoginResult =
	| { ok: true; collabSpaceId: number }
	| { ok: false; failure: ReturnType<typeof fail> };

type LoginParams = {
	lang: Lang;
	request: Request;
	cookies: Cookies;
	forcedCollabSpaceId?: number;
};

export const loginStudentForSpace = async ({
	lang,
	request,
	cookies,
	forcedCollabSpaceId
}: LoginParams): Promise<LoginResult> => {
	const data = await request.formData();
	const studentPw = data.get('student_pw');
	const username = data.get('username');
	const collabSpaceIdRaw = forcedCollabSpaceId ?? Number(data.get('collabSpaceId'));

	// if (typeof studentPw !== 'string' || !studentPw) {
		// return {
			// ok: false,
			// failure: fail(400, { success: false, message: 'Student password is required.' })
		// };
	// }

	const collabSpaceId = Number(collabSpaceIdRaw);
	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		return {
			ok: false,
			failure: fail(400, { success: false, message: msg(lang).spaceIdNumber })
		};
	}

	const collabSpace = await prisma.collabSpace.findFirst({
		where: { id: collabSpaceId, toDelete: null },
		select: { id: true, student_pw: true }
	});
	if (!collabSpace) {
		return { ok: false, failure: fail(404, { success: false, message: msg(lang).spaceNotFound }) };
	}
	if (!collabSpace.student_pw || collabSpace.student_pw !== studentPw) {
		return { ok: false, failure: fail(401, { success: false, message: tr(lang)('Teilnahmecode falsch.', 'Wrong participation code.') }) };
	}

	await setJwtCookie(cookies, `studentPw${collabSpaceId}`, {
		studentPw,
		username: typeof username === 'string' ? username : undefined
	});

	return { ok: true, collabSpaceId };
};
