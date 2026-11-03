// Shared state of the admin bubble on space/chat pages: it can be minimized into
// a wrench icon in the header navigation. Remembered per browser for all spaces.
const STORAGE_KEY = 'adminPanelMinimized';

export const adminPanel = $state({ minimized: false });

export const initAdminPanel = () => {
	try {
		adminPanel.minimized = localStorage.getItem(STORAGE_KEY) === '1';
	} catch {
		adminPanel.minimized = false;
	}
};

export const setAdminPanelMinimized = (minimized: boolean) => {
	adminPanel.minimized = minimized;
	try {
		if (minimized) localStorage.setItem(STORAGE_KEY, '1');
		else localStorage.removeItem(STORAGE_KEY);
	} catch {
		// storage unavailable (private mode etc.): state only lives for this page view
	}
};
