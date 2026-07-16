import { getSchedule } from "./pdf";
import styles from "./ImportSchedule.module.css";
import { getCurrentSchoolYear } from "../../utils/schoolYear";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { setDoc, doc, updateDoc } from "firebase/firestore"; // Make sure to import updateDoc
import React, { useState, useEffect } from "react";

function ImportSchedule(props) {
	const [showModal, setShowModal] = useState(false);
	const [modalFade, setModalFade] = useState(true);

	const [isMobile, setIsMobile] = useState(isMobileDevice());

	function isMobileDevice() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
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

	/**
	 * @param {(import('@haelp/schedule-parse').Course | null)[]} schedule
	 */
	const updateFromSchedule = async (schedule) => {
		try {
			const auth = getAuth();
			const user = await new Promise((resolve, reject) => {
				const unsubscribe = onAuthStateChanged(
					auth,
					(user) => {
						unsubscribe();
						resolve(user);
					},
					reject,
				);
			});

			const uid = user.uid;

			const classes = {};

			const nameRemap = {
				"Homeroom/Advisory": "Advisory",
			};

			schedule.forEach((block) => {
				if (block && block.schedule === "HR") block.block = "Adv";
				if (block && block.description in nameRemap) {
					block.description = nameRemap[block.description];
				}
				if (block) {
					classes[block.block] = [block.description, block.room];
				}
			});

			await updateDoc(doc(db, "users", uid), { classes });
			console.log("[ImportSchedule] Successfully imported schedule");
			await props.refreshScheduleData();
			closeModal();
		} catch (error) {
			console.error("Error adding/deleting documents: ", error);
		}
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
				<h3>Import Schedule</h3>
				<span>Quickly add your schedule through pdf magic.</span>
				<button onClick={openModal}>View Instructions</button>
			</div>
			{showModal && (
				<div
					className={`${styles.modalContainer} ${modalFade ? styles.fade : ""} ${isMobile && styles.mobileModal}`}
					onClick={closeModal}
				>
					<div
						className={`${styles.modalContent} ${modalFade ? styles.slide : ""}`}
						onClick={(e) => e.stopPropagation()}
					>
						<h3>Import Instructions</h3>
						{/* <p>
							Please see{" "}
							<a
								href="https://docs.google.com/document/d/1u4TdBynKeaJJwMmuqvMcWSbogWSeIJEjz8BA-9r2VTs/edit?usp=sharing"
								target="_blank"
								className={styles.link}
								rel="noreferrer"
							>
								this document
							</a>{" "}
							for more detailed instructions.
						</p> */}
						<ol>
							<li>
								Go to{" "}
								<a
									href="https://ma-lexington.myfollett.com/aspen-login/"
									target="_blank"
									className={styles.link}
									rel="noreferrer"
								>
									Aspen
								</a>
								.
							</li>
							<li>Click the "My Info" tab.</li>
							<li>
								Click on "Reports" then "Student Schedule HS
								(Portal) for {getCurrentSchoolYear()}". It should
								open a new tab.
							</li>
							<li>
								In the new tab, click "Run". It should download
								a PDF file.
							</li>
							<li>
								Click "Import from PDF" below and select the
								file you just downloaded.
							</li>
						</ol>
						<div>
							<button
								onClick={async () => {
									try {
										/** @type {import('@haelp/schedule-parse').APIRes} */
										const { schedule } =
											await getSchedule(1); // semester
										if (!schedule.some((s) => s))
											throw new Error("Invalid PDF.");
										updateFromSchedule(schedule);
									} catch (e) {
										if (
											!(e.message.includes("showOpenFilePicker") || e.message.includes("The user aborted a request"))
										)	
											alert(
												"Error uploading pdf: " +
													e.message,
											);
									}
								}}
							>
								Import from PDF
							</button>
						</div>
						<span>Thanks to Joshua Liu '26 for the help!</span>
					</div>
				</div>
			)}
		</>
	);
}

export default ImportSchedule;
