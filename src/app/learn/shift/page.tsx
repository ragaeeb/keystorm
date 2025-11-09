import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * ShiftKeyPage - Tutorial for using the Shift key with capital letters
 * Server component - no client-side JavaScript needed
 */
export default function ShiftKeyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="mx-auto max-w-6xl">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Master the Shift Key</CardTitle>
                        <CardDescription className="space-y-2">
                            <p className="text-base">
                                Now you'll learn to type capital letters using the <strong>Shift</strong> key.
                            </p>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                            <h3 className="mb-4 font-semibold text-xl">How to Use Shift</h3>
                            <div className="space-y-3 text-gray-700">
                                <p>
                                    <strong>Left Shift:</strong> Use your <strong>left pinky</strong> when typing
                                    letters with your <strong>right hand</strong>
                                </p>
                                <p>
                                    <strong>Right Shift:</strong> Use your <strong>right pinky</strong> when typing
                                    letters with your <strong>left hand</strong>
                                </p>
                                <p className="mt-4 rounded-md bg-white p-3 text-sm">
                                    💡 <strong>Tip:</strong> Press and hold Shift, then press the letter key, then
                                    release both keys
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="mb-3 font-semibold text-lg">Example: Type "Apple"</h4>
                                    <ol className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <span className="font-bold">1.</span>
                                            <span>
                                                Hold down{' '}
                                                <kbd className="rounded bg-gray-200 px-2 py-1">Right Shift</kbd> with
                                                right pinky
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">2.</span>
                                            <span>
                                                Press <kbd className="rounded bg-gray-200 px-2 py-1">A</kbd> with left
                                                pinky
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">3.</span>
                                            <span>Release both keys</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">4.</span>
                                            <span>Type "pple" normally</span>
                                        </li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="mb-3 font-semibold text-lg">Example: Type "Jupiter"</h4>
                                    <ol className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <span className="font-bold">1.</span>
                                            <span>
                                                Hold down{' '}
                                                <kbd className="rounded bg-gray-200 px-2 py-1">Left Shift</kbd> with
                                                left pinky
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">2.</span>
                                            <span>
                                                Press <kbd className="rounded bg-gray-200 px-2 py-1">J</kbd> with right
                                                index
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">3.</span>
                                            <span>Release both keys</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold">4.</span>
                                            <span>Type "upiter" normally</span>
                                        </li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="rounded-lg bg-yellow-50 p-4 text-center">
                            <p className="text-gray-700 text-sm">
                                <strong>Remember:</strong> Use the opposite Shift key from the hand typing the letter.
                                This keeps your typing rhythm smooth and prevents hand strain.
                            </p>
                        </div>

                        <form action="/practice/capitals" className="text-center">
                            <Button type="submit" size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                Press Enter to Practice Capital Letters
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
