import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { Footer } from '@/components/footer';

export const metadata: Metadata = { description: 'Teaching Typing for Kids', title: 'Keystorm' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className="antialiased font-sans">
                <Providers>
                    <div className="flex min-h-screen flex-col">
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
