import { Star } from "lucide-react";
import Marquee from "react-fast-marquee";

const DEPOIMENTOS = [
    {
        nome: "Camila Ferreira",
        handle: "@camila.sp",
        texto:
            "Encontrei um eletricista em 15 minutos. O serviço foi ótimo e paguei pelo app sem stress.",
        cor: "bg-amarelo-2",
    },
    {
        nome: "Rafael Andrade",
        handle: "@rafaandrade",
        texto:
            "Precisei de um personal trainer e a plataforma me conectou com profissionais incríveis perto de casa.",
        cor: "bg-azul-1",
    },
    {
        nome: "Luísa Monteiro",
        handle: "@luisamonteiro",
        texto:
            "A segurança do pagamento me deu confiança para contratar. Recomendo para todo mundo!",
        cor: "bg-cinza-1",
    },
    {
        nome: "Diego Tavares",
        handle: "@diegotvrs",
        texto:
            "Já usei três vezes para serviços diferentes. Sempre rápido, sempre verificado. Simplesmente funciona.",
        cor: "bg-rosa-1",
    },
    {
        nome: "Beatriz Nunes",
        handle: "@beanunes",
        texto:
            "Minha experiência com a limpeza foi impecável. A profissional chegou na hora e superou minhas expectativas.",
        cor: "bg-preto-2",
    },
];

export default function Depoimentos() {

    return (

        <>
            <div className="container pt-20">
                <div className="text-amarelo-2 uppercase font-bold text-center">
                    Depoimentos
                </div>
                <div className="text-preto-2 text-center text-2xl sm:text-3xl md:text-4xl font-bold pt-2">
                    Quem usou, aprovou.
                </div>
            </div>
            <div className="mt-8 pb-20">
                <Marquee
                    speed={40}
                    pauseOnHover
                    autoFill
                    gradient
                    gradientColor="#ffffff"
                    gradientWidth={80}
                >
                    {DEPOIMENTOS.map((depoimento) => (
                        <div
                            key={depoimento.handle}
                            className="mx-2 w-72 shrink-0 rounded-2xl border border-gray-200 bg-white p-5 sm:mx-3 sm:w-80"
                        >
                            <div className="flex gap-0.5 text-amarelo-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />
                                ))}
                            </div>

                            <p className="mt-3 text-sm italic text-cinza-1">
                                "{depoimento.texto}"
                            </p>

                            <div className="mt-4 flex items-center gap-3">
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${depoimento.cor}`}
                                >
                                    {depoimento.nome.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-preto-2">
                                        {depoimento.nome}
                                    </p>
                                    <p className="text-xs text-cinza-1">{depoimento.handle}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </>

    )
}