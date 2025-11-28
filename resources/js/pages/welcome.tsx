import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import CompanyValues from "@/components/landing/CompanyValues";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/landing/ScrollToTop";


export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
             
        

            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">


                 <div className="min-h-screen relative overflow-hidden">
     
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/bgcfar.jpg')`
        }}
      >
        {/* Overlay for darkening */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-700/10 via-green-400/20 to-green-950/100"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header fixed />
        <Hero />
        <CompanyValues />
        <Features />
        <Footer />
        <ScrollToTop />
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-green-400/10 rounded-full blur-xl animate-float"></div>
      <div className="fixed bottom-20 right-10 w-48 h-48 bg-green-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-green-300/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
    </div>



               
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
