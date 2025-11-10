import { LearnLayout } from '@/components/learn/learn-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function ShiftKeyPage() {
    return (
        <LearnLayout
            title="Master the Shift Key"
            description="Now you'll learn to type capital letters using the Shift key."
            nextRoute="/practice/capitals"
            buttonText="Press Enter to Practice Capital Letters"
        >
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <h3 className="mb-4 font-semibold text-xl">How to Use Shift</h3>
                <div className="space-y-3 text-gray-700">
                    <p>
                        <strong>Left Shift:</strong> Use your <strong>left pinky</strong> when typing letters with your{' '}
                        <strong>right hand</strong>
                    </p>
                    <p>
                        <strong>Right Shift:</strong> Use your <strong>right pinky</strong> when typing letters with
                        your <strong>left hand</strong>
                    </p>
                    <p className="mt-4 rounded-md bg-white p-3 text-sm">
                        💡 <strong>Tip:</strong> Press and hold Shift, then press the letter key, then release both keys
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
                                    Hold down <kbd className="rounded bg-gray-200 px-2 py-1">Right Shift</kbd> with
                                    right pinky
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">2.</span>
                                <span>
                                    Press <kbd className="rounded bg-gray-200 px-2 py-1">A</kbd> with left pinky
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
                                    Hold down <kbd className="rounded bg-gray-200 px-2 py-1">Left Shift</kbd> with left
                                    pinky
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">2.</span>
                                <span>
                                    Press <kbd className="rounded bg-gray-200 px-2 py-1">J</kbd> with right index
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
                    <strong>Remember:</strong> Use the opposite Shift key from the hand typing the letter. This keeps
                    your typing rhythm smooth and prevents hand strain.
                </p>
            </div>
        </LearnLayout>
    );
}
