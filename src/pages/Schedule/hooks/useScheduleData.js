import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";

// Fetches the signed-in user's `classes` map from Firestore and reshapes it
// into `[{ block, classNames }]`, cached in sessionStorage under
// "scheduleData". `propsUid` is the profile being viewed; `uid` (from the
// auth listener) is the signed-in user - they're compared before trusting the
// cache or writing to it.
export default function useScheduleData(propsUid) {
	const [uid, setUid] = useState(null);
	const [scheduleData, setScheduleData] = useState(null);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setUid(user.uid);
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const fetchScheduleData = async () => {
			try {
				if (
					uid === propsUid &&
					sessionStorage.getItem("scheduleData")
				) {
					setScheduleData(
						JSON.parse(sessionStorage.getItem("scheduleData")),
					);
				} else {
					const userRef = doc(db, "users", propsUid);
					const scheduleDataSnapshot = (await getDoc(userRef)).data();

					const classesData = scheduleDataSnapshot.classes;

					const nextScheduleData = Object.entries(classesData).map(
						([block, classNames]) => ({
							block,
							classNames,
						}),
					);

					if (uid === propsUid) {
						sessionStorage.setItem(
							"scheduleData",
							JSON.stringify(nextScheduleData),
						);
					}

					setScheduleData(nextScheduleData);
				}
			} catch (error) {
				console.error("Error fetching schedule data:", error);
			}
		};

		if (propsUid && uid) {
			fetchScheduleData();
		}
	}, [propsUid, uid]);

	return { uid, scheduleData };
}
