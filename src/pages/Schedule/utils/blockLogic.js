export const LAST_BLOCKS = ["F1", "D2", "C2", "F3", "D4", "C4"];

export function isHalfDaySchedule(fullDayEvent) {
	return fullDayEvent.some((element) => element.includes("Half Day"));
}

export function looksLikeBlockCode(summary) {
	return /[A-Za-z]\$?[0-9]/g.test(summary);
}

export function isHighlightedEvent(event, now) {
	const startTime = new Date(event.start.dateTime);
	const endTime = new Date(event.end.dateTime);
	const currentTime = now;

	if (
		currentTime.getHours() < 8 ||
		(currentTime.getHours() === 8 && currentTime.getMinutes() <= 30)
	) {
		return (
			currentTime >= startTime.getTime() - 30 * 60 * 1000 &&
			currentTime <= endTime.getTime()
		);
	} else {
		if (event.summary.includes("Lunch")) {
			return (
				currentTime >= startTime.getTime() &&
				currentTime <= endTime.getTime()
			);
		} else {
			return (
				currentTime >= startTime.getTime() - 5 * 60 * 1000 &&
				currentTime <= endTime.getTime()
			);
		}
	}
}

export function findMatchingScheduleData(event, scheduleData, fullDayEvent) {
	return scheduleData.find((data) => {
		if (fullDayEvent.some((element) => element === "All blocks")) {
			// On "All blocks" day, remove dollar signs from Firebase data for comparison
			const firebaseBlockWithoutDollar = data.block.replace("$", "");
			return (
				firebaseBlockWithoutDollar === event.summary ||
				data.block === event.summary
			);
		} else {
			// Regular day - exact match required
			return data.block.includes(event.summary);
		}
	});
}

export function shouldSuppressUnmatchedEvent(event, scheduleData) {
	return (
		scheduleData.length > 0 &&
		/^[CDGH]\$?[1-4]$/.test(event.summary) &&
		Object.values(scheduleData).some(
			(value) =>
				value.block === event.summary.replace(/([A-Z])(\d+)/, "$1$$$2") ||
				value.block === event.summary.replace("$", ""),
		)
	);
}

export function shouldShowLunchError(event, currentDay, blocksRendered) {
	return Boolean(
		currentDay &&
			currentDay.includes("Half Day") &&
			LAST_BLOCKS.includes(event.summary) &&
			blocksRendered.every((str) => !str.includes("Lunch")),
	);
}

// Mutates `blocksRendered` by pushing block summaries as they're encountered,
// matching the accumulator pattern the original render loop relied on.
export function filterVisibleEvents(
	events,
	{ scheduleData, currentDay, fullDayEvent, displayDate, blocksRendered },
) {
	return events.filter((event) => {
		if (event.start.dateTime && event.end.dateTime) {
			const hasHalfDay = isHalfDaySchedule(fullDayEvent);

			const matchingData = scheduleData.find((data) =>
				data.block.includes(event.summary),
			);
			if (
				matchingData &&
				!blocksRendered.includes(event.summary) &&
				new Date(event.start.dateTime).getDate() === displayDate.getDate()
			) {
				blocksRendered.push(event.summary);
			}

			if (!hasHalfDay) {
				if (
					/^Lunch \d+$/.test(event.summary) &&
					/^Day (\d+)(.*)$/.test(currentDay)
				) {
					if (
						blocksRendered.some((item) => /^(C|G)\$[1-4]$/.test(item))
					) {
						return !(
							/^Lunch \d+$/.test(event.summary) &&
							event.summary !== "Lunch 1"
						);
					} else if (
						blocksRendered.some((item) => /^(D|H)\$[1-4]$/.test(item))
					) {
						return !(
							/^Lunch \d+$/.test(event.summary) &&
							event.summary !== "Lunch 2"
						);
					} else if (blocksRendered !== 0) {
						return !(
							/^Lunch \d+$/.test(event.summary) &&
							event.summary !== "Lunch 3"
						);
					}
				} else {
					return !/^Lunch \d+$/.test(event.summary);
				}
			} else {
				if (/^Lunch \d+$/.test(event.summary)) {
					let lastBlock;
					try {
						lastBlock = events.find((e) =>
							LAST_BLOCKS.includes(e.summary),
						).summary;
					} catch {
						return false;
					}

					try {
						const lastBlockRoom = scheduleData.find(
							(e) => e.block === lastBlock,
						).classNames[1];

						if (
							lastBlockRoom > 899 ||
							lastBlockRoom < 100 ||
							lastBlockRoom === ""
						) {
							return false;
						}

						if (
							(event.summary === "Lunch 1" &&
								lastBlockRoom >= 500) ||
							(event.summary === "Lunch 2" &&
								(lastBlockRoom < 500 ||
									lastBlockRoom.toLowerCase() === "gym"))
						) {
							if (!blocksRendered.includes(event.summary)) {
								blocksRendered.push(event.summary);
							}
							return true;
						}
						return false;
					} catch {
						return false;
					}
				}
				if (!blocksRendered.includes(event.summary.replace("$", ""))) {
					blocksRendered.push(event.summary.replace("$", ""));
				}
				return event.summary.replace("$", "");
			}
		}
		return false;
	});
}

