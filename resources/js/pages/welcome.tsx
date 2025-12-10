import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Navbar from "@/components/landing-main/Navbar";
import HeroSection from "@/components/landing-main/HeroSection";
import FeaturesSection from "@/components/landing-main/FeaturesSection";
import HowItWorksSection from "@/components/landing-main/HowItWorksSection";
import CTASection from "@/components/landing-main/CTASection";
import Footer from "@/components/landing-main/Footer";
import '../../css/landing-theme.css';


export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        // Add class to body for background styling
        document.body.classList.add('landing-page-active');
        return () => {
            document.body.classList.remove('landing-page-active');
        };
    }, []);

    return (
        <>
            <Head title="Welcome" />
            <div className="landing-page min-h-screen">
                <Navbar />
                <HeroSection />
                <FeaturesSection />
                {/* <HowItWorksSection /> */}
                {/* <CTASection /> */}
                {/* <Footer /> */}
            </div>
        </>
    );
}
