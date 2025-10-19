'use client';

import * as React from 'react';

type Props = {
    /** tweak overall vertical alignment over the Keypad */
    y?: number; // px
    /** skin tone color */
    skin?: string;
    /** subtle shadow opacity */
    shadow?: number;
    className?: string;
};

/**
 * HandsOverlay
 * - Place this absolutely over the Keypad container.
 * - Uses pure inline SVG so nothing external is loaded.
 * - Adjust `y` if your Keypad height changes.
 */
export default function HandsOverlay({
    y = 6,
    skin = '#D1A682',
    shadow = 0.28,
    className = 'pointer-events-none absolute inset-0 select-none',
}: Props) {
    return (
        <div className={className} style={{ top: `${y}%` }}>
            <svg viewBox="0 0 1000 380" preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden>
                <defs>
                    <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity={shadow} />
                    </filter>
                    <linearGradient id="knuckleShine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </linearGradient>
                    <style>{`
            .joint{rx:22; filter:url(#handShadow)}
            .finger{filter:url(#handShadow)}
          `}</style>
                </defs>

                {/* LEFT HAND */}
                <g transform="translate(300,70) rotate(-7)">
                    {/* Palm */}
                    <ellipse cx="0" cy="190" rx="118" ry="92" fill={skin} filter="url(#handShadow)" />
                    {/* Thumb */}
                    <rect
                        x="80"
                        y="170"
                        width="96"
                        height="42"
                        rx="22"
                        fill={skin}
                        transform="rotate(32 80 170)"
                        className="finger"
                    />
                    {/* Fingers (pinky -> index) */}
                    <g>
                        <rect x="-105" y="90" width="40" height="150" fill={skin} className="finger" />
                        <rect x="-60" y="70" width="44" height="170" fill={skin} className="finger" />
                        <rect x="-12" y="62" width="48" height="178" fill={skin} className="finger" />
                        <rect x="42" y="78" width="48" height="162" fill={skin} className="finger" />
                        {/* knuckle sheen */}
                        <rect x="-105" y="90" width="40" height="22" fill="url(#knuckleShine)" className="joint" />
                        <rect x="-60" y="70" width="44" height="22" fill="url(#knuckleShine)" className="joint" />
                        <rect x="-12" y="62" width="48" height="22" fill="url(#knuckleShine)" className="joint" />
                        <rect x="42" y="78" width="48" height="22" fill="url(#knuckleShine)" className="joint" />
                    </g>
                </g>

                {/* RIGHT HAND */}
                <g transform="translate(700,70) rotate(7)">
                    {/* Palm */}
                    <ellipse cx="0" cy="190" rx="118" ry="92" fill={skin} filter="url(#handShadow)" />
                    {/* Thumb */}
                    <rect
                        x="-176"
                        y="170"
                        width="96"
                        height="42"
                        rx="22"
                        fill={skin}
                        transform="rotate(-32 -176 170)"
                        className="finger"
                    />
                    {/* Fingers (index -> pinky, mirrored order) */}
                    <g>
                        <rect x="-88" y="78" width="48" height="162" fill={skin} className="finger" />
                        <rect x="-36" y="62" width="48" height="178" fill={skin} className="finger" />
                        <rect x="12" y="70" width="44" height="170" fill={skin} className="finger" />
                        <rect x="58" y="90" width="40" height="150" fill={skin} className="finger" />
                        {/* knuckle sheen */}
                        <rect x="-88" y="78" width="48" height="22" fill="url(#knuckleShine)" className="joint" />
                        <rect x="-36" y="62" width="48" height="22" fill="url(#knuckleShine)" className="joint" />
                        <rect x="12" y="70" width="44" height="22" fill="url(#knuckleShine)" className="joint" />
                        <rect x="58" y="90" width="40" height="22" fill="url(#knuckleShine)" className="joint" />
                    </g>
                </g>

                {/* Thumb labels (kept subtle) */}
                <text x="420" y="355" textAnchor="middle" fill="#8B6F47" fontWeight="700" fontSize="14">
                    Left Thumb
                </text>
                <text x="580" y="355" textAnchor="middle" fill="#8B6F47" fontWeight="700" fontSize="14">
                    Right Thumb
                </text>
            </svg>
        </div>
    );
}
