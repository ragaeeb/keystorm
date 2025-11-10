'use client';

import { Keyboard, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthPanel, DefaultPracticeButton } from './client';

/**
 * LandingPage - Main client component for landing page
 *
 * Displays app branding, feature highlights, and authentication options.
 * Handles navigation to start page for both authenticated and guest users.
 *
 * @returns Rendered landing page client component
 */
export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto w-full max-w-5xl"
            >
                <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6 text-center"
                        >
                            <Keyboard className="mx-auto h-20 w-20 text-indigo-600" />
                            <h1 className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold text-5xl text-transparent">
                                KeyStorm
                            </h1>
                            <p className="mt-3 text-gray-600 text-lg">
                                Master touch typing with personalized, themed lessons
                            </p>
                        </motion.div>

                        <div className="mb-10 grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardContent className="pt-6">
                                    <Target className="mx-auto mb-3 h-10 w-10 text-indigo-600" />
                                    <h3 className="mb-2 font-semibold">Progressive Learning</h3>
                                    <p className="text-gray-600 text-sm">
                                        From letters to paragraphs, at your own pace
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <Zap className="mx-auto mb-3 h-10 w-10 text-purple-600" />
                                    <h3 className="mb-2 font-semibold">Real-time Feedback</h3>
                                    <p className="text-gray-600 text-sm">Visual cues and stats to track progress</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <Keyboard className="mx-auto mb-3 h-10 w-10 text-pink-600" />
                                    <h3 className="mb-2 font-semibold">Custom Themes</h3>
                                    <p className="text-gray-600 text-sm">Learn with content that interests you</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex flex-col gap-3 text-center">
                            <Button
                                size="lg"
                                asChild
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-lg"
                            >
                                <Link href="/start">Explore Lessons</Link>
                            </Button>
                            <DefaultPracticeButton />
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
                        <AuthPanel />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
