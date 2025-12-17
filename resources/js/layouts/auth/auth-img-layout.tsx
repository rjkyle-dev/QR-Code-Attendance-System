import AppLogoIcon from '@/components/customize/app-logo-icon';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthImgLayout({
    children,
    title,
    description,
    className,
    ...props
}: PropsWithChildren<{
    title?: string;
    description?: string;
    className?: string;
}>) {
    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="overflow-hidden border-none p-0 shadow-2xl">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="relative hidden bg-muted md:block">
                        <img src="/login-side-image.png" alt="Image" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-6 bg-cfar-500 p-6 md:p-8">
                        <div className="text-center] flex flex-col items-center">
                            <Link href={route('home')} className="flex items-center gap-2 self-center font-medium">
                                <div className="ml-auto flex size-20 items-center justify-center">
                                    <AppLogoIcon className="size-16 fill-current text-black dark:text-white" />
                                </div>
                            </Link>
                            {title && <h1 className="text-2xl font-bold text-background">{title}</h1>}
                            {description && <p className="text-balance text-background">{description}</p>}
                        </div>
                        {children}
                    </div>
                </CardContent>
            </Card>

            <div className="*:[a]:hover:text-main text-center text-xs text-balance text-muted-foreground *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}
