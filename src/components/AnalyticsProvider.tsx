import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "@/hooks/use-analytics";

// This component initializes analytics tracking
export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // The useAnalytics hook handles all the tracking automatically
  useAnalytics();

  return <>{children}</>;
};

export default AnalyticsProvider;