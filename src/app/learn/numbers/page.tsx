import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * NumbersPage - Tutorial for typing numbers on the number row
 * Server component - no client-side JavaScript needed
 */
export default function NumbersPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="mx-auto max-w-6xl">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Master the Number Row</CardTitle>
                        <CardDescription className="space-y-2">
                            <p className="text-base">
                                Numbers are located on the top row of your keyboard. Each finger reaches up from its
                                home position.
                            </p>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                            <h3 className="mb-4 font-semibold text-xl">Finger-to-Number Mapping</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-indigo-600 text-lg">Left Hand</h4>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>Left Pinky:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">1</kbd>
                                        </p>
                                        <p>
                                            <strong>Left Ring:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">2</kbd>
                                        </p>
                                        <p>
                                            <strong>Left Middle:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">3</kbd>
                                        </p>
                                        <p>
                                            <strong>Left Index:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">4</kbd> and{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">5</kbd>
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-lg text-purple-600">Right Hand</h4>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>Right Index:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">6</kbd> and{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">7</kbd>
                                        </p>
                                        <p>
                                            <strong>Right Middle:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">8</kbd>
                                        </p>
                                        <p>
                                            <strong>Right Ring:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">9</kbd>
                                        </p>
                                        <p>
                                            <strong>Right Pinky:</strong> Reaches up to{' '}
                                            <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">0</kbd>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="mb-3 font-semibold text-lg">Example: Type "5 pillars"</h4>
                                    <ol className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <span className="font-bold">1.</span>
                                            <span>
                                                Reach up with left index to press{' '}
                                                <kbd className="rounded bg-gray-200 px-2 py-1">5</kbd>
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">2.</span>
                                            <span>Return to home position (F key)</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">3.</span>
                                            <span>Press spacebar with thumb</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">4.</span>
                                            <span>Type "pillars" normally</span>
                                        </li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="mb-3 font-semibold text-lg">Example: Type "99 names"</h4>
                                    <ol className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <span className="font-bold">1.</span>
                                            <span>
                                                Reach up with right ring to press{' '}
                                                <kbd className="rounded bg-gray-200 px-2 py-1">9</kbd>
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">2.</span>
                                            <span>
                                                Press <kbd className="rounded bg-gray-200 px-2 py-1">9</kbd> again (same
                                                finger)
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">3.</span>
                                            <span>Press spacebar with thumb</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">4.</span>
                                            <span>Type "names" normally</span>
                                        </li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="rounded-lg bg-yellow-50 p-4">
                            <h4 className="mb-2 font-semibold text-gray-800">💡 Pro Tips:</h4>
                            <ul className="space-y-1 text-gray-700 text-sm">
                                <li>• Keep your fingers on the home row when not typing numbers</li>
                                <li>• Reach straight up - don't move your whole hand</li>
                                <li>• Your index fingers cover TWO numbers each (4+5 and 6+7)</li>
                                <li>• Practice the reach motion slowly at first for muscle memory</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                                <h4 className="mb-2 font-semibold text-gray-800">Number Row Visual Reference:</h4>
                                <div className="flex justify-center gap-1 font-mono text-xl">
                                    <kbd className="rounded bg-gray-300 px-3 py-2">1</kbd>
                                    <kbd className="rounded bg-gray-300 px-3 py-2">2</kbd>
                                    <kbd className="rounded bg-gray-300 px-3 py-2">3</kbd>
                                    <kbd className="rounded bg-blue-300 px-3 py-2">4</kbd>
                                    <kbd className="rounded bg-blue-300 px-3 py-2">5</kbd>
                                    <kbd className="rounded bg-purple-300 px-3 py-2">6</kbd>
                                    <kbd className="rounded bg-purple-300 px-3 py-2">7</kbd>
                                    <kbd className="rounded bg-gray-300 px-3 py-2">8</kbd>
                                    <kbd className="rounded bg-gray-300 px-3 py-2">9</kbd>
                                    <kbd className="rounded bg-gray-300 px-3 py-2">0</kbd>
                                </div>
                                <p className="mt-2 text-center text-gray-600 text-xs">
                                    Blue = Left Index, Purple = Right Index
                                </p>
                            </div>
                        </div>

                        <form action="/practice" className="text-center">
                            <Button type="submit" size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                Press Enter to Start Numbers Practice
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
