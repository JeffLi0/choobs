import styles from "./FeedbackForm.module.css";
import { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";

function FeedbackForm(props) {
	const uid = props.uid;
	const [showModal, setShowModal] = useState(false);
	const [modalFade, setModalFade] = useState(true);
	const [userData, setUserData] = useState();
	const [showThankYou, setShowThankYou] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formFading, setFormFading] = useState(false);

	const [isMobile, setIsMobile] = useState(isMobileDevice());

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				if (sessionStorage.getItem("userData")) {
					setUserData(JSON.parse(sessionStorage.getItem("userData")));
				} else {
					const userRef = doc(db, "users", uid);
					console.log("[FeedbackForm] fetchUserData");
					const userDataSnapshot = await getDoc(userRef);
					const userData = userDataSnapshot.data();

					if (userData) {
						sessionStorage.setItem(
							"userData",
							JSON.stringify({
								email: userData.email,
								name: userData.name,
								pfp: userData.pfp,
							}),
						);
						setUserData(userData);
					} else {
						console.error("User data not available");
					}
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		if (uid) {
			fetchUserData();
		}
	}, [uid, isMobile]);

	const openModal = () => {
		setModalFade(true);
		setShowModal(true);
		setShowThankYou(false); // Reset thank you state when opening
		setFormFading(false); // Reset form fade state
	};

	const closeModal = () => {
		setModalFade(false);
		const timeoutId = setTimeout(() => {
			setShowModal(false);
			setShowThankYou(false); // Reset thank you state when closing
			setFormFading(false); // Reset form fade state
		}, 200);

		return () => clearTimeout(timeoutId);
	};

	async function Submit(e) {
		e.preventDefault();

		if (document.querySelector("textarea").value.trim() !== "") {
			setIsSubmitting(true);

			const formEle = document.querySelector("form");
			const formDatab = new FormData(formEle);

			formDatab.set("name", userData.name);
			formDatab.set("email", userData.email);
			formDatab.set("uid", uid);

			try {
				// Start fade out animation
				setFormFading(true);

				// Submit the form
				fetch(
					"https://script.google.com/macros/s/AKfycbxBcrUh0GG9v0r-iEOpyb5lLyOLg1ArNlen-3bk2Rfq37sy-rVpQLQ3zhFIPTWkrTqrEA/exec",
					{
						method: "POST",
						body: formDatab,
					},
				).catch(() => {
					// Ignore CORS errors on localhost - the form still submits successfully
					console.log(
						"CORS blocked response, but form was submitted successfully",
					);
				});

				// Wait for fade out animation to complete, then show thank you
				setTimeout(() => {
					setIsSubmitting(false);
					setShowThankYou(true);

					// Clear the form
					document.querySelector("textarea").value = "";
				}, 300); // Match the CSS transition duration

				// Auto-close after 2.5 seconds (after thank you appears)
				// setTimeout(() => {
				// 	closeModal();
				// }, 2800); // 300ms fade + 2500ms display
			} catch (error) {
				console.error("Unexpected error:", error);
				setIsSubmitting(false);
				setFormFading(false); // Reset fade state on error
				// Show error state if needed
			}
		}
	}

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

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "Escape" && showModal) {
				closeModal();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [showModal]);

	return (
		<>
			<div
				className={`${styles.feedbackButton}${isMobile ? " " + styles.mobile : ""}`}
			>
				<button onClick={openModal}>
					{!isMobile ? (
						`Send Feedback`
					) : (
						<span
							className={`${"material-symbols-rounded"} ${styles.icon}`}
						>
							&#xf054;
						</span>
					)}
				</button>
			</div>
			{showModal && (
				<div
					className={`${styles.modalContainer} ${modalFade ? styles.fade : ""}`}
					onClick={closeModal}
				>
					<div
						className={`${styles.modalContent} ${modalFade ? styles.slide : ""}`}
						onClick={(e) => e.stopPropagation()}
					>
						{!showThankYou ? (
							<form
								className={`${styles.form} ${formFading ? styles.formFadeOut : ""}`}
							>
								<h3>Got feedback or questions?</h3>
								<textarea
									placeholder="Start typing..."
									name="Message"
									type="text"
									disabled={isSubmitting}
								/>
								<button
									onClick={(e) => Submit(e)}
									disabled={isSubmitting}
									className={
										isSubmitting ? styles.submitting : ""
									}
								>
									{isSubmitting ? "Submitting..." : "Submit"}
								</button>
							</form>
						) : (
							<div
								className={`${styles.thankYou} ${styles.thankYouShow}`}
							>
								<h3>Thank you for your feedback!</h3>
								<p>
									Keep an eye out for any replies to your
									feedback via email!
								</p>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}

export default FeedbackForm;
