"use client";

import { MotionConfig } from "framer-motion";

import ErrorBoundary from "@/components/shared/ErrorBoundary";
import ThemeProvider from "@/components/shared/ThemeProvider";

export default function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ThemeProvider>
    </MotionConfig>
  );
}
