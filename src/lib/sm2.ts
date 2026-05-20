export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export const sm2 = (
  easeFactor: number,
  interval: number,
  repetitions: number,
  rawScore: number
): SM2Result => {
  if (rawScore < 8) {
    return { easeFactor: Math.max(1.3, easeFactor - 0.2), interval: 1, repetitions: 0 };
  }

  const newRepetitions = repetitions + 1;
  const efDelta = rawScore >= 10 ? 0.15 : rawScore >= 9 ? 0.1 : 0.05;
  const newEaseFactor = Math.max(1.3, Math.min(2.5, easeFactor + efDelta));

  let newInterval: number;
  if (rawScore >= 10) {
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 7;
    else newInterval = Math.min(Math.round(interval * newEaseFactor), 30);
  } else if (rawScore >= 9) {
    newInterval = 7;
  } else {
    newInterval = 1;
  }

  return { easeFactor: newEaseFactor, interval: newInterval, repetitions: newRepetitions };
};
