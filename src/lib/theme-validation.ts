const bannedPhrases = [
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
];

export const isThemeAllowed = (theme: string) => {
    const cleaned = theme.trim().toLowerCase();

    if (cleaned.length < 3 || cleaned.length > 64) {
        return false;
    }

    if (!/^[a-z0-9\s\-&]+$/i.test(theme)) {
        return false;
    }

    return !bannedPhrases.some((phrase) => cleaned.includes(phrase));
};
