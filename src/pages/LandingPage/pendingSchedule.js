// Local, account-free scratch copy of a user's class data, used by the
// logged-out landing page onboarding. The value shape is IDENTICAL to Firestore
// `users/{uid}.classes` — `{ blockCode: [subject, room] }` — so migrating on
// sign-up/in is a direct write with no transformation.
const KEY = "pendingSchedule";

export function getPendingSchedule() {
	try {
		return JSON.parse(localStorage.getItem(KEY)) || {};
	} catch {
		return {};
	}
}

export function setPendingBlock(block, subject, room) {
	const data = getPendingSchedule();
	data[block] = [subject, room];
	localStorage.setItem(KEY, JSON.stringify(data));
	return data;
}

export function removePendingBlock(block) {
	const data = getPendingSchedule();
	delete data[block];
	if (Object.keys(data).length === 0) {
		localStorage.removeItem(KEY);
	} else {
		localStorage.setItem(KEY, JSON.stringify(data));
	}
	return data;
}

export function clearPendingSchedule() {
	localStorage.removeItem(KEY);
}

export function hasPendingSchedule() {
	return Object.keys(getPendingSchedule()).length > 0;
}
