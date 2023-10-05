import React, { useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useClickOutside(ref: React.RefObject<HTMLElement>, cb: (event: MouseEvent) => void) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    let handleClickOutside = function handleClickOutside(event: MouseEvent) {
      if (event.target instanceof Element && ref.current && !ref.current.contains(event.target)) {
				cb(event);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}