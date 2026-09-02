import scheduleStyles from "../Schedule/Schedule.module.css";
import styles from "./PublicSchedule.module.css";

import { isHighlightedEvent, looksLikeBlockCode } from "../Schedule/utils/blockLogic";
import Countdown from "../Schedule/components/Countdown";

function formatTime(dateTime) {
	return new Date(dateTime)
		.toLocaleString("en-US", {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		})
		.toLowerCase();
}

// An academic block the visitor can name: a timed event whose summary is a block
// code (e.g. "C4", "H$2") and not a lunch slot.
function isEditableBlock(event) {
	return (
		event.start.dateTime &&
		event.end.dateTime &&
		!/^Lunch/.test(event.summary) &&
		looksLikeBlockCode(event.summary)
	);
}

// Presentational schedule (compact date header + block rows + inline editor).
// The container owns the data and editing state; this renders once per device
// frame. When `interactive` is false it's a static mirror (the decorative phone
// in the desktop composition). A compact header is used instead of the app's
// full-page FullDayBanner, whose `height: 90%` rule is meant to fill a viewport.
function ScheduleView({
	displayDate,
	loading,
	events,
	fullDayEvents,
	timedEvents,
	pending,
	now,
	isToday,
	interactive,
	editingBlock,
	draftSubject,
	draftRoom,
	onOpenEditor,
	onChangeSubject,
	onChangeRoom,
	onSave,
	onCancel,
}) {
	return (
		<>
			<div className={styles.dateHeader}>
				<h4>
					{displayDate.toLocaleDateString(undefined, {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</h4>
				{!loading &&
					(events.length === 0 ? (
						<h3 className={styles.dayType}>No School</h3>
					) : (
						fullDayEvents.map((event) => (
							<h3 key={event.id} className={styles.dayType}>
								{event.summary}
							</h3>
						))
					))}
			</div>

			<div className={scheduleStyles.ul}>
				{loading ? (
					<div className="lds-ring">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				) : (
					timedEvents.map((event) => {
						const editable = interactive && isEditableBlock(event);
						const saved = pending[event.summary];
						const highlighted =
							isToday && isHighlightedEvent(event, now);
						const isEditing = editingBlock === event.summary;

						return (
							<div
								key={event.id}
								className={[
									scheduleStyles.li,
									highlighted
										? `${scheduleStyles.highlighted} ${styles.blockCardActive}`
										: styles.blockCard,
									editable && !isEditing ? styles.editable : "",
								].join(" ")}
								onClick={
									editable && !isEditing
										? () => onOpenEditor(event.summary)
										: undefined
								}
							>
								<div className={scheduleStyles.blockContent}>
									<div>
										<h3>
											{saved ? saved[0] : event.summary}
										</h3>
										<p>
											<i>
												{formatTime(
													event.start.dateTime,
												)}{" "}
												-{" "}
												{formatTime(event.end.dateTime)}
											</i>
										</p>
									</div>
									{saved ? (
										<div className={scheduleStyles.info}>
											<h4>
												{/^\d+$/.test(saved[1])
													? `Room ${saved[1]}`
													: saved[1]}
											</h4>
											<p>
												<i>{event.summary}</i>
											</p>
										</div>
									) : (
										editable && (
											<span className={styles.editHint}>
												Tap to add
											</span>
										)
									)}
								</div>

								{highlighted && (
									<Countdown event={event} now={now} />
								)}

								{interactive && isEditing && (
									<div
										className={styles.editor}
										onClick={(e) => e.stopPropagation()}
									>
										<input
											className={styles.input}
											placeholder="Class name"
											value={draftSubject}
											autoFocus
											onChange={(e) =>
												onChangeSubject(e.target.value)
											}
											onKeyDown={(e) => {
												if (e.key === "Enter")
													onSave(event.summary);
												if (e.key === "Escape")
													onCancel();
											}}
										/>
										<input
											className={styles.input}
											placeholder="Room"
											value={draftRoom}
											onChange={(e) =>
												onChangeRoom(e.target.value)
											}
											onKeyDown={(e) => {
												if (e.key === "Enter")
													onSave(event.summary);
												if (e.key === "Escape")
													onCancel();
											}}
										/>
										<div className={styles.editorButtons}>
											<button
												className={styles.save}
												onClick={() =>
													onSave(event.summary)
												}
											>
												Save
											</button>
											<button
												className={styles.cancel}
												onClick={onCancel}
											>
												Cancel
											</button>
										</div>
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
		</>
	);
}

export default ScheduleView;
