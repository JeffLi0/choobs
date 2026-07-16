import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../Schedule.module.css";
import {
	getShortDayOfWeek,
	getDateWithWrap,
	isWeekend,
	isWeekday,
} from "../utils/dateHelpers";

const OpenDatePicker = forwardRef(({ onClick }, ref) => (
	<button className={styles.button} onClick={onClick} ref={ref}>
		<span className={`${"material-symbols-rounded"} ${styles.icon}`}>
			&#xe5cf;
		</span>
	</button>
));

function DayButton({ displayDate, offset, onNavigate }) {
	return (
		<button
			className={`${styles.button} ${styles.day} ${isWeekend(displayDate, displayDate.getDate() + offset) ? styles.grayed : ""}`}
			onClick={() => onNavigate(offset)}
		>
			<p>{getShortDayOfWeek(displayDate, displayDate.getDate() + offset)}</p>
			<p>{getDateWithWrap(displayDate, displayDate.getDate() + offset)}</p>
		</button>
	);
}

function ScheduleHeader({
	displayDate,
	isMobile,
	highlightedRef,
	onNavigate,
	onJumpToToday,
	onDatePickerChange,
}) {
	const isToday =
		displayDate.getTime() === new Date().setHours(0, 0, 0, 0);
	const jumpDisabled = isToday && !highlightedRef.current;

	return (
		<div className={isMobile ? styles.header : styles.desktopHeader}>
			<button className={styles.button} onClick={() => onNavigate(-1)}>
				<span className="material-symbols-rounded">&#xe5cb;</span>
			</button>
			<div className={styles.calendar}>
				<button
					className={`${styles.button} ${jumpDisabled ? styles.grayed : ""}`}
					onClick={() => {
						if (!isToday) {
							onJumpToToday();
						} else {
							setTimeout(() => {
								if (highlightedRef && highlightedRef.current) {
									highlightedRef.current.scrollIntoView({
										behavior: "smooth",
										block: "center",
									});
								}
							}, 100);
						}
					}}
					disabled={jumpDisabled}
				>
					<span className="material-symbols-rounded">
						{highlightedRef && highlightedRef.current ? (
							<>&#xe259;</>
						) : (
							<>&#xf053;</>
						)}
					</span>
				</button>
				<div className={styles.week}>
					<DayButton
						displayDate={displayDate}
						offset={-2}
						onNavigate={onNavigate}
					/>
					<DayButton
						displayDate={displayDate}
						offset={-1}
						onNavigate={onNavigate}
					/>
					<button
						className={`${styles.button} ${styles.day} ${isWeekend(displayDate, displayDate.getDate()) ? styles.grayed : ""} ${styles.today}`}
					>
						<p>{getShortDayOfWeek(displayDate, displayDate.getDate())}</p>
						<p>{displayDate.getDate()}</p>
					</button>
					<DayButton
						displayDate={displayDate}
						offset={1}
						onNavigate={onNavigate}
					/>
					<DayButton
						displayDate={displayDate}
						offset={2}
						onNavigate={onNavigate}
					/>
				</div>
				<DatePicker
					selected={displayDate}
					filterDate={isWeekday}
					onChange={onDatePickerChange}
					customInput={<OpenDatePicker />}
				/>
			</div>
			<button className={styles.button} onClick={() => onNavigate(1)}>
				<span className={`${"material-symbols-rounded"} ${styles.icon}`}>
					&#xe5cc;
				</span>
			</button>
		</div>
	);
}

export default ScheduleHeader;
