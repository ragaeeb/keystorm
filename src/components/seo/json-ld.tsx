type JsonLdProps = { data: { '@context': string; '@type': string; [key: string]: unknown } };

export const JsonLd = ({ data }: JsonLdProps) => {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for SEO
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
};
