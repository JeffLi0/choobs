import { useEffect, useState } from "react";

// Ticks once a second so components relying on "the current time" (event
// highlighting, countdown text) re-render without needing to clone/replace
// unrelated state to force it.
export default function useNow(intervalMs = 1000) {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date());
		}, intervalMs);

		return () => clearInterval(interval);
	}, [intervalMs]);

	return now;
}
