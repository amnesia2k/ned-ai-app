import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RATIONALE_ACCEPTED_KEY = "@nedai/rationale_accepted";

export function usePermissions() {
  const [showRationale, setShowRationale] = useState(false);

  const checkAndRequestPermission = useCallback(async () => {
    // For documents (PDF/DOCX), we don't need a real native permission.
    // We only show the rationale once to provide a good UX.
    const isAccepted = await AsyncStorage.getItem(RATIONALE_ACCEPTED_KEY);

    if (isAccepted === "true") {
      return true;
    }

    setShowRationale(true);
    return false;
  }, []);

  const handleContinue = useCallback(async () => {
    setShowRationale(false);
    await AsyncStorage.setItem(RATIONALE_ACCEPTED_KEY, "true");
    return true;
  }, []);

  const handleNotNow = useCallback(() => {
    setShowRationale(false);
  }, []);

  return {
    showRationale,
    checkAndRequestPermission,
    handleContinue,
    handleNotNow,
  };
}
