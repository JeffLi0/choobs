import { useEffect, useState } from "react";
import axios from "axios";

export const CALENDAR_ID =
	"lexingtonma.org_qud45cvitftvgc317tsd2vqctg@group.calendar.google.com";
const GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const CACHE_SIZE = 10;

// Fetches the school calendar's events for `displayDate`, backed by a small
// sessionStorage LRU cache (`events` + `cacheOrder` keys) so day-to-day
// navigation doesn't re-fetch. `scheduleData` is only read to decide whether
// `loading` can flip off once both the calendar and Firestore data are ready.
export default function useCalendarEvents(displayDate, scheduleData) {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			const dateKey = displayDate.toISOString().split("T")[0];
			const todayKey = new Date().toISOString().split("T")[0];

			const cachedData = sessionStorage.getItem("events");
			const cacheOrder = JSON.parse(
				sessionStorage.getItem("cacheOrder") || "[]",
			);
			let parsedCache = cachedData ? JSON.parse(cachedData) : {};

			if (parsedCache[dateKey]) {
				setEvents(parsedCache[dateKey]);
				if (scheduleData) {
					setLoading(false);
				}
			}

			try {
				const response = await axios.get(
					`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
					{
						params: {
							calendarId: CALENDAR_ID,
							singleEvents: true,
							timeZone: "America/New_York",
							maxResults: 20,
							timeMin: `${dateKey}T04:00:00-04:00`,
							timeMax: `${dateKey}T23:59:59-04:00`,
							key: GOOGLE_CALENDAR_API_KEY,
						},
					},
				);

				const currentDayEvents = response.data.items.filter((event) => {
					const eventStartDate = new Date(
						event.start.dateTime || event.start.date,
					);
					const isFullDayEvent =
						!event.start.dateTime && !event.end.dateTime;

					return (
						(eventStartDate.getDate() === displayDate.getDate() &&
							eventStartDate.getMonth() ===
								displayDate.getMonth() &&
							eventStartDate.getFullYear() ===
								displayDate.getFullYear()) ||
						isFullDayEvent
					);
				});

				if (
					JSON.stringify(currentDayEvents) !==
					JSON.stringify(parsedCache[dateKey])
				) {
					parsedCache[dateKey] = currentDayEvents;

					const updatedCacheOrder = [
						...(dateKey === todayKey
							? [dateKey]
							: [todayKey, dateKey]),
						...cacheOrder.filter(
							(date) => date !== dateKey && date !== todayKey,
						),
					].slice(0, CACHE_SIZE);
					sessionStorage.setItem(
						"cacheOrder",
						JSON.stringify(updatedCacheOrder),
					);

					Object.keys(parsedCache).forEach((date) => {
						if (!updatedCacheOrder.includes(date)) {
							delete parsedCache[date];
						}
					});

					sessionStorage.setItem(
						"events",
						JSON.stringify(parsedCache),
					);
					setEvents(currentDayEvents);
					if (scheduleData) {
						setLoading(false);
					}
				}
			} catch (error) {
				console.error("Error fetching calendar events:", error);
				if (parsedCache[dateKey] && scheduleData) {
					setLoading(false);
				}
			}
		};

		fetchData();
	}, [displayDate, scheduleData]);

	return { events, setEvents, loading, setLoading };
}
