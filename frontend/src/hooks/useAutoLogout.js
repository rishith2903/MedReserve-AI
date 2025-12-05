import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RAW_TIMEOUT = import.meta.env.VITE_INACTIVITY_TIMEOUT_MS;
const INACTIVITY_TIMEOUT = Number.isFinite(Number(RAW_TIMEOUT)) ? Number(RAW_TIMEOUT) : 5 * 60 * 1000; // default 5 minutes
const RAW_WARNING = import.meta.env.VITE_INACTIVITY_WARNING_MS;
const WARNING_MS = Number.isFinite(Number(RAW_WARNING)) ? Number(RAW_WARNING) : 60 * 1000; // default 60 seconds

export const useAutoLogout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warnRef = useRef(null);
  const intervalRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const resetTimeout = () => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warnRef.current) clearTimeout(warnRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowWarning(false);

    if (user) {
      // Schedule logout
      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        logout();
        localStorage.setItem('sessionMsg', 'You were logged out due to inactivity. Please sign in again.');
        navigate('/login');
      }, INACTIVITY_TIMEOUT);

      // Schedule warning
      const warnDelay = Math.max(INACTIVITY_TIMEOUT - WARNING_MS, 0);
      warnRef.current = setTimeout(() => {
        setShowWarning(true);
        setSecondsRemaining(Math.ceil(WARNING_MS / 1000));
        // Start countdown
        intervalRef.current = setInterval(() => {
          setSecondsRemaining((s) => {
            if (s <= 1) {
              clearInterval(intervalRef.current);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      }, warnDelay);
    }
  };

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warnRef.current) clearTimeout(warnRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timeout on any user activity
    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set initial timeout
    resetTimeout();

    // Cleanup function
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warnRef.current) clearTimeout(warnRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, logout, navigate]);

  return { showWarning, secondsRemaining, staySignedIn: resetTimeout };
};