export function sortEventsByStartTime(events) {
	return [...events].sort((a, b) => {
		const startTimeA = new Date(a.start.dateTime);
		const startTimeB = new Date(b.start.dateTime);

		if (startTimeA.getTime() === startTimeB.getTime()) {
			const endTimeA = new Date(a.end.dateTime);
			const endTimeB = new Date(b.end.dateTime);
			return endTimeA - endTimeB;
		}

		return startTimeA - startTimeB;
	});
}

function atTime(displayDate, hours, minutes) {
	return new Date(
		new Date(displayDate).setHours(hours, minutes, 0, 0),
	).toISOString();
}

// Returns a new array with Lunch/last-block times overridden for half days.
// `allEvents` (unfiltered) is used to locate the last block, matching the
// original lookup; `displayEvents` (filtered + sorted) is what gets the
// override applied so list order stays identical to a normal day.
export function applyHalfDayShift(
	displayEvents,
	allEvents,
	scheduleData,
	displayDate,
	fullDayEvent,
) {
	if (
		!isHalfDaySchedule(fullDayEvent) ||
		!scheduleData ||
		scheduleData.length === 0
	) {
		return displayEvents;
	}

	try {
		const lastBlockEvent = allEvents.find((e) =>
			LAST_BLOCKS.includes(e.summary),
		);
		if (!lastBlockEvent) return displayEvents;
		const lastBlock = lastBlockEvent.summary;

		const lastBlockData = scheduleData.find((e) => e.block === lastBlock);
		if (!lastBlockData) return displayEvents;
		const lastBlockRoom = lastBlockData.classNames[1];

		if (lastBlockRoom > 899 || lastBlockRoom < 100) {
			return displayEvents;
		}

		const overrides = {};
		if (lastBlockRoom >= 500) {
			// if 1st lunch, end lunch at 11:25, start last block at 11:30
			overrides["Lunch 1"] = {
				start: atTime(displayDate, 10, 55),
				end: atTime(displayDate, 11, 25),
			};
			overrides[lastBlock] = { start: atTime(displayDate, 11, 30) };
		} else if (
			lastBlockRoom < 500 ||
			lastBlockRoom.toLowerCase() === "gym"
		) {
			// if 2nd lunch, end last block at 11:25, start lunch at 11:25
			overrides[lastBlock] = { end: atTime(displayDate, 11, 25) };
			overrides["Lunch 2"] = { start: atTime(displayDate, 11, 25) };
		}

		return displayEvents.map((event) => {
			const override = overrides[event.summary];
			if (!override) return event;
			return {
				...event,
				start: override.start
					? { ...event.start, dateTime: override.start }
					: event.start,
				end: override.end
					? { ...event.end, dateTime: override.end }
					: event.end,
			};
		});
	} catch (e) {
		console.error(e);
		return displayEvents;
	}
}
