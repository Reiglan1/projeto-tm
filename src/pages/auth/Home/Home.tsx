import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FaqSection";
import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorkSection";
import ServicesSection from "./sections/ServicesSection";
import SplitSection from "./sections/SplitSection";
import StatsSection from "./sections/StatsSection";
import TestimonialSection from "./sections/TestimonialSection";


export default function HomeAuthPage() {

    return (
        <>
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