import styles from "../Schedule.module.css";

function FullDayBanner({ displayDate, loading, events, fullDayEvents }) {
	return (
		<div className={styles.date}>
			<h4>
				{displayDate.toLocaleDateString(undefined, {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				})}
			</h4>
			{loading ? (
				<div className={styles.fullDayEvent}>
					<h3>Loading...</h3>
				</div>
			) : events.length === 0 ? (
				<div className={styles.fullDayEvent}>
					<h3>No School</h3>
				</div>
			) : (
				fullDayEvents.map((event) => (
					<div key={event.id} className={styles.fullDayEvent}>
						<h3>{event.summary}</h3>
					</div>
				))
			)}
		</div>
	);
}

export default FullDayBanner;
