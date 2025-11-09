const USER_NAME_KEY = 'userName';
const USER_THEME_KEY = 'userTheme';

/**
 * Persists user's name to localStorage
 * @param name - User's name or nickname (empty string to remove)
 */
export const saveUserName = (name: string) => {
    if (name.trim()) {
        localStorage.setItem(USER_NAME_KEY, name.trim());
    } else {
        localStorage.removeItem(USER_NAME_KEY);
    }
};

/**
 * Retrieves user's saved name from localStorage
 * @returns User's name or empty string if not set
 */
export const getUserName = (): string => {
    return localStorage.getItem(USER_NAME_KEY) || '';
};

/**
 * Persists user's theme preference to localStorage
 * @param theme - Educational theme (e.g., "Islam", "Science")
 */
export const saveUserTheme = (theme: string) => {
    if (theme.trim()) {
        localStorage.setItem(USER_THEME_KEY, theme.trim());
    } else {
        localStorage.removeItem(USER_THEME_KEY);
    }
};

/**
 * Retrieves user's saved theme from localStorage
 * @returns Saved theme or "Islam" as default
 */
export const getUserTheme = (): string => {
    return localStorage.getItem(USER_THEME_KEY) || 'Islam';
};

/**
 * Clears all user profile data from localStorage
 */
export const clearUserProfile = () => {
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_THEME_KEY);
};
