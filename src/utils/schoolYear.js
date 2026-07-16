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
