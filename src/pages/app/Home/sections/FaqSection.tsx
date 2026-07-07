"use client";

import { useState } from "react";
import FaleConosco from "./FaleConosco";

const faqs = [
    {
        question: "Como funciona o pagamento na plataforma?",
        answer:
            "O pagamento é feito dentro da plataforma de forma segura. O valor fica retido e só é liberado ao profissional após a conclusão do serviço. Nunca pague fora da plataforma.",
    },
    {
        question: "Como os profissionais são verificados?",
        answer:
            "Todos os profissionais passam por um processo de validação de documentos, verificação de antecedentes e comprovação de habilidades antes de serem aprovados na plataforma.",
    },
    {
        question: "Posso cancelar um serviço após contratar?",
        answer:
            "Sim, é possível cancelar. Dependendo do momento do cancelamento, podem ser aplicadas taxas. O reembolso é feito automaticamente quando aplicável, conforme nossa política de cancelamento.",
    },
    {
        question: "Como acompanho o profissional em tempo real?",
        answer:
            "Após a confirmação do serviço, você pode acompanhar a localização do profissional em tempo real pelo app, além de receber notificações de cada etapa do atendimento.",
    },
    {
        question: "A plataforma está em conformidade com a LGPD?",
        answer:
            "Sim. Todos os dados pessoais são tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD). Utilizamos criptografia e armazenamento seguro para proteger suas informações.",
    },
    {
        question: "Como me cadastro como profissional?",
        answer:
            'Clique em "Sou profissional", preencha seus dados, envie a documentação necessária e aguarde a validação. Após aprovado, você já pode receber chamados de clientes na sua região.',
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    function toggle(index: number) {
        setOpenIndex(openIndex === index ? null : index);
    }

    return (
        <section className="bg-white border-t border-[#C7D1CB] px-6 py-14 sm:px-10 sm:py-20 flex flex-col sm:flex-row gap-12 sm:gap-0">
            <div className="w-full">

                {/* Header */}
                <div className="text-center mb-14">
                    <p className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3E6990] mb-4">
                        <span className="w-[18px] h-px bg-[#3E6990]" />
                        FAQ
                    </p>
                    <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#12233D]">
                        Perguntas frequentes.
                    </h2>
                </div>

                {/* Lista */}
                <div className="max-w-[680px] mx-auto">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`border-t border-[#C7D1CB] ${index === faqs.length - 1 ? "border-b" : ""}`}
                            >
                                <button
                                    onClick={() => toggle(index)}
                                    className="w-full bg-transparent border-none py-[22px] flex justify-between items-center cursor-pointer gap-4 text-left"
                                >
                                    <span
                                        className={`text-[15px] font-semibold transition-colors duration-200 ${isOpen ? "text-[#3E6990]" : "text-[#12233D]"
                                            }`}
                                    >
                                        {faq.question}
                                    </span>
                                    <div
                                        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-lg font-mono font-light leading-none transition-all duration-300 ${isOpen
                                            ? "bg-[#3E6990] text-white rotate-45"
                                            : "bg-[#F4F6F4] border border-[#C7D1CB] text-[#3E6990]"
                                            }`}
                                    >
                                        +
                                    </div>
                                </button>

                                {/* Resposta animada */}
                                <div
                                    className={`overflow-hidden transition-all duration-350 ease-in-out ${isOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                    style={{ transition: "max-height 0.35s ease, opacity 0.3s ease" }}
                                >
                                    <p className="text-sm text-[#586268] leading-[1.7] pb-[22px]">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            <div className="w-full">
                <FaleConosco />
            </div>
        </section>
    );
}