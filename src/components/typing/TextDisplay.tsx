import { useMemo } from 'react';

type TextDisplayProps = { targetText: string; userInput: string };

export const TextDisplay = ({ targetText, userInput }: TextDisplayProps) => {
    const displayText = useMemo(
        () =>
            targetText.split('').map((char, i) => {
                let className = 'text-xl ';
                if (i < userInput.length) {
                    className += userInput[i] === char ? 'text-green-600' : 'text-red-600 font-bold';
                } else if (i === userInput.length) {
                    className += 'text-gray-900 border-b-2 border-blue-500';
                } else {
                    className += 'text-gray-400';
                }
                const key = `${char}-${i}`;
                return (
                    <span key={key} className={className}>
                        {char}
                    </span>
                );
            }),
        [targetText, userInput],
    );

    return <div className="rounded-lg bg-gray-50 p-4 font-mono leading-relaxed">{displayText}</div>;
};
