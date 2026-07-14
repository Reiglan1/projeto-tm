import { useSearchParams } from "react-router-dom";
import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FaqSection";
import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorkSection";
import ServicesSection from "./sections/ServicesSection";
import SplitSection from "./sections/SplitSection";
import StatsSection from "./sections/StatsSection";
import TestimonialSection from "./sections/TestimonialSection";
import Modal from "@/components/Modal/Modal";
import { useAuthModal } from "@/context/AuthModalContext";


export default function HomeAuthPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const sessionExpired = searchParams.get("sessionExpired") === "1";
    const { openLogin } = useAuthModal();

    function closeSessionExpiredModal() {
        searchParams.delete("sessionExpired");
        setSearchParams(searchParams, { replace: true });
    }

    return (
        <>
            <Modal
                open={sessionExpired}
                onClose={closeSessionExpiredModal}
                title="Sessão expirada"
            >
                <p className="text-sm text-[#3A3A3A] mb-6">
                    Sua sessão expirou. Faça login novamente pra continuar.
                </p>
                <button
                    onClick={() => {
                        closeSessionExpiredModal();
                        openLogin();
                    }}
                    className="w-full bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
                >
                    Entrar
                </button>
            </Modal>

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