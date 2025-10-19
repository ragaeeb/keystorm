export type LessonType = 'letters' | 'words' | 'sentences' | 'paragraphs';

export type Lesson = { content: string[]; level: number; type: LessonType };
