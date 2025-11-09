import type { Lesson } from '@/types/lesson';

export const DEFAULT_ISLAMIC_LESSONS: ReadonlyArray<Lesson> = [
    {
        content: [
            'a',
            's',
            'd',
            'f',
            'j',
            'k',
            'l',
            ';',
            'g',
            'h',
            'e',
            'i',
            'r',
            'u',
            'w',
            'o',
            'q',
            'p',
            't',
            'y',
            'v',
            'm',
            'c',
            'n',
            'b',
            'x',
            'z',
        ],
        level: 1,
        type: 'letters',
    },
    {
        content: ['salat', 'zakat', 'birr', 'taqwa', 'imam', 'umar', 'ali', 'fatima', 'aisha', 'muhammad'],
        level: 2,
        type: 'words',
    },
    {
        content: [
            'there are five daily obligatory prayers',
            'charity purifies the soul and wealth',
            'patience is a virtue in times of hardship',
        ],
        level: 3,
        type: 'sentences',
    },
    {
        content: [
            'patience persists through persistent practice believers build bridges between belief and benevolence sincere servants seek sacred serenity',
        ],
        level: 4,
        type: 'paragraphs',
    },
];
