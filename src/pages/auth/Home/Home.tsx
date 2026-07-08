import { useSearchParams } from "react-router-dom";
import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FaqSection";
import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorkSection";
import ServicesSection from "./sections/ServicesSection";
import SplitSection from "./sections/SplitSection";
import StatsSection from "./sections/StatsSection";
import TestimonialSection from "./sections/TestimonialSection";


export default function HomeAuthPage() {
    const [searchParams] = useSearchParams();
    const sessionExpired = searchParams.get("sessionExpired") === "1";

    return (
        <>
            {sessionExpired && (
                <div className="bg-[#FDF4E8] border-b border-[#E8A33D]/40 px-6 py-3 text-center text-sm text-[#C97F1E]">
                    Sua sessão expirou. Faça login novamente pra continuar.
                </div>
            )}
            <HeroSection />
            <SplitSection />
            <HowItWorksSection />
            <ServicesSection />
            <TestimonialSection />
            <StatsSection />
            <CTASection />
            <FAQSection />
        </>
    )

}