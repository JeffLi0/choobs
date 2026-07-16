import { useCallback, useEffect, useState } from "react";

function readInitialDisplayDate() {
	if (sessionStorage.getItem("displayDate")) {
		return new Date(sessionStorage.getItem("displayDate"));
	} else {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		sessionStorage.setItem("displayDate", date);
		return date;
	}
}

// Owns `displayDate` plus the concerns tied directly to it: persistence,
// keyboard navigation, and the midnight rollover timer. `onBeforeChange` lets
// the orchestrator eagerly reset events/currentDay/blocksRendered in the same
// tick a date change is requested, matching the original's UX timing.
export default function useDisplayDate({ onBeforeChange } = {}) {
	const [displayDate, setDisplayDateState] = useState(readInitialDisplayDate);

	const setDisplayDate = useCallback((newDate) => {
		sessionStorage.setItem("displayDate", newDate);
		setDisplayDateState(newDate);
	}, []);

	const handleDateChange = useCallback(
		(increment) => {
			onBeforeChange?.();
			const newDate = new Date(displayDate);
			newDate.setDate(newDate.getDate() + increment);
			setDisplayDate(newDate);
		},
		[displayDate, onBeforeChange, setDisplayDate],
	);

	const jumpToToday = useCallback(() => {
		onBeforeChange?.();
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		setDisplayDate(date);
	}, [onBeforeChange, setDisplayDate]);

	const changeToDate = useCallback(
		(date) => {
			onBeforeChange?.();
			setDisplayDate(date);
		},
		[onBeforeChange, setDisplayDate],
	);

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.target.tagName.toLowerCase() !== "textarea") {
				if (event.key === "ArrowRight") {
					handleDateChange(1);
				}
				if (event.key === "ArrowLeft") {
					handleDateChange(-1);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	});

	useEffect(() => {
		if (displayDate.getTime() !== new Date().setHours(0, 0, 0, 0)) {
			const interval = setInterval(
				() => {
					const date = new Date();
					date.setHours(0, 0, 0, 0);
					setDisplayDate(date);
				},
				4 * 60 * 60 * 1000,
			); // 4 hours in milliseconds

			return () => {
				clearInterval(interval);
			};
		}
	}, [displayDate, setDisplayDate]);

	return { displayDate, handleDateChange, jumpToToday, changeToDate };
}
