"use client";

import { Component } from "react";

import BigButton from "@/components/shared/BigButton";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-page grid min-h-dvh place-items-center p-6 text-center font-game">
        <section className="ui-panel max-w-xl rounded-lg p-8">
          <h1 className="text-3xl font-black text-foreground">
            Something needs a quick reset.
          </h1>
          <p className="mt-3 text-lg font-semibold text-muted-foreground">
            The session data is safe. Try the activity again from here.
          </p>
          <BigButton className="mt-6 bg-primary text-primary-foreground" onClick={this.reset}>
            Try Again
          </BigButton>
        </section>
      </main>
    );
  }
}
