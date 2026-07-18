import { useEffect, useState } from "react";
import { BACKEND_ENDPOINT } from "../constants/config";

export default function useBackendHealth() {
  const [status, setStatus] = useState("Connecting to backend...");
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const checkHealth = async () => {
      try {
        const response = await fetch(
          `${BACKEND_ENDPOINT}/health`
        );

        if (response.ok) {
          if (!cancelled) {
            setBackendReady(true);
            setStatus("Ready");
          }

          return;
        }
      } catch (_) {}

      if (!cancelled) {
        setBackendReady(false);
        setStatus("Connecting to backend...");

        timeoutId = setTimeout(
          checkHealth,
          2000
        );
      }
    };

    checkHealth();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return {
    status,
    backendReady,
  };
}