import FAQSection from "./sections/FaqSection";
import HeroSection from "./sections/HeroSection";
import WorkersList from "./sections/WorkersList";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <WorkersList />
      <FAQSection />
    </div>
  );
}