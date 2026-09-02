import React from "react";
import styles from "../Schedule.module.css";
import Countdown from "./Countdown";
import {
	findMatchingScheduleData,
	shouldSuppressUnmatchedEvent,
	shouldShowLunchError,
	isHighlightedEvent,
	looksLikeBlockCode,
} from "../utils/blockLogic";

function formatTime(dateTime) {
	return new Date(dateTime)
		.toLocaleString("en-US", {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		})
		.toLowerCase();
}

function LunchErrorBanner() {
	return (
		<div className={styles.lunchError}>
			<div className={styles.warning}>
				<span className="material-symbols-rounded">&#xe000;</span>
				<span>Your lunch could not be calculated.</span>
			</div>
		</div>
	);
}

function EventRow({
	event,
	scheduleData,
	fullDayEvent,
	currentDay,
	blocksRendered,
	now,
	highlightedRef,
}) {
	const matchingData = findMatchingScheduleData(
		event,
		scheduleData,
		fullDayEvent,
	);
	const highlighted = isHighlightedEvent(event, now);
	const showLunchError = shouldShowLunchError(
		event,
		currentDay,
		blocksRendered,
	);

	if (!matchingData && shouldSuppressUnmatchedEvent(event, scheduleData)) {
		return null;
	}

	return (
		<React.Fragment>
			<div
				className={`${styles.li}${highlighted ? " " + styles.highlighted : ""}`}
				ref={highlighted ? highlightedRef : null}
			>
				{!matchingData && looksLikeBlockCode(event.summary) && (
					<div className={styles.warning}>
						<span className="material-symbols-rounded">
							&#xe000;
						</span>
						<span>This block is missing data.</span>
					</div>
				)}
				<div className={styles.blockContent}>
					<div>
						<h3>
							{matchingData
								? matchingData.classNames[0]
								: event.summary}
						</h3>
						<p>
							<i>
								{formatTime(event.start.dateTime)} -{" "}
								{formatTime(event.end.dateTime)}
							</i>
						</p>
					</div>
					{matchingData
						? (looksLikeBlockCode(event.summary) ||
								event.summary.includes("Adv")) && (
								<div className={styles.info}>
									<h4>
										{/^\d+$/.test(matchingData.classNames[1])
											? `Room ${matchingData.classNames[1]}`
											: matchingData.classNames[1]}
									</h4>
									{!event.summary.includes("Adv") && (
										<p>
											<i>{event.summary}</i>
										</p>
									)}
								</div>
							)
						: looksLikeBlockCode(event.summary) && (
								<div className={styles.info}>
									<p>
										<i>{event.summary}</i>
									</p>
								</div>
							)}
				</div>
				{highlighted && <Countdown event={event} now={now} />}
			</div>
			{showLunchError && <LunchErrorBanner />}
		</React.Fragment>
	);
}

export default EventRow;
