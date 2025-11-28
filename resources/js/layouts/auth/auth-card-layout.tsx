import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        
        <div className="relative">
                <div className="relative z-10 mx-auto flex w-full max-w-md flex-col justify-center gap-6">
                    <div className="flex flex-col gap-6 ">
                        <Card className="rounded-xl border-cfar-500 animate-fade-in-up bg-cfar-500">
                            <Link href={route('home')} className="flex items-center gap-2 self-center font-medium">
                                <div className="z-10 flex size-20 items-center justify-center">
                                    <AppLogoIcon className="size-96 fill-current text-black dark:text-white" />
                                </div>
                            </Link>
                            <CardHeader className="px-10 pb-0 text-center text-white">
                                <CardTitle className="text-xl">{title}</CardTitle>
                                <CardDescription className="text-white">{description}</CardDescription>
                            </CardHeader>
                            <CardContent className="px-10 py-8">{children}</CardContent>
                        </Card>
                    </div>
                </div>
            </div>
       
    );
}
