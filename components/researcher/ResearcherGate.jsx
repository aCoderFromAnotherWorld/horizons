"use client";

import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "horizons-researcher-auth";

export default function ResearcherGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  async function submitPassword(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fetch("/api/researcher/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Invalid password");
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, "true");
    setAuthenticated(true);
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthenticated(false);
    setPassword("");
  }

  if (!authenticated) {
    return (
      <main className="app-page grid min-h-dvh place-items-center px-4 py-8 sm:px-6">
        <form
          className="ui-panel w-full max-w-md rounded-lg p-6 sm:p-8"
          onSubmit={submitPassword}
        >
          <div className="mb-5 flex justify-end">
            <ThemeToggle className="rounded-lg bg-card/85" />
          </div>
          <p className="text-sm font-black uppercase text-primary">
            Researcher access
          </p>
          <h1 className="mt-2 text-3xl font-black text-foreground">
            Horizons Researcher Dashboard
          </h1>
          <label className="mt-6 block text-sm font-bold text-muted-foreground">
            Password
            <input
              className="mt-2 h-14 w-full rounded-lg border border-input px-4 text-lg font-bold outline-none focus:border-ring focus:ring-4 focus:ring-primary/15"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="mt-3 font-bold text-red-600">{error}</p> : null}
          <BigButton
            className="mt-6 w-full bg-primary text-primary-foreground"
            disabled={loading}
            type="submit"
          >
            {loading ? "Checking..." : "Enter Dashboard"}
          </BigButton>
        </form>
      </main>
    );
  }

  return (
    <div className="app-page min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-primary">
              Research
            </p>
            <h1 className="text-lg font-black text-foreground sm:text-2xl">
              Horizons Researcher Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="rounded-lg" showLabel={false} />
            <Button className="rounded-lg" variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
