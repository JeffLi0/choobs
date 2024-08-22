import { useEffect, useState, useMemo } from "react";
import styles from "./Artwork.module.css";

function Artwork(props) {
	const artwork = useMemo(() => ["campfire", "cello", "fishing", "nothing", "reading", "sleeping", "stargazing", "jammin"], []);

	const [selectedArt, setSelectedArt] = useState(null);
	const [recentArt, setRecentArt] = useState([]);

	useEffect(() => {
		if (props.loading) {
			let newArt;
			const filteredArt = artwork.filter((art) => !recentArt.includes(art));

			if (filteredArt.length > 0) {
				newArt = filteredArt[Math.floor(Math.random() * filteredArt.length)];
			} else {
				newArt = artwork[Math.floor(Math.random() * artwork.length)];
			}

			setSelectedArt(newArt);
			setRecentArt((prev) => {
				const updatedRecent = [newArt, ...prev];
				return updatedRecent.slice(0, 4);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.loading]);

	return (
		<>
			{(props.events.length === 0 || (props.events.length <= 1 && props.fullDayEvent.every((event) => !/Day [0-6].*/.test(event)))) && (
				<>
					<img className={`${styles.img} ${!props.loading ? styles.visible : ""}`} draggable="false" src={process.env.PUBLIC_URL + "/static/artwork/" + selectedArt + ".png"} alt="" />
					<span className={`${styles.subtext} ${!props.loading ? styles.visible : ""}`}>Artwork by Eric Li</span>
				</>
			)}
		</>
	);
}

export default Artwork;
