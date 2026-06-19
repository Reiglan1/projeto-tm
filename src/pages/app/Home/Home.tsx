import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FaqSection";
import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import ServicesSection from "./sections/ServicesSection";
import SplitSection from "./sections/SplitSection";
import StatsSection from "./sections/StatsSection";
import TestimonialSection from "./sections/TestimonialSection";


export default function HomePage() {


  return (
    <div>
      <HeroSection />
      <StatsSection />
      <SplitSection />
      <HowItWorksSection />
      <ServicesSection />
      <TestimonialSection />
      <CTASection />
      <FAQSection />
    </div>
  );
}
