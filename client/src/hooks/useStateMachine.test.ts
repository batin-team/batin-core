// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStateMachine } from './useStateMachine';

describe('useStateMachine Custom Hook', () => {
  const TestState = {
    STATE_A: 'STATE_A',
    STATE_B: 'STATE_B',
    STATE_C: 'STATE_C',
  } as const;
  type TestState = typeof TestState[keyof typeof TestState];

  const TestAction = {
    GO_B: 'GO_B',
    GO_C: 'GO_C',
    INVALID: 'INVALID',
  } as const;
  type TestAction = typeof TestAction[keyof typeof TestAction];

  const transitions: Record<TestState, Partial<Record<TestAction, TestState>>> = {
    [TestState.STATE_A]: {
      [TestAction.GO_B]: TestState.STATE_B,
    },
    [TestState.STATE_B]: {
      [TestAction.GO_C]: TestState.STATE_C,
    },
    [TestState.STATE_C]: {
      [TestAction.GO_B]: TestState.STATE_B,
    },
  };

  it('should initialize with the initial state', () => {
    const { result } = renderHook(() => useStateMachine(transitions, TestState.STATE_A));
    const [state] = result.current;
    expect(state).toBe(TestState.STATE_A);
  });

  it('should transition to the correct state when a valid action is sent', () => {
    const { result } = renderHook(() => useStateMachine(transitions, TestState.STATE_A));
    
    act(() => {
      const [, send] = result.current;
      send(TestAction.GO_B);
    });

    const [stateAfterFirst] = result.current;
    expect(stateAfterFirst).toBe(TestState.STATE_B);

    act(() => {
      const [, send] = result.current;
      send(TestAction.GO_C);
    });

    const [stateAfterSecond] = result.current;
    expect(stateAfterSecond).toBe(TestState.STATE_C);
  });

  it('should ignore transitions that are not defined for the current state', () => {
    const { result } = renderHook(() => useStateMachine(transitions, TestState.STATE_A));

    act(() => {
      const [, send] = result.current;
      send(TestAction.GO_C); // Not defined for STATE_A
    });

    const [state] = result.current;
    expect(state).toBe(TestState.STATE_A); // remains unchanged
  });
});
