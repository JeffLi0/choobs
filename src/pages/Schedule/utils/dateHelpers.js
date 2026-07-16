export function getShortDayOfWeek(displayDate, date) {
	const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
	const currentDate = new Date(displayDate);
	currentDate.setDate(date);
	return daysOfWeek[currentDate.getDay()];
}

export function getDateWithWrap(displayDate, date) {
	const currentMonth = displayDate.getMonth();
	const lastDayOfLastMonth = new Date(
		displayDate.getFullYear(),
		currentMonth,
		0,
	).getDate();
	const lastDayOfThisMonth = new Date(
		displayDate.getFullYear(),
		currentMonth + 1,
		0,
	).getDate();

	if (date < 1) {
		return lastDayOfLastMonth + date;
	} else if (date > lastDayOfThisMonth) {
		return date - lastDayOfThisMonth;
	} else {
		return date;
	}
}

export function isWeekend(displayDate, date) {
	const currentDate = new Date(displayDate);
	currentDate.setDate(date);
	const dayOfWeek = currentDate.getDay();
	return dayOfWeek === 0 || dayOfWeek === 6;
}

export function isWeekday(date) {
	const day = date.getDay();
	return day !== 0 && day !== 6;
}

export function isMobileDevice() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent,
	);
}
