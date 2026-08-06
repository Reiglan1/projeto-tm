import { CheckCircle, MessageCircle, Smartphone } from "lucide-react";

export default function ComoFunciona() {


    const PASSOS = [
        {
            numero: "01",
            icon: Smartphone,
            titulo: "Descreva o que precisa",
            descricao:
                "Informe o serviço, endereço e quando quer atendimento. Leva menos de 2 minutos.",
        },
        {
            numero: "02",
            icon: MessageCircle,
            titulo: "Receba propostas",
            descricao:
                "Profissionais verificados da sua região enviam orçamentos personalizados.",
        },
        {
            numero: "03",
            icon: CheckCircle,
            titulo: "Contrate com segurança",
            descricao:
                "Compare perfis, avaliações e preços. Contrate e pague sem sair da plataforma.",
        },
    ];

    return (

        <>
            <div className="container pb-20">
                <div className="flex justify-center">
                    <div>
                        <div className="text-amarelo-2 uppercase font-bold text-center">
                            Simples assim
                        </div>
                        <div className="text-preto-2 text-center text-2xl sm:text-3xl md:text-4xl font-bold pt-2">
                            Como funciona a Three Minds
                        </div>
                        <div className="pt-10 sm:pt-16 md:pt-20">
                            <div className="grid gap-10 sm:grid-cols-3 sm:gap-8 relative">
                                {/* linha conectora */}
                                <div className="hidden sm:block absolute top-7 left-1/6 right-1/6 h-px bg-cinza-1/10" />
                                {PASSOS.map((passo) => {
                                    const Icon = passo.icon;
                                    return (
                                        <div
                                            key={passo.numero}
                                            className="flex flex-col items-center text-center gap-4"
                                        >
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-2xl bg-amarelo-2/20 border-2 border-amarelo-2/40 flex items-center justify-center z-10 relative">
                                                    <Icon className="w-6 h-6 text-amarelo-2" />
                                                </div>
                                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amarelo-2 text-[10px] font-extrabold flex items-center justify-center">
                                                    {passo.numero.slice(1)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">{passo.titulo}</h3>
                                                <p className="text-sm text-cinza-1 leading-relaxed px-10 sm:px-0">
                                                    {passo.descricao}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )

}