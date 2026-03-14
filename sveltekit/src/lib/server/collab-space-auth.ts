import { error } from '@sveltejs/kit';
import prisma from '$lib/server/db';

const collabSpaceAuthArgs = {
	select: {
		id: true,
		student_pw: true,
		password: true,
		question: true,
		api_key: true,
		base_url: true,
		model: true,
		system_prompt: true
	}
} satisfies Omit<Parameters<typeof prisma.collabSpace.findUnique>[0], 'where'>;

type CollabSpaceAuth = NonNullable<Awaited<ReturnType<typeof getCollabSpaceAuth>>>;

export const getCollabSpaceAuth = async (collabSpaceId: number) => {
	const collabSpace = await prisma.collabSpace.findUnique({
		where: { id: collabSpaceId },
		...collabSpaceAuthArgs
	});

	if (!collabSpace) {
		throw error(404, 'CollabSpace not found.');
	}

	return collabSpace;
};

export const isStudentCookieValid = (
	collabSpace: Pick<CollabSpaceAuth, 'student_pw'>,
	cookieValue: string | undefined
) => Boolean(cookieValue && collabSpace.student_pw && collabSpace.student_pw === cookieValue);

export const isAdminCookieValid = (
	collabSpace: Pick<CollabSpaceAuth, 'password'>,
	cookieValue: string | undefined
) => Boolean(cookieValue && collabSpace.password && collabSpace.password === cookieValue);

export const getCollabSpaceLoginState = async (
	collabSpaceId: number,
	studentCookieValue: string | undefined,
	adminCookieValue: string | undefined
) => {
	const collabSpace = await getCollabSpaceAuth(collabSpaceId);
	const isAdmin = isAdminCookieValid(collabSpace, adminCookieValue);
	const isStudentLoggedIn = isAdmin || isStudentCookieValid(collabSpace, studentCookieValue);

	return {
		collabSpace,
		isAdmin,
		isStudentLoggedIn
	};
};

export const validateStudentCookie = async (
	collabSpaceId: number,
	studentCookieValue: string | undefined,
	adminCookieValue: string | undefined
) => {
	const { collabSpace, isStudentLoggedIn } = await getCollabSpaceLoginState(
		collabSpaceId,
		studentCookieValue,
		adminCookieValue
	);

	if (isStudentLoggedIn) {
		return collabSpace;
	}
	if (!studentCookieValue && !adminCookieValue) {
		throw error(401, 'Missing student or admin cookie.');
	}

	throw error(403, 'Invalid student or admin cookie.');
};

export const validateAdminCookie = async (
	collabSpaceId: number,
	adminCookieValue: string | undefined
): Promise<boolean> => {
	if (!adminCookieValue) return false;
	const collabSpace = await getCollabSpaceAuth(collabSpaceId);
	return isAdminCookieValid(collabSpace, adminCookieValue);
};
