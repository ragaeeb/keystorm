// FILE: src/components/typing/KeyboardVisual.tsx
'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FINGER_POSITIONS, KEYBOARD_ROWS } from '@/lib/constants';
import { getFingerColor, getKeyPosition } from '@/lib/keyboard';

const ALL_FINGERS = [
    { color: FINGER_POSITIONS[0].color, homeX: 32, homeY: 167, name: 'Left Pinky', width: 28 },
    { color: FINGER_POSITIONS[1].color, homeX: 72, homeY: 167, name: 'Left Ring', width: 30 },
    { color: FINGER_POSITIONS[2].color, homeX: 112, homeY: 167, name: 'Left Middle', width: 30 },
    { color: FINGER_POSITIONS[3].color, homeX: 152, homeY: 167, name: 'Left Index', width: 30 },
    { color: FINGER_POSITIONS[4].color, homeX: 232, homeY: 167, name: 'Right Index', width: 30 },
    { color: FINGER_POSITIONS[5].color, homeX: 272, homeY: 167, name: 'Right Middle', width: 30 },
    { color: FINGER_POSITIONS[6].color, homeX: 312, homeY: 167, name: 'Right Ring', width: 30 },
    { color: FINGER_POSITIONS[7].color, homeX: 352, homeY: 167, name: 'Right Pinky', width: 28 },
];

type KeyboardVisualProps = { activeKey: string; className?: string };

const renderKeyboardKeys = (activeKey: string) => {
    return KEYBOARD_ROWS.flatMap((row, rowIndex) => {
        const startX = rowIndex === 1 ? 22 : rowIndex === 2 ? 32 : rowIndex === 3 ? 52 : 12;
        return row.map((key, keyIndex) => {
            const x = startX + keyIndex * 40;
            const y = 40 + rowIndex * 40;
            const color = getFingerColor(key);
            const isActive = activeKey && key.toUpperCase() === activeKey.toUpperCase();
            const keyId = `${rowIndex}-${key}`;
            return (
                <g key={keyId}>
                    <rect
                        x={x}
                        y={y}
                        width="34"
                        height="34"
                        rx="4"
                        fill={isActive ? color : 'url(#keyGradient)'}
                        stroke={color}
                        strokeWidth="2"
                        opacity={isActive ? 1 : 0.8}
                        filter={isActive ? 'url(#glow)' : undefined}
                    />
                    <text x={x + 17} y={y + 22} textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                        {key}
                    </text>
                </g>
            );
        });
    });
};

const renderFingerHighlight = (
    finger: (typeof ALL_FINGERS)[number],
    index: number,
    activeFingerIndex: number,
    activeKeyPos: { x: number; y: number } | null,
) => {
    const isActive = index === activeFingerIndex;
    const pos = isActive && activeKeyPos ? activeKeyPos : { x: finger.homeX, y: finger.homeY };
    const baseX = index < 4 ? 140 + index * 25 : 460 - (index - 4) * 25;
    const baseY = 340;
    const tipRadius = finger.width / 2;

    return (
        <Tooltip key={finger.name} delayDuration={0}>
            <TooltipTrigger asChild>
                <g className="cursor-pointer" tabIndex={0}>
                    <path
                        d={`M ${baseX - finger.width / 2} ${baseY}
                         L ${pos.x - finger.width / 2} ${pos.y + 15}
                         Q ${pos.x} ${pos.y - 8}, ${pos.x + finger.width / 2} ${pos.y + 15}
                         L ${baseX + finger.width / 2} ${baseY} Z`}
                        fill={finger.color}
                        opacity={isActive ? 0.95 : 0.75}
                        filter={isActive ? 'url(#glow)' : 'url(#shadow)'}
                    />
                    <ellipse
                        cx={pos.x}
                        cy={pos.y + 8}
                        rx={tipRadius + (isActive ? 2 : 0)}
                        ry={tipRadius * 1.2 + (isActive ? 2 : 0)}
                        fill={finger.color}
                        opacity={isActive ? 1 : 0.8}
                        filter={isActive ? 'url(#glow)' : 'url(#shadow)'}
                    />
                </g>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" sideOffset={12} className="translate-y-[-4px]">
                <p>{finger.name}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export const KeyboardVisual = ({ activeKey, className }: KeyboardVisualProps) => {
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
        <TooltipProvider delayDuration={150}>
            <div className={clsx('relative mx-auto w-full', className)}>
                <svg viewBox="0 0 600 400" className="h-auto w-full" role="img" aria-labelledby="keyboard-visual-title">
                    <title id="keyboard-visual-title">Typing keyboard with highlighted finger guides</title>
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

                    {renderKeyboardKeys(activeKey)}

                    <rect
                        x="120"
                        y="200"
                        width="360"
                        height="34"
                        rx="4"
                        fill="url(#keyGradient)"
                        stroke="#888"
                        strokeWidth="2"
                        opacity="0.8"
                    />
                    <text x="300" y="220" textAnchor="middle" fill="white" fontSize="11">
                        SPACE
                    </text>

                    {ALL_FINGERS.map((finger, index) =>
                        renderFingerHighlight(finger, index, activeFingerIndex, activeKeyPos),
                    )}
                </svg>
            </div>
        </TooltipProvider>
    );
};
