import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { NextRequest } from 'next/server';

// Mock Redis BEFORE importing auth module
mock.module('@upstash/redis', () => ({
    Redis: class MockRedis {
        static fromEnv() {
            return new MockRedis();
        }
    },
}));

const mockAuth = mock(() => Promise.resolve(null));
const mockGenerateLessons = mock(() => Promise.resolve([]));
const mockIsThemeAllowed = mock(() => true);

mock.module('@/auth', () => ({ auth: mockAuth }));

mock.module('@/lib/lesson/generator', () => ({ generateLessons: mockGenerateLessons }));

mock.module('@/lib/theme-validation', () => ({ isThemeAllowed: mockIsThemeAllowed }));

// Import POST after all mocks are set up
const { POST } = await import('./route');

const createMockRequest = (body: unknown) => {
    return { json: async () => body } as NextRequest;
};

describe('POST /api/generate-lessons', () => {
    beforeEach(() => {
        mockAuth.mockClear();
        mockGenerateLessons.mockClear();
        mockIsThemeAllowed.mockClear();
    });

    it('should return 401 when user is not authenticated', async () => {
        mockAuth.mockResolvedValue(null);
        const request = createMockRequest({ theme: 'Science' });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when session exists but user is missing', async () => {
        mockAuth.mockResolvedValue({ user: null });
        const request = createMockRequest({ theme: 'Science' });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when theme is missing', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        const request = createMockRequest({});

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Theme is required' });
    });

    it('should return 400 when theme is empty string', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        const request = createMockRequest({ theme: '' });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Theme is required' });
    });

    it('should return 400 when theme is not a string', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        const request = createMockRequest({ theme: 123 });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Theme is required' });
    });

    it('should return 400 when theme is not allowed', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockIsThemeAllowed.mockReturnValue(false);
        const request = createMockRequest({ theme: 'inappropriate' });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Theme is not permitted' });
        expect(mockIsThemeAllowed).toHaveBeenCalledWith('inappropriate');
    });

    it('should trim theme before validation', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockIsThemeAllowed.mockReturnValue(true);
        mockGenerateLessons.mockResolvedValue([{ content: ['a', 'b'], level: 1, type: 'letters' }]);
        const request = createMockRequest({ theme: '  Science  ' });

        await POST(request);

        expect(mockIsThemeAllowed).toHaveBeenCalledWith('Science');
        expect(mockGenerateLessons).toHaveBeenCalledWith('Science');
    });

    it('should return 200 with lessons on success', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockIsThemeAllowed.mockReturnValue(true);
        const mockLessons = [
            { content: ['a', 'b', 'c'], level: 1, type: 'letters' },
            { content: ['apple', 'banana'], level: 2, type: 'words' },
        ];
        mockGenerateLessons.mockResolvedValue(mockLessons);
        const request = createMockRequest({ theme: 'Science' });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({ lessons: mockLessons });
        expect(mockGenerateLessons).toHaveBeenCalledWith('Science');
    });

    it('should return 500 when generateLessons throws an error', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockIsThemeAllowed.mockReturnValue(true);
        mockGenerateLessons.mockRejectedValue(new Error('AI generation failed'));
        const request = createMockRequest({ theme: 'Science' });

        const consoleErrorSpy = mock(() => {});
        const originalConsoleError = console.error;
        console.error = consoleErrorSpy;

        const response = await POST(request);
        const data = await response.json();

        console.error = originalConsoleError;

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to generate lessons' });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating lessons:', { message: 'AI generation failed' });
    });

    it('should return 500 when generateLessons throws non-Error', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockIsThemeAllowed.mockReturnValue(true);
        mockGenerateLessons.mockRejectedValue('String error');
        const request = createMockRequest({ theme: 'Science' });

        const consoleErrorSpy = mock(() => {});
        const originalConsoleError = console.error;
        console.error = consoleErrorSpy;

        const response = await POST(request);
        const data = await response.json();

        console.error = originalConsoleError;

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to generate lessons' });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating lessons:', { message: 'Unknown error' });
    });

    it('should handle invalid JSON in request body', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        const request = {
            json: async () => {
                throw new Error('Invalid JSON');
            },
        } as NextRequest;

        const consoleErrorSpy = mock(() => {});
        const originalConsoleError = console.error;
        console.error = consoleErrorSpy;

        const response = await POST(request);
        const data = await response.json();

        console.error = originalConsoleError;

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to generate lessons' });
    });

    it('should handle auth throwing an error', async () => {
        mockAuth.mockRejectedValue(new Error('Auth service down'));
        const request = createMockRequest({ theme: 'Science' });

        const consoleErrorSpy = mock(() => {});
        const originalConsoleError = console.error;
        console.error = consoleErrorSpy;

        const response = await POST(request);
        const data = await response.json();

        console.error = originalConsoleError;

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to generate lessons' });
    });
});
