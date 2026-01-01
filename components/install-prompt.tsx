'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [shouldShow, setShouldShow] = useState(false);

    const STORAGE_KEY = 'pwa_prompt_dismissed_at';
    const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        // Check localStorage logic
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (dismissedAt) {
            const timePassed = Date.now() - parseInt(dismissedAt, 10);
            if (timePassed > DAYS_30_MS) {
                setShouldShow(true);
            } else {
                setShouldShow(false);
            }
        } else {
            setShouldShow(true);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setShouldShow(false);
        setDeferredPrompt(null);
    };

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
                // Store preference regardless of outcome locally to avoid spam, 
                // OR technically if they install, we don't need to show again (handled by isStandalone check usually),
                // but if they cancel the native prompt, we treat it as a dismissal too for our custom UI.
                localStorage.setItem(STORAGE_KEY, Date.now().toString());

                setDeferredPrompt(null);
                setShouldShow(false);
            });
        }
    };

    // IOS logic: show if isIOS and logic says show
    // Android/Desktop logic: show if deferredPrompt exists and logic says show

    const showPrompt = shouldShow && (deferredPrompt || isIOS);

    if (!showPrompt) {
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
                        onClick={() => {
                            setIsIOS(false);
                            // Also consider this a dismissal
                            handleDismiss();
                        }}
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
                            onClick={handleDismiss}
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
