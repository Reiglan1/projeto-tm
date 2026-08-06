import { CheckCircle2, Clock, Shield } from "lucide-react";

const ITENS = [
    {
        icon: Shield,
        titulo: "Profissionais verificados",
        descricao:
            "Identidade, antecedentes e portfólio conferidos antes de qualquer atendimento.",
    },
    {
        icon: Clock,
        titulo: "Respostas em até 30 min",
        descricao:
            "Nosso algoritmo conecta você ao profissional disponível mais próximo.",
    },
    {
        icon: CheckCircle2,
        titulo: "Satisfação garantida",
        descricao:
            "Pagamento retido até o serviço concluído. Suporte disponível 7 dias por semana.",
    },
];

export default function Confianca() {

    return (

        <>
            <div className="bg-[#F2F1EF] border-t border-preto-2/20 border-b">
                <div className="container grid grid-cols-1 gap-10 py-16 sm:grid-cols-3">
                    {ITENS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.titulo}
                                className="flex flex-col items-center gap-3 text-center"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amarelo-2/15 text-amarelo-2">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-preto-2">{item.titulo}</h3>
                                <p className="text-sm text-cinza-1">{item.descricao}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>

    )

}
