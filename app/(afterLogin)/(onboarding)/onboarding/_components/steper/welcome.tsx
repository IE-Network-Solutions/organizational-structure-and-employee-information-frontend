import React, { useEffect, useState } from 'react';
import SimpleLogo from '@/components/common/logo/simpleLogo';

interface WelcomeProps {
    onComplete: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for fade-out transition duration (500ms)
            setTimeout(onComplete, 500);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-[480px] w-full mx-4 text-center transform transition-transform duration-500 scale-100">
                <div className="flex justify-center mb-6">
                    <div className="scale-110">
                        <SimpleLogo />
                    </div>
                </div>
                <h1 className="text-[22px] font-bold text-gray-900 mb-3">
                    Welcome! To your new Workspace
                </h1>
                <p className="text-gray-500 text-[15px] leading-relaxed px-4">
                    Let’s Set up your fiscal year before we get started, This will help you get
                    started with your workspace.
                </p>
            </div>
        </div>
    );
};

export default Welcome;
