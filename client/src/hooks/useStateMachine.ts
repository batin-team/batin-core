import { useState, useCallback } from 'react';

export type Transitions<S extends string, A extends string> = Record<S, Partial<Record<A, S>>>;

export function useStateMachine<S extends string, A extends string>(
  transitions: Transitions<S, A>,
  initialState: S
) {
  const [state, setState] = useState<S>(initialState);

  const send = useCallback((action: A) => {
    setState((current) => {
      const next = transitions[current]?.[action];
      return next !== undefined ? next : current;
    });
  }, [transitions]);

  return [state, send] as const;
}
