export const AssessmentState = {
  IDLE: 'IDLE',
  INTRO: 'INTRO',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTING: 'SUBMITTING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
} as const;
export type AssessmentState = typeof AssessmentState[keyof typeof AssessmentState];

export const BookingState = {
  IDLE: 'IDLE',
  LOCKED: 'LOCKED',
  PAYING: 'PAYING',
  MORPHING: 'MORPHING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
} as const;
export type BookingState = typeof BookingState[keyof typeof BookingState];
