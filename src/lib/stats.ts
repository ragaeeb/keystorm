/**
 * Typing performance statistics
 */
export type GameStats = {
    /** Words per minute */
    wpm: number;
    /** Accuracy percentage (0-100) */
    accuracy: number;
    /** Total error count */
    errors: number;
};

/**
 * Calculates typing performance metrics
 * @param userInput - Text typed by user so far
 * @param targetText - Expected text to type
 * @param startTime - Unix timestamp when typing started, or null if not started
 * @param errors - Total error count
 * @param backspaceCount - Number of backspace keystrokes
 * @returns Statistics object with WPM, accuracy, and error count
 */
export const calculateGameStats = (
    userInput: string,
    targetText: string,
    startTime: number | null,
    errors: number,
    backspaceCount: number,
): GameStats => {
    if (!startTime) {
        return { accuracy: 100, errors, wpm: 0 };
    }

    const timeElapsed = Date.now() - startTime;
    const words = userInput.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(timeElapsed / 60000, 0.001);
    const wpm = Math.round(words / minutes) || 0;

    let correctChars = 0;
    const len = Math.min(userInput.length, targetText.length);
    for (let i = 0; i < len; i++) {
        if (userInput[i] === targetText[i]) {
            correctChars++;
        }
    }

    const totalChars = userInput.length || 1;
    const errorPenalty = backspaceCount * 0.5;
    const accuracyRaw = (correctChars / totalChars) * 100 - errorPenalty;
    const accuracy = Math.min(100, Math.max(0, Math.round(accuracyRaw)));

    return { accuracy, errors, wpm };
};
