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
