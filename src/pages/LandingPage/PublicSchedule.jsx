import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import styles from "./PublicSchedule.module.css";

import useCalendarEvents from "../Schedule/hooks/useCalendarEvents";
import useNow from "../Schedule/hooks/useNow";
import { sortEventsByStartTime } from "../Schedule/utils/blockLogic";

import ScheduleView from "./ScheduleView";
import { findNextScheduleDate } from "./nextScheduleDate";
import {
	getPendingSchedule,
	setPendingBlock,
	hasPendingSchedule,
} from "./pendingSchedule";

// Stable empty reference so useCalendarEvents' fetch effect doesn't re-fire and
// so its `loading` resolves (it only clears loading when scheduleData is truthy).
const NO_SCHEDULE_DATA = [];

// Decorative names/emoji for the desktop composition's friends rail. It can't
// show real friends (that needs login), so it's a faded, non-interactive mirror
// of the app's layout with a "sign in" nudge over it.
const DECOY_FRIENDS = [
	["🙂", "Brian", "Orchestra"],
	["😌", "Eric", "English"],
	["🤠", "Ian", "AP World"],
	["💀", "Jacob", "Mandarin"],
	["🍦", "Jai", "Precalc"],
	["🤖", "Jeremy", "Orchestra"],
	["🌸", "Jules", "Math"],
];

function todayAtMidnight() {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}

function useIsWide(minWidth = 1000) {
	const [wide, setWide] = useState(
		() => window.matchMedia(`(min-width: ${minWidth}px)`).matches,
	);
	useEffect(() => {
		const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
		const onChange = (e) => setWide(e.matches);
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, [minWidth]);
	return wide;
}

function FriendsRail() {
	return (
		<div className={styles.friendsRail} aria-hidden="true">
			<div className={styles.friendsHeader}>Friends</div>
			{DECOY_FRIENDS.map(([emoji, name, activity]) => (
				<div key={name} className={styles.friendRow}>
					<span className={styles.friendAvatar}>{emoji}</span>
					<div className={styles.friendMeta}>
						<b>{name}</b>
						<span>Currently in {activity}</span>
					</div>
				</div>
			))}
			<div className={styles.friendsFade}>Sign in to see friends</div>
		</div>
	);
}

function PublicSchedule() {
	const now = useNow();
	const today = useMemo(todayAtMidnight, []);
	const isWide = useIsWide();

	// Resolve which day to preview: today if it has classes, otherwise the next
	// real school day (handles weekends / holidays / summer).
	const [previewDate, setPreviewDate] = useState(null);
	const [resolvingDate, setResolvingDate] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const date = await findNextScheduleDate(today);
			if (cancelled) return;
			setPreviewDate(date || today);
			setResolvingDate(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [today]);

	const { events, loading: calendarLoading } = useCalendarEvents(
		previewDate || today,
		NO_SCHEDULE_DATA,
	);
	const loading = resolvingDate || calendarLoading;
	const isToday = previewDate?.getTime() === today.getTime();

	// Locally-entered class data + inline editor state.
	const [pending, setPending] = useState(getPendingSchedule);
	const [editingBlock, setEditingBlock] = useState(null);
	const [draftSubject, setDraftSubject] = useState("");
	const [draftRoom, setDraftRoom] = useState("");

	const fullDayEvents = useMemo(
		() =>
			events.filter(
				(event) => !event.start.dateTime && !event.end.dateTime,
			),
		[events],
	);
	const timedEvents = useMemo(
		() =>
			sortEventsByStartTime(
				events.filter(
					(event) => event.start.dateTime && event.end.dateTime,
				),
			),
		[events],
	);

	const openEditor = (block) => {
		const existing = pending[block];
		setDraftSubject(existing ? existing[0] : "");
		setDraftRoom(existing ? existing[1] : "");
		setEditingBlock(block);
	};
	const saveEditor = (block) => {
		if (!draftSubject.trim()) return;
		setPending(setPendingBlock(block, draftSubject.trim(), draftRoom.trim()));
		setEditingBlock(null);
	};

	// Shared props for every ScheduleView instance.
	const viewData = {
		displayDate: previewDate || today,
		loading,
		events,
		fullDayEvents,
		timedEvents,
		pending,
		now,
		isToday,
	};
	const editProps = {
		editingBlock,
		draftSubject,
		draftRoom,
		onOpenEditor: openEditor,
		onChangeSubject: setDraftSubject,
		onChangeRoom: setDraftRoom,
		onSave: saveEditor,
		onCancel: () => setEditingBlock(null),
	};

	// The phone is always the interactive surface (front and unobstructed). On
	// wide screens it sits over a decorative desktop-window backdrop; on narrow
	// screens it stands alone.
	const phone = (
		<div className={`${styles.phone} ${isWide ? styles.phoneOverlay : ""}`}>
			<div className={styles.phoneNotch} />
			<div className={styles.phoneScreen}>
				<ScheduleView {...viewData} {...editProps} interactive />
			</div>
		</div>
	);

	return (
		<div className={styles.wrapper}>
			<div className={`${styles.stage} ${isWide ? styles.stageWide : ""}`}>
				{isWide && (
					<div className={styles.desktopWindow} aria-hidden="true">
						<div className={styles.desktopMain}>
							<ScheduleView
								{...viewData}
								{...editProps}
								interactive={false}
							/>
						</div>
						<FriendsRail />
					</div>
				)}
				{phone}
			</div>

			{hasPendingSchedule() && (
				<div className={styles.savePrompt}>
					<p>Nice — sign up to save your schedule and see it anywhere.</p>
					<div className={styles.savePromptButtons}>
						<Link to="/register" className={styles.signUp}>
							Sign up to save
						</Link>
						<Link to="/login" className={styles.logIn}>
							Log in
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

export default PublicSchedule;
