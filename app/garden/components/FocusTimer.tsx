'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { startFocusSession, completeFocusSession, cancelFocusSession } from '@/app/actions/focus';

export default function FocusTimer() {
  const [duration, setDuration] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    if (sessionId) {
      await completeFocusSession(sessionId);
      setSessionId(null);
    }
    setTimeLeft(duration * 60);
  }, [sessionId, duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleComplete]);

  async function handleStart() {
    const result = await startFocusSession(duration);
    if (result.success && result.sessionId) {
      setSessionId(result.sessionId);
      setTimeLeft(duration * 60);
      setIsRunning(true);
    }
  }

  async function handleCancel() {
    setIsRunning(false);
    if (sessionId) {
      await cancelFocusSession(sessionId);
      setSessionId(null);
    }
    setTimeLeft(duration * 60);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-4">
      {!isRunning ? (
        <>
          <div>
            <label className="block text-green-800 font-semibold mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setDuration(Math.max(1, Math.min(120, val)));
                setTimeLeft(val * 60);
              }}
              min="1"
              max="120"
              className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900"
            />
          </div>
          <button
            onClick={handleStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Start Focus Session
          </button>
        </>
      ) : (
        <>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-800 mb-2">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-green-600">Stay focused!</div>
          </div>
          <button
            onClick={handleCancel}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel Session (adds rock)
          </button>
        </>
      )}

      <div className="text-xs text-green-600 space-y-1">
        <p>✅ Complete: Get a big tree (bush)</p>
        <p>❌ Cancel: Get a rock</p>
      </div>
    </div>
  );
}
