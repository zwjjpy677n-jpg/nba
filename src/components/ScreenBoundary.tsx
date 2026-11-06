import { Component, type ReactNode } from 'react';
import ErrorState from './ErrorState';

interface State { error: Error | null }

export default class ScreenBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <ErrorState onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
