import React, { useEffect, useState } from "react";

export function useKeyDown() {
  // State for keeping track of whether key is pressed
  const [ctrlDown, setCtrlDown] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);

  // If pressed key is our target key then set to true
  function downHandler(evt: KeyboardEvent) {
    const code = evt.code;
    if (code === "ControlLeft") {
      setCtrlDown(true);
    }
    if (code === "Space") {
      if (spaceDown !== true) {
        setSpaceDown(true);
      }
    }
  }

  // If released key is our target key then set to false
  const upHandler = ({ code }: KeyboardEvent) => {
    if (code === "ControlLeft") {
      setCtrlDown(false);
    }
    if (code === "Space") {
      setSpaceDown(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return { ctrlDown, spaceDown };
}
