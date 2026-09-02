import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getCurrentSchoolYear } from "../../utils/schoolYear";

import styles from "./LandingPage.module.css";

// Features surfaced on the landing page. Icons are Material Symbols Rounded
// ligatures (font loaded in index.html).
const FEATURES = [
	{
		icon: "school",
		title: "Built for Lexington High School",
		description:
			"Made for LHS by LHS students. Garunteed to always have the right schedule, even on half days and snow days.",
	},
	{
		icon: "upload_file",
		title: "Import in seconds",
		description:
			"Works with Aspen to import your schedule effortlessly. You don't need to worry about entering your classes manually.",
	},
	{
		icon: "timer",
		title: "Live block countdown",
		description:
			"See exactly how much time is left in your current class with a progress bar that updates every second.",
	},
	{
		icon: "group",
		title: "See your friends",
		description:
			"Add friends and check what class they're in right now — or peek at their whole day.",
	},
	{
		icon: "calendar_month",
		title: "Export to your calendar",
		description:
			"Push your entire schedule to Google or Apple Calendar in one tap, room numbers included.",
	},
	{
		icon: "install_mobile",
		title: "Right on your home screen",
		description:
			"Install it like a native app and open it offline. Fast, focused, and always a tap away.",
	},
];

function LandingPage({ isPWA }) {
	const [isMobile, setIsMobile] = useState(isMobileDevice());
	const [showScrollHint, setShowScrollHint] = useState(true);

	// The school-year util rolls forward automatically in July, so this label
	// tracks the current year on its own (e.g. "’26-’27") — no yearly edit needed.
	const endYear = getCurrentSchoolYear();
	const schoolYear = `’${String(endYear - 1).slice(2)}-’${String(
		endYear,
	).slice(2)}`;

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

	// Hide the "scroll for more" hint once the user has started scrolling.
	useEffect(() => {
		const handleScroll = () => {
			setShowScrollHint(window.scrollY < 80);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const cta =
		!isMobile || isPWA ? (
			<>
				<Link to="/register" className={styles.getStarted}>
					Get Started
				</Link>
				<Link to="/login" className={styles.login}>
					Log In
				</Link>
			</>
		) : (
			<Link to="/download" className={styles.install}>
				<span className="material-symbols-rounded">&#xf090;</span>
				<span>Install</span>
			</Link>
		);

	return (
		<div className={styles.page}>
			<header className={styles.hero}>
				<div className={styles.logoWrapper}>
					<img
						className={styles.logo}
						src={
							document.location.origin +
							"/static/maskable_icon_x512.png"
						}
						alt="choobs logo"
					/>
					<h4>choobs.app</h4>
				</div>

				<div className={styles.yearBadge}>
					<span className={styles.yearDot} />
					Ready for the {schoolYear} school year
				</div>

				<div className={styles.schedulingSimplified}>
					<h1>Scheduling, simplified.</h1>
					<p>A better way to view your schedule</p>
				</div>

				<div className={styles.buttons}>{cta}</div>

				<img
					className={`${styles.screenshot} ${
						isMobile ? "" : styles.desktop
					}`}
					src={
						document.location.origin +
						(isMobile
							? "/static/screenshot_mobile.png"
							: "/static/screenshot_desktop.png")
					}
					alt="Preview of the choobs schedule"
				/>
			</header>

			<section className={styles.features}>
				<h2 className={styles.featuresHeading}>
					Everything your schedule should do
				</h2>
				<div className={styles.featureGrid}>
					{FEATURES.map((feature) => (
						<div key={feature.title} className={styles.featureCard}>
							<span
								className={`material-symbols-rounded ${styles.featureIcon}`}
							>
								{feature.icon}
							</span>
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</div>
					))}
				</div>
			</section>

			<section className={styles.closing}>
				<h2>Set up your {schoolYear} schedule today</h2>
				<p>Built to work effortlessly with your LHS schedule. Takes about a minute.</p>
				<div className={styles.buttons}>{cta}</div>
			</section>

			<footer className={styles.footer}>
				Made with ❤️ by Jeff Li - LHS '26
			</footer>

			<div
				className={`${styles.scrollHint} ${
					showScrollHint ? "" : styles.scrollHintHidden
				}`}
				aria-hidden="true"
			>
				<span className="material-symbols-rounded">
					keyboard_arrow_down
				</span>
			</div>
		</div>
	);
}

export default LandingPage;
