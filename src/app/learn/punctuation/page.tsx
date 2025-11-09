import { LearnLayout } from '@/components/learn/learn-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function PunctuationPage() {
    return (
        <LearnLayout
            title="Master Punctuation & Symbols"
            description="Punctuation marks add meaning to your writing. Learn where each symbol lives and which finger to use."
            nextRoute="/practice"
            buttonText="Press Enter to Start Punctuation Practice"
        >
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <h3 className="mb-4 font-semibold text-xl">Common Punctuation Marks</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="rounded-lg bg-white p-4">
                            <h4 className="mb-3 font-semibold text-indigo-600">Right Pinky Keys</h4>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">;</kbd>{' '}
                                    <strong>Semicolon</strong> - Base key (no Shift)
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">:</kbd>{' '}
                                    <strong>Colon</strong> - Shift + Semicolon
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">'</kbd>{' '}
                                    <strong>Apostrophe</strong> - Base key (no Shift)
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">"</kbd>{' '}
                                    <strong>Quote</strong> - Shift + Apostrophe
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">/</kbd>{' '}
                                    <strong>Slash</strong> - Base key (no Shift)
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">?</kbd>{' '}
                                    <strong>Question</strong> - Shift + Slash
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-white p-4">
                            <h4 className="mb-3 font-semibold text-purple-600">Other Important Keys</h4>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">,</kbd>{' '}
                                    <strong>Comma</strong> - Right middle finger
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">.</kbd>{' '}
                                    <strong>Period</strong> - Right ring finger
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">!</kbd>{' '}
                                    <strong>Exclamation</strong> - Shift + 1 (left pinky)
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">-</kbd>{' '}
                                    <strong>Hyphen</strong> - Right pinky (top row)
                                </p>
                                <p>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">(</kbd>
                                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">)</kbd>{' '}
                                    <strong>Parentheses</strong> - Shift + 9, Shift + 0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <h4 className="mb-3 font-semibold text-lg">Example: Type "It's great!"</h4>
                        <ol className="space-y-2 text-sm">
                            <li className="flex gap-2">
                                <span className="font-bold">1.</span>
                                <span>Type "It" normally</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">2.</span>
                                <span>
                                    Right pinky to <kbd className="rounded bg-gray-200 px-2 py-1">'</kbd> apostrophe key
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">3.</span>
                                <span>Type "s great"</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">4.</span>
                                <span>
                                    Hold Shift + 1 for <kbd className="rounded bg-gray-200 px-2 py-1">!</kbd>{' '}
                                    exclamation
                                </span>
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <h4 className="mb-3 font-semibold text-lg">Example: Type "Hello, world."</h4>
                        <ol className="space-y-2 text-sm">
                            <li className="flex gap-2">
                                <span className="font-bold">1.</span>
                                <span>Type "Hello"</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">2.</span>
                                <span>
                                    Right middle finger for <kbd className="rounded bg-gray-200 px-2 py-1">,</kbd> comma
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">3.</span>
                                <span>Spacebar, then type "world"</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">4.</span>
                                <span>
                                    Right ring finger for <kbd className="rounded bg-gray-200 px-2 py-1">.</kbd> period
                                </span>
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-800">💡 Pro Tips for Punctuation:</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Most punctuation is on the right side - right pinky does a lot of work!</li>
                    <li>• Remember: Hold Shift for symbols above numbers and for :, ", ?</li>
                    <li>• Period and comma don't need Shift - they're base keys</li>
                    <li>• Apostrophes (') are common in contractions like "don't", "it's", "we're"</li>
                    <li>• Practice slowly - punctuation takes time to memorize</li>
                </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <h4 className="mb-2 font-semibold text-sm">Basic (No Shift)</h4>
                    <div className="flex flex-wrap gap-2">
                        <kbd className="rounded bg-white px-2 py-1 text-xs">.</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">,</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">;</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">'</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">/</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">-</kbd>
                    </div>
                </div>

                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-sm">With Shift</h4>
                    <div className="flex flex-wrap gap-2">
                        <kbd className="rounded bg-white px-2 py-1 text-xs">!</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">?</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">:</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">"</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">(</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">)</kbd>
                    </div>
                </div>

                <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                    <h4 className="mb-2 font-semibold text-sm">Advanced Symbols</h4>
                    <div className="flex flex-wrap gap-2">
                        <kbd className="rounded bg-white px-2 py-1 text-xs">@</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">#</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">$</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">%</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">&amp;</kbd>
                        <kbd className="rounded bg-white px-2 py-1 text-xs">*</kbd>
                    </div>
                </div>
            </div>
        </LearnLayout>
    );
}
