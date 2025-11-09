const wordBoundaryPattern = new RegExp(
    `\\b(${[
        'sex',
        'sexual',
        'violence',
        'violent',
        'murder',
        'kill',
        'killing',
        'weapon',
        'porn',
        'terror',
        'extremism',
        'drugs',
        'gambling',
        'alcohol',
        'hate',
    ].join('|')})\\b`,
);

/**
 * Validates that a theme is appropriate for family-friendly content
 * @param theme - User-provided theme string
 * @returns true if theme is allowed (3-64 chars, alphanumeric+spaces, no blocked words)
 */
export const isThemeAllowed = (theme: string) => {
    const cleaned = theme.trim().toLowerCase();

    if (cleaned.length < 3 || cleaned.length > 64) {
        return false;
    }

    if (!/^[a-z0-9\s\-&]+$/.test(cleaned)) {
        return false;
    }

    return !wordBoundaryPattern.test(cleaned);
};
