import {useEffect, useRef} from "react";

export const useInterval = (callback: () => void, delay: number) => {
  const savedCallback: React.MutableRefObject<() => void> = useRef(() => null);

  useEffect(() => {
    // callback to be called by setInterval.
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current();
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
};
