interface LoginLoadingModalProps {
    isOpen: boolean;
}

export default function LoginLoadingModal({ isOpen }: LoginLoadingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center space-y-6">
                {/* Logo with pulse animation */}
                <div className="animate-pulse">
                    <div className="flex size-32 items-center justify-center rounded-full bg-white/10 p-6 backdrop-blur-sm">
                        <img 
                            src="/AGOC.png" 
                            alt="Logo" 
                            className="h-full w-full object-contain animate-pulse" 
                        />
                    </div>
                </div>
                
                {/* Loading text */}
                <div className="text-center">
                    <p className="text-xl font-semibold text-white animate-pulse">Logging in...</p>
                    <p className="mt-2 text-sm text-white/80">Please wait</p>
                </div>
            </div>
        </div>
    );
}

