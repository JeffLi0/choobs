import styles from "./Schedule.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Artwork from "../../components/Artwork/Artwork";
import ScheduleHeader from "./components/ScheduleHeader";
import EventRow from "./components/EventRow";
import FullDayBanner from "./components/FullDayBanner";

import useDisplayDate from "./hooks/useDisplayDate";
import useCalendarEvents from "./hooks/useCalendarEvents";
import useScheduleData from "./hooks/useScheduleData";
import useSwipeNavigation from "./hooks/useSwipeNavigation";
import useIsMobile from "./hooks/useIsMobile";
import useNow from "./hooks/useNow";

import {
	filterVisibleEvents,
	sortEventsByStartTime,
	applyHalfDayShift,
} from "./utils/blockLogic";

function Schedule(props) {
	const isMobile = useIsMobile();
	const now = useNow();
	const highlighted = useRef();
	const [blocksRendered, setBlocksRendered] = useState([]);

	const { uid, scheduleData } = useScheduleData(props.uid);

	// Breaks the circular hook dependency: useDisplayDate needs a
	// "reset before changing date" callback, but that reset touches state
	// owned by useCalendarEvents, which itself needs displayDate.
	const onBeforeChangeRef = useRef(() => {});
	const onBeforeChange = useCallback(() => onBeforeChangeRef.current(), []);

	const { displayDate, handleDateChange, jumpToToday, changeToDate } =
		useDisplayDate({ onBeforeChange });

	const { events, setEvents, loading, setLoading } = useCalendarEvents(
		displayDate,
		scheduleData,
	);

	onBeforeChangeRef.current = () => {
		setLoading(true);
		setEvents([]);
		setBlocksRendered([]);
	};

	useEffect(() => {
		setBlocksRendered([]);
	}, [displayDate]);

	const { swipeOffset, swipeEnded, handleTouchStart, handleTouchMove, handleTouchEnd } =
		useSwipeNavigation(handleDateChange);

	const fullDayEvents = useMemo(
		() => events.filter((event) => !event.start.dateTime && !event.end.dateTime),
		[events],
	);
	const fullDayEventNames = useMemo(
		() => fullDayEvents.map((event) => event.summary),
		[fullDayEvents],
	);
	const currentDay = fullDayEvents.length > 0 ? fullDayEvents[0].summary : "";

	const visibleEvents = useMemo(() => {
		if (!scheduleData) return [];

		const filtered = filterVisibleEvents(events, {
			scheduleData,
			currentDay,
			fullDayEvent: fullDayEventNames,
			displayDate,
			blocksRendered,
		});
		const sorted = sortEventsByStartTime(filtered);
		return applyHalfDayShift(
			sorted,
			events,
			scheduleData,
			displayDate,
			fullDayEventNames,
		);
	}, [scheduleData, events, currentDay, fullDayEventNames, displayDate, blocksRendered]);

	useEffect(() => {
		setTimeout(() => {
			if (highlighted && highlighted.current) {
				highlighted.current.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}
		}, 100);
	}, [displayDate, highlighted, loading]);

	return (
		<>
			<ScheduleHeader
				displayDate={displayDate}
				isMobile={isMobile}
				highlightedRef={highlighted}
				onNavigate={handleDateChange}
				onJumpToToday={jumpToToday}
				onDatePickerChange={changeToDate}
			/>
			<div
				className={isMobile ? styles.schedule : styles.desktopSchedule}
				style={
					isMobile
						? {
								translate: `${swipeOffset}px`,
								...(swipeEnded && { transition: "all 0.2s" }),
							}
						: null
				}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<FullDayBanner
					displayDate={displayDate}
					loading={loading}
					events={events}
					fullDayEvents={fullDayEvents}
				/>

				{!loading &&
					(!scheduleData || scheduleData.length === 0) &&
					props.uid === uid && (
						<Link to="/settings" className={styles.noSchedule}>
							<h4>Finish setting up your account!</h4>
							<p>
								Head over to <span>Settings</span> to add your
								schedule.
							</p>
						</Link>
					)}

				<div className={styles.ul}>
					{loading ? (
						<div className="lds-ring">
							<div></div>
							<div></div>
							<div></div>
							<div></div>
						</div>
					) : (
						visibleEvents.map((event) => (
							<EventRow
								key={event.id}
								event={event}
								scheduleData={scheduleData}
								fullDayEvent={fullDayEventNames}
								currentDay={currentDay}
								blocksRendered={blocksRendered}
								now={now}
								highlightedRef={highlighted}
							/>
						))
					)}
					<Artwork
						loading={loading}
						events={events}
						fullDayEvent={fullDayEventNames}
					/>
					{currentDay &&
						currentDay.includes("Half Day") &&
						!loading && (
							<div className={styles.subtext}>
								<span>
									<b>1st Lunch:</b> Math & Language Buildings
								</span>
								<span>
									<b>2nd Lunch:</b> Main & Science Buildings
								</span>
							</div>
						)}
				</div>
			</div>
		</>
	);
}

export default Schedule;
