import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import styles from "./CalendarExport.module.css";

const CalendarExport = ({ schoolYear, scheduleData }) => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showRoomNumbers, setShowRoomNumbers] = useState(true);

	const [showModal, setShowModal] = useState(false);
	const [modalFade, setModalFade] = useState(false);

	const lunchBlocks = useMemo(() => ["C1", "C$1", "G1", "G$1", "G2", "G$2", "C3", "C$3", "G3", "G$3", "G4", "G$4", "D1", "D$1", "H1", "H$1", "H2", "H$2", "D3", "D$3", "H3", "H$3", "H4", "H$4"], []);

	const [isMobile, setIsMobile] = useState(isMobileDevice());

	function isMobileDevice() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(isMobileDevice());
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const startDate = new Date(schoolYear - 1, 7, 20);
				const endDate = new Date(schoolYear, 5, 30);

				const response = await axios.get("https://www.googleapis.com/calendar/v3/calendars/lexingtonma.org_qud45cvitftvgc317tsd2vqctg%40group.calendar.google.com/events", {
					params: {
						calendarId: "lexingtonma.org_qud45cvitftvgc317tsd2vqctg@group.calendar.google.com",
						singleEvents: true,
						timeZone: "America/New_York",
						maxResults: 2500,
						timeMin: startDate.toISOString(),
						timeMax: endDate.toISOString(),
						key: "AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs",
					},
				});

				setEvents(response.data.items);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching calendar events:", error);
				setLoading(false);
			}
		};

		fetchData();
	}, [schoolYear]);

	const generateICS = (events) => {
		if (scheduleData) {
			let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//choobs.app//EN\r\n`;

			let classesToDelete = [];

			lunchBlocks.forEach((id) => {
				if (scheduleData.some((item) => item.block === id)) {
					classesToDelete.push(id.includes("$") ? id.replace(/\$/, "") : id.slice(0, 1) + "$" + id.slice(1));
					if (["C$1", "G$1", "G$2", "C$3", "G$3", "G$4"].indexOf(id) > -1) {
						classesToDelete.push(["D1", "H1", "H2", "D3", "H3", "H4"][["C$1", "G$1", "G$2", "C$3", "G$3", "G$4"].indexOf(id)]);
					} else if (["D1", "H1", "H2", "D3", "H3", "H4"].indexOf(id) > -1) {
						classesToDelete.push(["C$1", "G$1", "G$2", "C$3", "G$3", "G$4"][["D1", "H1", "H2", "D3", "H3", "H4"].indexOf(id)]);
					}
				}
			});

			classesToDelete = [...new Set(classesToDelete)];

			events = events.filter((event) => !classesToDelete.includes(event.summary));

			const eventsByDate = events.reduce((acc, event) => {
				const date = event.start.dateTime ? event.start.dateTime.split("T")[0] : event.start.date;
				if (!acc[date]) {
					acc[date] = [];
				}
				acc[date].push(event);
				return acc;
			}, {});

			const eventsToRemove = new Set();

			for (const [date, dayEvents] of Object.entries(eventsByDate)) {
				const fullDayEvent = dayEvents.find((event) => !event.start.dateTime);
				const isHalfDay = fullDayEvent && fullDayEvent.summary.includes("Half");

				if (!isHalfDay) {
					if (dayEvents.some((event) => /^(C|G)\$[1-4]$/.test(event.summary))) {
						dayEvents.forEach((event) => {
							if (event.summary === "Lunch 2" || event.summary === "Lunch 3") {
								eventsToRemove.add(`${date}-${event.id}`);
							}
						});
					} else if (dayEvents.some((event) => /^(D|H)\$[1-4]$/.test(event.summary))) {
						dayEvents.forEach((event) => {
							if (event.summary === "Lunch 1" || event.summary === "Lunch 3") {
								eventsToRemove.add(`${date}-${event.id}`);
							}
						});
					} else {
						dayEvents.forEach((event) => {
							if (event.summary === "Lunch 1" || event.summary === "Lunch 2") {
								eventsToRemove.add(`${date}-${event.id}`);
							}
						});
					}
				} else {
					dayEvents.forEach((event) => {
						if (/^[A-H]\$[1-4]$/.test(event.summary)) {
							event.summary = event.summary.replace("$", "");
						}
					});
					try {
						const lastBlockID = dayEvents.find((event) => ["F1", "D2", "C2", "F3", "D4", "C4"].includes(event.summary)).summary;
						const lastBlockRoom = scheduleData.find((event) => event.block === lastBlockID).classNames[1];
						const lastBlockEvent = dayEvents.find((event) => event.summary === lastBlockID);

						if (lastBlockRoom < 899 && lastBlockRoom > 100 && lastBlockRoom !== "") {
							if (lastBlockEvent) {
								if (lastBlockRoom < 500 || lastBlockRoom.toLowerCase() === "gym") {
									dayEvents.forEach((event) => {
										if (event.summary === "Lunch 1") {
											eventsToRemove.add(`${date}-${event.id}`);
										}
									});
									lastBlockEvent.end.dateTime = new Date(new Date(lastBlockEvent.end.dateTime).setHours(11, 25, 0, 0)).toISOString();
								} else {
									dayEvents.forEach((event) => {
										if (event.summary === "Lunch 2") {
											eventsToRemove.add(`${date}-${event.id}`);
										}
									});
									lastBlockEvent.start.dateTime = new Date(new Date(lastBlockEvent.end.dateTime).setHours(11, 30, 0, 0)).toISOString();
								}
								const index = events.findIndex((event) => event.id === lastBlockEvent.id);
								if (index !== -1) {
									events[index] = lastBlockEvent;
								}
							}
						}
					} catch {}
				}
			}

			events = events.filter((event) => {
				const eventDate = event.start.dateTime ? event.start.dateTime.split("T")[0] : event.start.date;
				return !eventsToRemove.has(`${eventDate}-${event.id}`);
			});

			events.forEach((event) => {
				const isAllDay = !event.start.dateTime;
				const startDate = isAllDay ? event.start.date : event.start.dateTime;
				const endDate = isAllDay ? event.end.date : event.end.dateTime;

				icsContent += `BEGIN:VEVENT\r\nUID:${event.id}\r\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\r\n`;

				if (isAllDay) {
					icsContent += `DTSTART;VALUE=DATE:${startDate.replace(/-/g, "")}\r\nDTEND;VALUE=DATE:${endDate.replace(/-/g, "")}\r\n`;
				} else {
					icsContent += `DTSTART:${new Date(startDate).toISOString().replace(/[-:]/g, "").split(".")[0]}Z\r\nDTEND:${
						new Date(endDate).toISOString().replace(/[-:]/g, "").split(".")[0]
					}Z\r\n`;
				}

				const matchingData = scheduleData.find((data) => {
					return event.summary.includes(data.block.replace("$", "")) || event.summary.includes(data.block);
				});

				if (matchingData) {
					icsContent += `SUMMARY:${matchingData.classNames[0]}${showRoomNumbers && matchingData.classNames[1] ? ` (${matchingData.classNames[1]})` : ""}\r\nDESCRIPTION:${
						event.description || ""
					}\r\nLOCATION:${matchingData.classNames[1]}\r\nEND:VEVENT\r\n`;
				} else {
					icsContent += `SUMMARY:${event.summary}\r\nDESCRIPTION:${event.description || ""}\r\nLOCATION:${event.location || ""}\r\nEND:VEVENT\r\n`;
				}
			});

			icsContent += "END:VCALENDAR";
			return icsContent;
		}
		return "";
	};

	const handleExport = async () => {
		const icsData = generateICS(events);
		const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `school_calendar_${schoolYear - 1}-${schoolYear}.ics`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const openModal = () => {
		setModalFade(true);
		setShowModal(true);
	};

	const closeModal = () => {
		setModalFade(false);
		const timeout = setTimeout(() => {
			setShowModal(false);
		}, 200);

		return () => clearTimeout(timeout);
	};

	return (
		<>
			<div className={styles.category}>
				<h3>Export Schedule</h3>
				<span>View your schedule on Google Calendar or your preferred calendar app.</span>
				<button onClick={openModal}>View Instructions</button>
			</div>
			{showModal && (
				<div className={`${styles.modalContainer} ${modalFade ? styles.fade : ""} ${isMobile && styles.mobileModal}`} onClick={closeModal}>
					<div className={`${styles.modalContent} ${modalFade ? styles.slide : ""}`} onClick={(e) => e.stopPropagation()}>
						<h3>Export Instructions</h3>
						<p>
							Please see{" "}
							<a href="https://docs.google.com/document/d/1u4TdBynKeaJJwMmuqvMcWSbogWSeIJEjz8BA-9r2VTs/edit?usp=sharing" target="_blank" className={styles.link} rel="noreferrer">
								this document
							</a>{" "}
							for more detailed instructions.
						</p>
						<ol>
							<li>Download and locate the .ics file on your device.</li>
							<li>
								Go to{" "}
								<a href="https://calendar.google.com" target="_blank" className={styles.link} rel="noreferrer">
									calendar.google.com
								</a>
								.
							</li>
							<li>Click the plus icon in the left sidebar.</li>
							<li>Select “Add calendar” and “Create new calendar” in the left sidebar,</li>
							<li>Create a new calendar (Optional but highly recommended).</li>
							<li>Click "Import & Export" on the left sidebar.</li>
							<li>Click "Select file from your computer" and choose the .ics file.</li>
							<li>Click "Import".</li>
						</ol>
						<div>
							<div className={styles.label} onClick={() => setShowRoomNumbers(!showRoomNumbers)}>
								<div className={`${showRoomNumbers ? styles.checked : ''}`} />
								<div>
									<div>Show Room Numbers in Event Name</div>
									<span>e.g., "Math (800)", "Science (300)"</span>
								</div>
							</div>
							<button onClick={handleExport} disabled={loading}>
								{loading ? "Loading..." : "Download"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default CalendarExport;
