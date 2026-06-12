import { useState } from "react";

export enum BookingState {
  IDLE = "IDLE",
  LOCKED = "LOCKED",
  PAYING = "PAYING",
  MORPHING = "MORPHING",
  SUCCESS = "SUCCESS"
}

export enum AssessmentState {
  IDLE = "IDLE",
  QUESTIONNAIRE = "QUESTIONNAIRE",
  SCORING = "SCORING",
  RESULT = "RESULT",
  COMPLETED = "COMPLETED"
}

export const assessmentTransitions: Record<AssessmentState, AssessmentState[]> = {
  [AssessmentState.IDLE]: [AssessmentState.QUESTIONNAIRE],
  [AssessmentState.QUESTIONNAIRE]: [AssessmentState.IDLE, AssessmentState.SCORING],
  [AssessmentState.SCORING]: [AssessmentState.RESULT, AssessmentState.IDLE],
  [AssessmentState.RESULT]: [AssessmentState.COMPLETED, AssessmentState.IDLE, AssessmentState.QUESTIONNAIRE],
  [AssessmentState.COMPLETED]: [AssessmentState.IDLE]
};

export const bookingTransitions: Record<BookingState, BookingState[]> = {
  [BookingState.IDLE]: [BookingState.LOCKED],
  [BookingState.LOCKED]: [BookingState.PAYING, BookingState.IDLE],
  [BookingState.PAYING]: [BookingState.MORPHING, BookingState.IDLE],
  [BookingState.MORPHING]: [BookingState.SUCCESS, BookingState.IDLE],
  [BookingState.SUCCESS]: [BookingState.IDLE]
};

export function useStateMachine<T extends string>(
  initialState: T,
  transitions: Record<T, T[]>
) {
  const [state, setState] = useState<T>(initialState);

  const transition = (nextState: T) => {
    const allowed = transitions[state];
    if (allowed && allowed.includes(nextState)) {
      setState(nextState);
    } else {
      console.warn(`Transition from state "${state}" to "${nextState}" not allowed.`);
    }
  };

  return [state, transition] as const;
}
