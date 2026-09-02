import axios from "axios";
import { CALENDAR_ID } from "../Schedule/hooks/useCalendarEvents";
import { looksLikeBlockCode } from "../Schedule/utils/blockLogic";

const GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

// Finds the soonest date (today or later) that actually has class blocks, so the
// logged-out landing preview works year-round — on a weekend, holiday, or over
// summer it rolls forward to the next real school day instead of showing an
// empty "No School" card. One ranged calendar request (ordered by start time),
// so the first academic timed event it sees is on the earliest school day.
// Returns a Date pinned to local midnight, or null if none within the window.
export async function findNextScheduleDate(from = new Date(), windowDays = 60) {
	const start = new Date(from);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + windowDays);

	try {
		const response = await axios.get(
			`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
			{
				params: {
					calendarId: CALENDAR_ID,
					singleEvents: true,
					orderBy: "startTime",
					timeZone: "America/New_York",
					maxResults: 2500,
					timeMin: start.toISOString(),
					timeMax: end.toISOString(),
					key: GOOGLE_CALENDAR_API_KEY,
				},
			},
		);

		const items = response.data.items || [];
		for (const event of items) {
			if (event.start?.dateTime && looksLikeBlockCode(event.summary || "")) {
				const date = new Date(event.start.dateTime);
				date.setHours(0, 0, 0, 0);
				return date;
			}
		}
		return null;
	} catch (error) {
		console.error("Error finding next schedule date:", error);
		return null;
	}
}
