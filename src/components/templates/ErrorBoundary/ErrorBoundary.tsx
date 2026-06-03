import { Component, type ReactNode } from "react";
import { Button } from "../../atoms/Button/Button";
import styles from "./ErrorBoundary.module.css";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches render errors from its subtree — including promises rejected inside
 * the `use` hook. Resetting clears the error; because the api modules clear
 * their stored promise on failure, retrying re-runs the request.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Unhandled error:", error);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className={styles.box} role="alert">
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.message}>{error.message}</p>
          <Button variant="ghost" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
