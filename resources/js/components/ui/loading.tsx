import { cn } from '@/lib/utils';

interface LoadingProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export function Loading({ className, size = 'md', text }: LoadingProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={cn('flex items-center justify-center p-8', className)}>
            <div className="flex flex-col items-center space-y-4">
                <div className={cn('loading-spinner rounded-full border-2 border-primary/20 border-t-primary', sizeClasses[size])} />
                {text && <p className="animate-pulse text-sm text-muted-foreground">{text}</p>}
            </div>
        </div>
    );
}

export function PageLoading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green/80 backdrop-blur-sm">
            <div className="rounded-lg border-green-100 bg-green-50 p-8 shadow-lg fade-in">
                <div className="flex flex-col items-center space-y-4">
                    <div className="loading-spinner h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary" />
                    <div className="text-center">
                        <p className="text-main text-lg font-semibold">AGOC</p>
                        {/* <p className="text-sm text-muted-foreground">Loading...</p> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TableLoading() {
    return (
        <div className="space-y-4">
            <div
                className="shimmer h-10 rounded bg-muted"
                style={{
                    background: 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted)/0.5) 50%, hsl(var(--muted)) 75%)',
                    backgroundSize: '200px 100%',
                }}
            />
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="shimmer h-16 rounded bg-muted"
                    style={{
                        background: 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted)/0.5) 50%, hsl(var(--muted)) 75%)',
                        backgroundSize: '200px 100%',
                    }}
                />
            ))}
        </div>
    );
}

export function ContentLoading({ text }: { text?: string }) {
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="rounded-lg border-green-100 bg-green-50 shadow-lg fade-in flex items-center justify-center" style={{ width: "150px", height: "150px" }}>
                <div className="flex flex-col items-center space-y-4">
                    <div className="loading-spinner h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary" />
                    <div className="text-center">
                        <p className="text-main text-lg font-semibold">AGOC</p>
                        <p className="text-sm text-muted-foreground">{text || 'Loading...'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
