'use client';

import { useMemo } from 'react';
import { ALL_FINGERS, FINGER_POSITIONS, KEYBOARD_ROWS } from '@/lib/constants';
import { getKeyPosition } from '@/lib/keyboard';

function getFingerColor(key: string): string {
    const upperKey = key.toUpperCase();
    const position = FINGER_POSITIONS.find((fp) => fp.keys.includes(upperKey));
    return position?.color ?? '#E0E0E0';
}

const renderKeys = (activeKey: string) => {
    return KEYBOARD_ROWS.flatMap((row, rowIndex) => {
        const startX = rowIndex === 1 ? 22 : rowIndex === 2 ? 32 : rowIndex === 3 ? 52 : 12;
        return row.map((key, keyIndex) => {
            const x = startX + keyIndex * 40;
            const y = 60 + rowIndex * 45;
            const color = getFingerColor(key);
            const isActive = activeKey && key.toUpperCase() === activeKey.toUpperCase();
            const keyId = `${rowIndex}-${key}`;
            return (
                <g key={keyId}>
                    <rect
                        x={x}
                        y={y}
                        width="36"
                        height="36"
                        rx="4"
                        fill={isActive ? color : 'url(#keyGradient)'}
                        stroke={color}
                        strokeWidth="2"
                        opacity={isActive ? 1 : 0.8}
                        filter={isActive ? 'url(#glow)' : undefined}
                    />
                    <text x={x + 18} y={y + 23} textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                        {key}
                    </text>
                </g>
            );
        });
    });
};

const renderFinger = (
    finger: (typeof ALL_FINGERS)[number],
    index: number,
    activeFingerIndex: number,
    activeKeyPos: { x: number; y: number } | null,
) => {
    const isActive = index === activeFingerIndex;
    const pos = isActive && activeKeyPos ? activeKeyPos : { x: finger.homeX, y: finger.homeY };
    const baseX = index < 4 ? 140 + index * 25 : 460 - (index - 4) * 25;
    const baseY = 480;
    const tipRadius = finger.width / 2;

    return (
        <g key={finger.name}>
            <path
                d={`M ${baseX - finger.width / 2} ${baseY}
                   L ${pos.x - finger.width / 2} ${pos.y + 20}
                   Q ${pos.x} ${pos.y - 10}, ${pos.x + finger.width / 2} ${pos.y + 20}
                   L ${baseX + finger.width / 2} ${baseY} Z`}
                fill={finger.color}
                opacity={isActive ? 0.95 : 0.85}
                filter={isActive ? 'url(#glow)' : 'url(#shadow)'}
            />
            <ellipse
                cx={pos.x}
                cy={pos.y + 10}
                rx={tipRadius + (isActive ? 3 : 0)}
                ry={tipRadius * 1.3 + (isActive ? 3 : 0)}
                fill={finger.color}
                opacity={isActive ? 1 : 0.9}
                filter={isActive ? 'url(#glow)' : 'url(#shadow)'}
            />
        </g>
    );
};

export default function KeyboardWithHands({ activeKey }: { activeKey: string }) {
    const activeFingerIndex = useMemo(() => {
        if (!activeKey) {
            return -1;
        }
        const k = activeKey.toUpperCase();
        return FINGER_POSITIONS.findIndex((fp) => fp.keys.includes(k));
    }, [activeKey]);

    const activeKeyPos = useMemo(() => {
        if (!activeKey) {
            return null;
        }
        return getKeyPosition(activeKey.toUpperCase());
    }, [activeKey]);

    return (
        <div className="relative mx-auto w-full max-w-3xl">
            <svg viewBox="0 0 600 600" className="h-auto w-full" role="img" aria-labelledby="keyboard-with-hands-title">
                <title id="keyboard-with-hands-title">Keyboard with highlighted keys and finger guides</title>
                <defs>
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                    </filter>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="keyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#2a2a2a', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                {renderKeys(activeKey)}

                <rect
                    x="120"
                    y="285"
                    width="360"
                    height="36"
                    rx="4"
                    fill="url(#keyGradient)"
                    stroke="#888"
                    strokeWidth="2"
                    opacity="0.8"
                />
                <text x="300" y="308" textAnchor="middle" fill="white" fontSize="12">
                    SPACE
                </text>

                {ALL_FINGERS.map((finger, index) => renderFinger(finger, index, activeFingerIndex, activeKeyPos))}
            </svg>
        </div>
    );
}
