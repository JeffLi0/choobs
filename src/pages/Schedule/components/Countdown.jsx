import styles from "../Schedule.module.css";

// Live progress/countdown bar for the block currently in session. `now` is
// passed in (from useNow) so it re-renders every second without each instance
// creating its own timer. Shared by the logged-in EventRow and the logged-out
// landing-page PublicSchedule.
function Countdown({ event, now }) {
	const startTime = new Date(event.start.dateTime);
	const endTime = new Date(event.end.dateTime);

	if (startTime > now) {
		const timeDifference = startTime - now;
		const minutesUntilStart = Math.floor(timeDifference / 60000);

		return (
			<div className={styles.countdown}>
				<div className={styles.countdownText}>
					<i>
						{minutesUntilStart +
							1 +
							(minutesUntilStart !== 0
								? " minutes"
								: " minute") +
							" until start"}
					</i>
					<i>0%</i>
				</div>
				<div className={styles.progressBarContainer}>
					<div
						className={styles.progressBar}
						style={{ width: "0%" }}
					/>
				</div>
			</div>
		);
	}

	const timeDifference = endTime - now;
	const totalTime = endTime - startTime;
	const percentCompleted = parseFloat(
		Math.min(((totalTime - timeDifference) / totalTime) * 100, 100),
	);

	if (timeDifference >= 60000) {
		return (
			<div className={styles.countdown}>
				<div className={styles.countdownText}>
					<i>
						{Math.floor(timeDifference / 60000) +
							1 +
							" minutes remaining"}
					</i>
					<i>{percentCompleted.toFixed(0) + "%"}</i>
				</div>
				<div className={styles.progressBarContainer}>
					<div
						className={styles.progressBar}
						style={{ width: `max(${percentCompleted}%, 1rem)` }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.countdown}>
			<div className={styles.countdownText}>
				<i>
					{Math.floor(timeDifference / 1000) +
						1 +
						(Math.floor(timeDifference / 1000) !== 0
							? " seconds"
							: " second") +
						" remaining"}
				</i>
				<i>{percentCompleted.toFixed(0) + "%"}</i>
			</div>
			<div className={styles.progressBarContainer}>
				<div
					className={styles.progressBar}
					style={{ width: `max(${percentCompleted}%, 1rem)` }}
				/>
			</div>
		</div>
	);
}

export default Countdown;
