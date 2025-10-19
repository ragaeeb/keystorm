# KeyStorm

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/78e2efdc-b5e4-4e88-872f-11bf8cbabe4a.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/78e2efdc-b5e4-4e88-872f-11bf8cbabe4a)
[![codecov](https://codecov.io/gh/ragaeeb/keystorm/graph/badge.svg?token=SW2BBXUEWS)](https://codecov.io/gh/ragaeeb/keystorm)
[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/keystorm)](https://keystorm.vercel.app)
[![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)](https://www.typescriptlang.org)
[![Node.js CI](https://github.com/ragaeeb/keystorm/actions/workflows/build.yml/badge.svg)](https://github.com/ragaeeb/keystorm/actions/workflows/build.yml)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![GitHub License](https://img.shields.io/github/license/ragaeeb/keystorm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, AI-powered touch typing tutor that generates personalized lessons based on your interests.

## Features

- **Progressive Learning Path**: Master typing through four stages - individual letters, words, sentences, and paragraphs
- **AI-Generated Content**: Personalized typing content generated based on your chosen theme using Google's Gemini AI
- **Real-Time Feedback**: Visual keyboard highlighting, WPM tracking, accuracy metrics, and error counting
- **Responsive Design**: Optimized layout that fits any screen size without scrolling
- **Color-Coded Fingers**: Interactive keyboard with color-coded finger positions and tooltips
- **Audio Feedback**: Sound cues for typing errors to reinforce correct technique

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Runtime**: Bun (>=1.3.0)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Motion (Framer Motion)
- **AI**: Google Gemini API (2.5 Flash Lite)
- **Language**: TypeScript with full type safety

## Getting Started

### Prerequisites

- Bun 1.3.0 or higher
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ragaeeb/keystorm.git
cd keystorm
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
echo "GEMINI_API_KEY=your_api_key_here" > .env.local
```

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Landing Page**: Learn about KeyStorm and click "Get Started"
2. **Onboarding**: Enter your name and choose a theme (e.g., "Islam", "Science", "History")
3. **Practice**: Work through progressively challenging lessons:
   - **Level 1**: Type individual letters in random order
   - **Level 2**: Practice themed vocabulary words
   - **Level 3**: Type complete sentences
   - **Level 4**: Master longer paragraphs with alliterations

## Project Structure

```
keystorm/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-lessons/
│   │   │       └── route.ts          # API endpoint for lesson generation
│   │   ├── learn/
│   │   │   └── page.tsx              # Learning instructions page
│   │   ├── practice/
│   │   │   └── page.tsx              # Main practice interface
│   │   └── page.tsx                  # Landing page redirect
│   ├── components/
│   │   ├── typing/
│   │   │   ├── KeyboardWithHands.tsx # Visual keyboard component
│   │   │   ├── FingerLegend.tsx      # Finger position legend
│   │   │   └── HandsOverlay.tsx      # SVG hands overlay
│   │   └── ui/                       # shadcn/ui components
│   ├── hooks/
│   │   └── useTypingGame.ts          # Custom hook for typing logic
│   ├── lib/
│   │   ├── gemini.ts                 # Gemini API client
│   │   ├── lesson-generator.ts       # Lesson content generation
│   │   └── constants.ts              # App constants
│   └── utils/
│       ├── keyboard-utils.ts         # Keyboard position utilities
│       └── stats-calculator.ts       # WPM and accuracy calculations
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### POST `/api/generate-lessons`

Generates personalized typing lessons based on a theme.

**Request Body:**
```json
{
  "theme": "Islam"
}
```

**Response:**
```json
{
  "lessons": [
    {
      "type": "letters",
      "level": 1,
      "content": ["a", "s", "d", ...]
    },
    {
      "type": "words",
      "level": 2,
      "content": ["salat", "zakat", ...]
    },
    ...
  ]
}
```

## Performance Optimizations

- Memoized components and calculations to minimize re-renders
- Efficient event handlers with `useCallback`
- Optimized SVG rendering for keyboard visualization
- Debounced API calls with retry logic and rate limiting
- Arrow functions throughout for cleaner syntax

## Development

### Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome

### Code Style

- TypeScript with strict mode enabled
- Arrow functions preferred over function declarations
- Type definitions using `type` over `interface`
- No comments in code (self-documenting)
- Biome for linting and formatting

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Keyboard layout image from Wikimedia Commons (CC BY-SA 3.0)
- shadcn/ui for beautiful component primitives
- Google Gemini for AI-powered content generation

## Support

For issues, questions, or suggestions, please open an issue on [GitHub](https://github.com/ragaeeb/keystorm/issues).

---

Made with ❤️ by [Ragaeeb Haq](https://github.com/ragaeeb)