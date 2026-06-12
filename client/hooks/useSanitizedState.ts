import { useEffect, useRef, useState } from "react";

/**
 * Custom hook that acts like useState, but provides a sanitize (wipe) callback,
 * and automatically sanitizes the state to the initial value upon component unmount.
 */
export function useSanitizedState<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const initialValueRef = useRef(initialValue);

  // Keep the ref updated with the latest initial value
  initialValueRef.current = initialValue;

  const sanitize = () => {
    setValue(initialValueRef.current);
  };

  useEffect(() => {
    return () => {
      setValue(initialValueRef.current);
    };
  }, []);

  return [value, setValue, sanitize] as const;
}
