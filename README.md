# KeyStorm ⌨️

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/78e2efdc-b5e4-4e88-872f-11bf8cbabe4a.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/78e2efdc-b5e4-4e88-872f-11bf8cbabe4a)
[![codecov](https://codecov.io/gh/ragaeeb/keystorm/graph/badge.svg?token=SW2BBXUEWS)](https://codecov.io/gh/ragaeeb/keystorm)
[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/keystorm)](https://keystorm.vercel.app)
[![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)](https://www.typescriptlang.org)
[![Node.js CI](https://github.com/ragaeeb/keystorm/actions/workflows/build.yml/badge.svg)](https://github.com/ragaeeb/keystorm/actions/workflows/build.yml)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![GitHub License](https://img.shields.io/github/license/ragaeeb/keystorm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, AI-powered touch typing tutor that generates personalized lessons based on your interests. Master typing through 10 progressive levels with smart caching and lazy loading for optimal performance.

## Features

### 🎯 Progressive Learning Path (10 Levels)
1. **Letters** - Master individual keys with finger placement guidance
2. **Words** - Build fluency with simple lowercase words
3. **Capitals** - Learn Shift key coordination (with tutorial)
4. **Sentences** - Practice proper capitalization and basic punctuation
5. **Numbers** - Master the number row (with tutorial)
6. **Mixed Content** - Combine letters, numbers, and mixed case
7. **Punctuation** - Complex punctuation marks and symbols (with tutorial)
8. **Paragraphs** - Short paragraphs with varied content
9. **Advanced** - Long paragraphs with advanced vocabulary
10. **Expert** - Master all character types in complex, real-world content

### 🎓 Interactive Tutorials
- **Keyboard Positioning** - Visual guide to home row finger placement
- **Shift Key Tutorial** - Learn proper Shift key technique for capitals
- **Number Row Training** - Finger-to-number mapping with visual guides
- **Punctuation Guide** - Symbol locations and Shift requirements

### 🤖 AI-Powered with Smart Optimizations
- **TOON Format**: 30-60% token reduction compared to JSON
- **Lazy Loading**: Advanced levels generate only when needed
- **Redis Caching**: Repeated themes served from cache (3-day TTL)
- **Background Prefetching**: Next level loads while you practice
- **Cost Efficient**: ~40% reduction in AI API costs

### ⚡ Performance Optimizations
- **Chunked Generation**: Early levels (1-4) generate first, advanced (5-10) on-demand
- **Split JSON Files**: Granular loading per level (~4-8KB each vs 48KB monolithic)
- **Intelligent Caching**: Theme-based Redis cache with SHA-256 hashing
- **Prefetch Strategy**: Next level loads in background when you start current level

### 📊 Real-Time Feedback
- **WPM (Words Per Minute)** tracking
- **Accuracy percentage** calculation with live updates
- **Error counting** with audio feedback
- **Visual keyboard highlighting** shows next key
- **Progress bars** for each level
- **Performance summary** with detailed statistics

### 🎨 Modern UI/UX
- Beautiful gradient design with Tailwind CSS
- Smooth animations with Framer Motion
- Responsive layout (mobile, tablet, desktop)
- Confetti celebrations on level completion
- Audio cues for correct/incorrect keystrokes
- Dark mode support (coming soon)

### 🔐 Secure Authentication
- **Passwordless email login** with 6-digit codes
- **Guest mode** with default Islamic-themed lessons
- NextAuth.js integration
- Rate-limited auth attempts (5 per 5 minutes)
- Secure session management

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Runtime**: Bun (>=1.3.2)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Animations**: Motion (Framer Motion)
- **AI**: Google Gemini 2.5 Flash Lite with TOON format
- **Authentication**: NextAuth.js with Resend email delivery
- **Caching**: Upstash Redis (auth codes + lesson caching)
- **Storage**: localStorage (preferences), sessionStorage (lessons)
- **Language**: TypeScript with full type safety

## Getting Started

### Prerequisites

- Bun 1.3.2 or higher
- Google Gemini API key
- Upstash Redis database (for auth codes + lesson caching)
- Resend API key (optional locally; required for production)

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
cat <<'ENV' > .env.local
GEMINI_API_KEY=your_api_key_here
NEXTAUTH_SECRET=generate_a_long_random_string
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="KeyStorm <login@yourdomain.com>"
ENV
```

> 💡 **Development Tip**: If you skip the Resend API key locally, one-time codes are logged to the terminal for easy testing.

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Guest Mode (Quick Start)
1. Visit the landing page
2. Click "Continue with default practice"
3. Enter optional name
4. Click "Use default Islamic lessons"
5. Follow the progressive 10-level path with contextual tutorials

### Personalized Mode (AI-Generated)
1. Sign in with email (passwordless authentication)
2. Enter your name and choose a theme (e.g., "Space Exploration")
3. Generate AI-powered lessons based on your theme
4. **Early levels (1-4) generate immediately** (~3 seconds)
5. **Advanced levels (5-10) generate when you reach level 5** (lazy loaded)
6. **Repeat themes load instantly from Redis cache** (3-day TTL)

## Architecture Highlights

### Lazy Loading Strategy
```
User starts → Generate levels 1-4 → Cache in Redis → User practices
                     ↓
         User reaches level 4 → Generate levels 5-10 in background
                     ↓
              Levels 5-10 ready before user needs them
```

### Caching Strategy
```
Request theme → Check Redis cache → HIT: Return cached (instant)
                                  ↓
                              MISS: Generate with AI → Cache for 3 days
```

### Token Optimization
```
JSON Format:   ~8,000 tokens per request
TOON Format:   ~3,200 tokens per request (60% reduction)
Lazy Loading:  Only generate what's needed when needed
Redis Cache:   Repeated themes = 0 tokens (100% savings)
```

## API Endpoints

### POST `/api/generate-lessons`

Generates personalized typing lessons with intelligent caching and lazy loading.

**Authentication**: Requires valid NextAuth session

**Request Body:**
```json
{
  "theme": "Science",
  "levelsNeeded": "early"  // or "all" (optional, defaults to "all")
}
```

**Response** (from cache or freshly generated):
```json
{
  "lessons": [
    { "type": "letters", "level": 1, "content": ["s", "c", ...] },
    { "type": "words", "level": 2, "content": ["atom", ...] },
    // ... up to 10 levels
  ],
  "cached": true,  // true if served from Redis cache
  "cacheKey": "lessons:theme:a1b2c3d4:v1"
}
```

**Caching Behavior**:
- First request: Generates with AI, caches for 3 days
- Subsequent requests: Serves from Redis (instant, zero tokens)
- Cache key: SHA-256 hash of normalized theme
- TTL: 3 days (259,200 seconds)

**Lazy Loading**:
- `levelsNeeded: "early"` → Only generates levels 1-4 (~3s, ~3,200 tokens)
- `levelsNeeded: "all"` → Generates all 10 levels (~6s, ~6,400 tokens)

### GET `/api/og`

Generates Open Graph preview image for social media sharing.

**Response**: 1200x630px PNG image

## Storage Strategy

### localStorage (Persistent, Client-Side)
- User display name
- Selected theme preferences

### sessionStorage (Per-Session, Client-Side)
- Current lesson content
- Level completion status
- Practice session summary
- Prefetched levels cache

### Redis (3-Day TTL, Server-Side)
- One-time authentication codes (10-minute TTL, SHA-256 hashed)
- AI-generated lessons cache (3-day TTL, theme-keyed)
- Rate limiting counters

### Public JSON Files (Static, Lazy-Loaded)
```
/public/lessons/
  ├── level-1.json   (~2KB)  - Letters
  ├── level-2.json   (~4KB)  - Words
  ├── level-3.json   (~4KB)  - Capitals
  ├── level-4.json   (~6KB)  - Sentences
  ├── level-5.json   (~5KB)  - Numbers
  ├── level-6.json   (~8KB)  - Mixed
  ├── level-7.json   (~12KB) - Punctuation
  ├── level-8.json   (~15KB) - Paragraphs
  ├── level-9.json   (~22KB) - Advanced
  └── level-10.json  (~30KB) - Expert
```

Levels load on-demand: early levels (1-4) load immediately, advanced levels (5-10) prefetch when user starts level 4.

## Performance Metrics

### Token Efficiency
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Prompt tokens | ~8,000 | ~3,200 | 60% reduction |
| API cost/request | $0.024 | $0.010 | 58% savings |
| Cache hit (repeat theme) | N/A | 0 tokens | 100% savings |
| Lazy loading (early only) | ~8,000 | ~2,000 | 75% reduction |

### Cost Analysis (10,000 users/month)
- Without optimizations: ~$240/month
- With TOON + caching: ~$48/month (**80% savings**)
- Cache hit rate: ~40-60% for popular themes

### Loading Performance
| Action | Time | Notes |
|--------|------|-------|
| Initial page load | <1s | Server-side render |
| Early levels (1-4) generate | ~3s | First request |
| Advanced levels (5-10) generate | ~5s | Background, lazy |
| Cache hit (any theme) | <200ms | Redis lookup |
| Level JSON load | <100ms | 2-30KB per level |

## Development

### Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome
- `bun test` - Run unit tests

### Code Style

- TypeScript with strict mode enabled
- Arrow functions preferred over function declarations
- Type definitions using `type` over `interface`
- No inline comments (self-documenting code)
- Biome for linting and formatting
- Small, testable utility functions

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI API key for lesson generation |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing (32+ chars) |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis authentication token |
| `RESEND_API_KEY` | No* | Resend API key for email delivery |
| `EMAIL_FROM` | Yes | Sender email address for auth codes |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS allowed origins |

\* Required in production; optional locally (codes logged to console)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in project settings
3. Ensure `/public/lessons/*.json` files are included
4. Deploy automatically on push to main branch

### Redis Configuration

Upstash Redis is used for two purposes:
1. **Authentication codes**: Short-lived (10 minutes)
2. **Lesson caching**: Medium-lived (3 days)

Recommended Upstash plan: **Free tier** (10,000 requests/day)
- Sufficient for ~500 active users/day
- Cache hit rate reduces Redis load by 40-60%

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Commit your changes (`git commit -m 'Add feature description'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a pull request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TOON Format](https://github.com/toon-format/toon) - Token-efficient data notation
- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Google Gemini](https://ai.google.dev) - AI lesson generation
- [Upstash](https://upstash.com) - Serverless Redis
- [Resend](https://resend.com) - Transactional email

## Support

For issues, questions, or suggestions:
- **Bug Reports**: [GitHub Issues](https://github.com/ragaeeb/keystorm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ragaeeb/keystorm/discussions)
- **Documentation**: See [AGENTS.md](AGENTS.md) for technical details

---

**Made with ❤️ by [Ragaeeb Haq](https://github.com/ragaeeb)**

**Star ⭐ this repo if you find it helpful!**
