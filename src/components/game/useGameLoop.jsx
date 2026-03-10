import { useRef, useEffect, useCallback } from 'react';

export default function useGameLoop(callback) {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      callbackRef.current(time);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
}