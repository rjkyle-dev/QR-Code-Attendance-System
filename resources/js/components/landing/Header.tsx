import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Shield, Users } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useEffect, useState } from 'react';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
    fixed?: boolean;
    ref?: React.Ref<HTMLElement>;
}

const Header = ({ className, fixed, children, ...props }: HeaderProps) => {
    const { auth } = usePage<SharedData>().props;
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };

        // Add scroll listener to the body
        document.addEventListener('scroll', onScroll, { passive: true });

        // Clean up the event listener on unmount
        return () => document.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={cn(
                'flex h-16 items-center gap-3 p-4 sm:gap-4',
                fixed && 'header-fixed peer/header fixed top-0 right-0 left-0 z-50',
                offset > 10 && fixed
                    ? 'bg-cfar-400 shadow-sm transition-all duration-300 ease-in-out'
                    : 'shadow-none transition-all duration-300 ease-in-out',
                className,
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo and Company Name */}
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                        <div className="animate-pulse-green flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cfar-400 to-cfar-600 shadow-lg">
                            <span className="text-lg font-bold text-white">
                                <img src="Logo.png" alt="" />
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-cfar-400">
                                Check
                                <span className="text-cfar-50">Wise</span>
                            </h1>
                            <p className="motion-rotate-in-45 text-xs font-semibold text-cfar-50">by CFARBEMCO</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-3">
                    <motion.nav
                        className="flex items-center justify-end gap-4"
                        // className="flex w-auto"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 2.4,
                            scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
                        }}
                    >
                        <Link
                            href={route('employeelogin')}
                            className="m bg-main-600 hover:bg-main flex w-auto rounded-md border border-transparent p-2 px-5 py-1.5 text-lg leading-normal font-semibold text-white transition-all duration-300 ease-in-out hover:border-green-700 dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                        >
                            <div className="flex w-auto">
                                <Users className="animate-shield-glow motion-rotate-in-45 mt-1 mr-2 h-4 w-4 text-cfar-400" />
                                Employee
                            </div>
                        </Link>
                        {auth.user ? (
                            <Link
                                href={route('dashboard.index')}
                                className="hover:text-main inline-block rounded-sm border border-background px-5 py-1.5 text-lg leading-normal text-background hover:border-cfar-400 dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="flex w-auto rounded-sm border border-transparent bg-cfar-50 px-5 py-1.5 text-lg leading-normal text-[#1b1b18] transition-all duration-300 ease-in-out hover:border-cfar-500 hover:bg-white dark:bg-cfar-400 dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    <div className="flex w-auto">
                                        <Shield className="mt-1 mr-2 h-4 w-4" />
                                        Admin
                                    </div>
                                </Link>
                                {/* <Link
                                  href={route('register')}
                                  className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                              >
                                  Register
                              </Link> */}
                            </>
                        )}
                    </motion.nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
