'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    if (isStandalone) {
        return null; // Don't show if already installed
    }

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                setDeferredPrompt(null);
            });
        }
    };

    if (!deferredPrompt && !isIOS) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
                <div className="flex-1">
                    <h3 className="text-sm font-medium">Install App</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isIOS
                            ? "Tap the share button and select 'Add to Home Screen'"
                            : 'Add to home screen for a better experience'}
                    </p>
                </div>
                {isIOS ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsIOS(false)} // Just dismiss for iOS as we can't trigger it
                        className="ml-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleInstallClick}>
                            Install
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeferredPrompt(null)}
                            className="ml-auto"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
