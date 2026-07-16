import { useState } from "react";

const SWIPE_SENSITIVITY = 60;
const SWIPE_DEADZONE = 10;

// Touch-swipe day navigation. `onSwipe(direction)` is called with -1/1 once
// a horizontal swipe past SWIPE_SENSITIVITY completes.
export default function useSwipeNavigation(onSwipe) {
	const [swipe, setSwipe] = useState({
		swipeTriggeredX: false,
		swipeTriggeredY: false,
		touchEnd: 0,
		touchStartX: 0,
		touchStartY: 0,
	});
	const {
		swipeTriggeredX,
		swipeTriggeredY,
		touchEnd,
		touchStartX,
		touchStartY,
	} = swipe;
	const [swipeOffset, setSwipeOffset] = useState(0);
	const [swipeEnded, setSwipeEnded] = useState(false);

	const handleTouchStart = (e) => {
		let touchStartX = e.targetTouches[0].clientX;
		let touchStartY = e.targetTouches[0].clientY;
		setSwipe((swipe) => ({
			...swipe,
			touchStartX: touchStartX,
			touchStartY: touchStartY,
			swipeTriggeredX: false,
			swipeTriggeredY: false,
		}));
	};

	const handleTouchMove = (e) => {
		let touchEndX = e.targetTouches[0].clientX;
		let touchEndY = e.targetTouches[0].clientY;

		if (
			!swipeTriggeredX &&
			Math.abs(touchStartY - touchEndY) > SWIPE_DEADZONE
		) {
			setSwipe((swipe) => ({ ...swipe, swipeTriggeredY: true }));
		}
		if (
			!swipeTriggeredY &&
			Math.abs(touchStartX - touchEndX) > SWIPE_DEADZONE
		) {
			if (!swipeTriggeredX) {
				if (Math.abs(touchStartX - touchEndX) > SWIPE_DEADZONE) {
					if (touchEndX - touchStartX < 0) {
						setSwipeOffset(
							touchEndX - touchStartX + SWIPE_DEADZONE,
						);
					} else {
						setSwipeOffset(
							touchEndX - touchStartX - SWIPE_DEADZONE,
						);
					}
				}
			} else {
				setSwipeOffset(touchEndX - touchStartX);
			}
			setSwipe((swipe) => ({
				...swipe,
				touchEnd: touchEndX,
				swipeTriggeredX: true,
			}));
		} else {
			if (!swipeTriggeredX) {
				setSwipeOffset(0);
			}
		}
	};

	const handleTouchEnd = () => {
		let distanceSwiped = touchStartX - touchEnd;
		if (Math.abs(distanceSwiped) > SWIPE_SENSITIVITY && swipeTriggeredX) {
			setSwipeEnded(true);
			setSwipeOffset(swipeOffset * 2);

			setTimeout(() => {
				setSwipeEnded(false);
				setSwipeOffset(swipeOffset * -5);
				setTimeout(() => {
					setSwipeEnded(true);
					setTimeout(() => {
						setSwipeOffset(0);

						setTimeout(() => {
							setSwipeEnded(false);
						}, 200);
					}, 200);
				}, 10);
				if (distanceSwiped < 0) {
					onSwipe(-1);
				} else if (distanceSwiped > 0) {
					onSwipe(1);
				}
			}, 50);
		} else {
			setSwipeEnded(true);
			setTimeout(() => {
				setSwipeOffset(0);
			}, 100);
		}
	};

	return {
		swipeOffset,
		swipeEnded,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
	};
}
