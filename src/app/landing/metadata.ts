import type { Metadata } from 'next';
import pkg from '@/../package.json';

export const siteConfig = {
    author: { name: pkg.author, url: 'https://github.com/ragaeeb' },
    description:
        'Learn touch typing through progressive, personalized lessons. AI-generated content based on your interests. From letters to paragraphs with real-time feedback and visual keyboard guides.',
    features: [
        'Progressive learning path from letters to paragraphs',
        'AI-generated personalized content',
        'Real-time WPM and accuracy tracking',
        'Visual keyboard highlighting',
        'Audio feedback for errors',
        'Passwordless authentication',
    ],
    keywords: [
        'touch typing',
        'typing tutor',
        'learn typing',
        'keyboard practice',
        'AI typing lessons',
        'typing speed',
        'typing accuracy',
        'personalized learning',
        'typing for kids',
        'typing exercises',
    ],
    name: 'KeyStorm',
    title: 'KeyStorm - Master Touch Typing with AI-Powered Lessons',
    url: 'https://keystorm.vercel.app',
};

export const landingMetadata: Metadata = {
    alternates: { canonical: '/landing' },
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.author.name,
    description: siteConfig.description,
    formatDetection: { address: false, email: false, telephone: false },
    keywords: siteConfig.keywords,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
        description: siteConfig.description,
        images: [{ alt: 'KeyStorm - AI-Powered Touch Typing Tutor', height: 630, url: '/api/og', width: 1200 }],
        locale: 'en_US',
        siteName: siteConfig.name,
        title: siteConfig.title,
        type: 'website',
        url: '/landing',
    },
    publisher: siteConfig.author.name,
    robots: {
        follow: true,
        googleBot: {
            follow: true,
            index: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
        index: true,
    },
    title: siteConfig.title,
};

export const landingPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    applicationCategory: 'EducationalApplication',
    author: { '@type': 'Person', name: siteConfig.author.name, url: siteConfig.author.url },
    description: siteConfig.description,
    featureList: siteConfig.features,
    name: siteConfig.name,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    operatingSystem: 'Web Browser',
    url: siteConfig.url,
};
