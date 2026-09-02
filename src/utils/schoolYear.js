// A school year is labeled by the calendar year in which it ENDS: school year
// 2026 runs from late August 2025 through June 2026. This matches the export
// window in CalendarExport (Aug 20 of the prior year → June 30 of this one) and
// the year Aspen uses to name its schedule report.
//
// The rollover happens in July: through June 30 we're still in the school year
// that's ending, and from July onward we point at the upcoming one so summer
// schedule setup targets the correct year. This lets the app track the current
// year automatically instead of needing a hardcoded value bumped each summer.
export function getCurrentSchoolYear(date = new Date()) {
	const year = date.getFullYear();
	const month = date.getMonth(); // 0-indexed; 6 = July
	return month >= 6 ? year + 1 : year;
}

// The four graduation years currently enrolled in high school, newest first.
// Lexington student emails are formatted as <2-digit grad year>stu<3 digits>, so
// these gate who can register. The window rolls forward in June — as soon as
// summer starts — when the incoming freshman class (which begins that fall)
// gains access. Example: from June 2027, the class of 2031 can make accounts,
// and the just-graduated class of 2027 rolls off. This keeps registration open
// to exactly the four in-school classes without a hardcoded list to bump each
// year. The June rollover is intentionally a month ahead of the July school-year
// rollover in getCurrentSchoolYear.
export function getValidGradYears(date = new Date()) {
	const year = date.getFullYear();
	const month = date.getMonth(); // 0-indexed; 5 = June
	// The youngest class graduates four years after the fall it enters; from June
	// on we point at the class starting the coming fall.
	const newest = year + (month >= 5 ? 4 : 3);
	return [newest, newest - 1, newest - 2, newest - 3];
}

// Regex matching a valid Lexington student email for the current registration
// window, e.g. /^(30|29|28|27)stu\d{3}@lexingtonma\.org$/ during 2026-27.
export function getStudentEmailRegex(date = new Date()) {
	const years = getValidGradYears(date)
		.map((gradYear) => String(gradYear).slice(2))
		.join("|");
	return new RegExp(`^(${years})stu\\d{3}@lexingtonma\\.org$`);
}
