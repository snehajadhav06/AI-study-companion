import { useRef, useState, useCallback, useEffect } from 'react';

const useQuizTimer = () => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    if (startTimeRef.current !== null) {
      return;
    }
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const finalElapsed = startTimeRef.current !== null ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    setElapsedSeconds(finalElapsed);
    return finalElapsed;
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    setElapsedSeconds(0);
  }, []);

  const formattedTime = useCallback(() => {
    const seconds = elapsedSeconds % 60;
    const minutes = Math.floor(elapsedSeconds / 60);

    if (minutes === 0) {
      return `${seconds}s`;
    }

    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }, [elapsedSeconds]);

  const formattedLiveTime = useCallback(() => {
    const seconds = elapsedSeconds % 60;
    const minutes = Math.floor(elapsedSeconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    startTimer,
    stopTimer,
    resetTimer,
    elapsedSeconds,
    formattedTime,
    formattedLiveTime,
  };
};

export default useQuizTimer;
