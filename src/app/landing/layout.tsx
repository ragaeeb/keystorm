import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { landingMetadata, landingPageJsonLd } from './metadata';

export const metadata: Metadata = landingMetadata;

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd data={landingPageJsonLd} />
            {children}
        </>
    );
}
