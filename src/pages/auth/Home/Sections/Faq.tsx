import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
    {
        pergunta: "Como os profissionais são verificados?",
        resposta:
            "Cada prestador passa por validação de identidade, checagem de antecedentes e análise de portfólio antes de aparecer na plataforma.",
    },
    {
        pergunta: "Quando meu pagamento é liberado?",
        resposta:
            "O valor fica retido até você confirmar que o serviço foi concluído. Só então o profissional recebe.",
    },
    {
        pergunta: "É possível cancelar uma solicitação?",
        resposta:
            "Sim. Enquanto o serviço não tiver iniciado, você pode cancelar sem custo. Veja a política completa de cancelamento no nosso central de ajuda.",
    },
    {
        pergunta: "A plataforma está disponível em todo o Brasil?",
        resposta:
            "Operamos nas principais capitais e regiões metropolitanas. Estamos expandindo mês a mês — verifique a disponibilidade pelo CEP.",
    },
    {
        pergunta: "Como me cadastro como profissional?",
        resposta:
            "Basta criar uma conta, selecionar suas especialidades, enviar documentação e aguardar a verificação. O processo leva até 48 horas.",
    },
];

export default function Faq() {
    const [open, setOpen] = useState<number | null>(null);

    return (

        <>
            <div className="container pt-10 pb-10 sm:pt-20 sm:pb-20">
                <div className="text-amarelo-2 uppercase font-bold text-center text-sm sm:text-base">
                    Dúvidas frequentes
                </div>
                <div className="text-preto-2 text-center text-2xl sm:text-3xl md:text-4xl font-bold pt-2">
                    Perguntas frequentes
                </div>

                <div className="mx-auto mt-6 max-w-2xl sm:mt-10">
                    {FAQS.map((faq, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={faq.pergunta} className="border-b border-preto-2/10">
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    className="flex w-full cursor-pointer items-center justify-between gap-3 py-4 text-left sm:gap-4 sm:py-5"
                                >
                                    <span className="text-sm font-semibold text-preto-2 sm:text-base">
                                        {faq.pergunta}
                                    </span>
                                    <Plus
                                        className={`h-4 w-4 shrink-0 text-cinza-1 transition-transform ${isOpen ? "rotate-45" : ""
                                            }`}
                                    />
                                </button>
                                {isOpen && (
                                    <p className="pb-4 text-sm text-cinza-1 sm:pb-5">{faq.resposta}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 text-center text-sm text-cinza-1 sm:mt-8">
                    Ainda tem dúvidas?{" "}
                    <a href="#" className="font-bold text-amarelo-2 hover:opacity-80">
                        Fale no WhatsApp
                    </a>
                </div>
            </div>
        </>

    )

}
