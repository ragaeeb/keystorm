import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const GET = async () => {
    return new ImageResponse(
        <div
            style={{
                alignItems: 'center',
                backgroundColor: '#fff',
                backgroundImage: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 50%, #faf5ff 100%)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <title>Keystorm</title>
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="#4f46e5" />
                    <rect x="4" y="6" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="7" y="6" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="10" y="6" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="13" y="6" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="16" y="6" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="4" y="9" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="7" y="9" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="10" y="9" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="13" y="9" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="5" y="12" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="8" y="12" width="2" height="2" rx="0.5" fill="#fff" />
                    <rect x="11" y="12" width="8" height="2" rx="0.5" fill="#a78bfa" />
                </svg>
            </div>

            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h1
                    style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        fontSize: 80,
                        fontWeight: 'bold',
                        margin: 0,
                        WebkitBackgroundClip: 'text',
                    }}
                >
                    KeyStorm
                </h1>

                <p style={{ color: '#6b7280', fontSize: 32, margin: 0, maxWidth: '80%', textAlign: 'center' }}>
                    Master touch typing with AI-powered personalized lessons
                </p>

                <div style={{ display: 'flex', gap: 30, marginTop: 20 }}>
                    <div
                        style={{
                            alignItems: 'center',
                            backgroundColor: '#f3f4f6',
                            borderRadius: 12,
                            display: 'flex',
                            gap: 10,
                            padding: '15px 25px',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>🎯</span>
                        <span style={{ color: '#374151', fontSize: 20 }}>Progressive Learning</span>
                    </div>

                    <div
                        style={{
                            alignItems: 'center',
                            backgroundColor: '#f3f4f6',
                            borderRadius: 12,
                            display: 'flex',
                            gap: 10,
                            padding: '15px 25px',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>⚡</span>
                        <span style={{ color: '#374151', fontSize: 20 }}>Real-time Feedback</span>
                    </div>

                    <div
                        style={{
                            alignItems: 'center',
                            backgroundColor: '#f3f4f6',
                            borderRadius: 12,
                            display: 'flex',
                            gap: 10,
                            padding: '15px 25px',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>🎨</span>
                        <span style={{ color: '#374151', fontSize: 20 }}>Custom Themes</span>
                    </div>
                </div>
            </div>
        </div>,
        { height: 630, width: 1200 },
    );
};
