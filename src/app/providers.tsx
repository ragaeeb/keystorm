'use client';

import { SessionProvider } from 'next-auth/react';
import { TooltipProvider } from '@/components/ui/tooltip';

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
    );
};
