import React, { useState } from "react";

export function useSwipeRight(cb: () => void) {
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [touchEnd, setTouchEnd] = useState<number | null>(null);

	const minSwipeDistance = 50 

	const onTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(null)
		setTouchStart(e.targetTouches[0].clientX)
	}

	const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return
		const distance = touchStart - touchEnd
		const isRightSwipe = distance < -minSwipeDistance
		if (isRightSwipe) {
			cb();
		}
	}

	return {onTouchStart, onTouchMove, onTouchEnd};
}