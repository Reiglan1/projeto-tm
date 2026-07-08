import { useLayout } from "@/context/LayoutProvider";
import FAQSection from "./sections/FaqSection";
import HeroSection from "./sections/HeroSection";
import WorkersList from "./sections/WorkersList";
import ClientsList from "./sections/ClientsList";

export default function HomePage() {
  const { user } = useLayout();

  return (
    <div>
      <HeroSection />
      {user?.role === "worker" ? <ClientsList /> : <WorkersList />}
      <FAQSection />
    </div>
  );
}