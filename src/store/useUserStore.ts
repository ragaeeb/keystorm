import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserState = {
    name: string;
    theme: string;

    setName: (name: string) => void;
    setTheme: (theme: string) => void;
    clearProfile: () => void;
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            clearProfile: () => {
                set({ name: '', theme: 'Islam' });
            },
            name: '',

            setName: (name) => {
                set({ name: name.trim() });
            },

            setTheme: (theme) => {
                set({ theme: theme.trim() });
            },
            theme: 'Islam',
        }),
        { name: 'user-profile' },
    ),
);
