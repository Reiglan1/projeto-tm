import { BadgeCheck, Heart, MapPin, Star } from "lucide-react";

const PROFISSIONAIS = [
    {
        nome: "Carlos Menezes",
        profissao: "Eletricista",
        preco: "R$ 80/h",
        nota: "4.9",
        avaliacoes: 218,
        local: "São Paulo, SP",
        foto: "https://i.pravatar.cc/400?img=12",
    },
    {
        nome: "Fernanda Souza",
        profissao: "Cabeleireira",
        preco: "R$ 120/h",
        nota: "5",
        avaliacoes: 341,
        local: "Rio de Janeiro, RJ",
        foto: "https://i.pravatar.cc/400?img=47",
    },
    {
        nome: "João Almeida",
        profissao: "Encanador",
        preco: "R$ 90/h",
        nota: "4.8",
        avaliacoes: 156,
        local: "Belo Horizonte, MG",
        foto: "https://i.pravatar.cc/400?img=33",
    },
    {
        nome: "Ana Paula Lima",
        profissao: "Personal Trainer",
        preco: "R$ 100/h",
        nota: "4.9",
        avaliacoes: 89,
        local: "Curitiba, PR",
        foto: "https://i.pravatar.cc/400?img=45",
    },
];

export default function Profissionais() {

    return (

        <>
            <div className="bg-[#FAFAF8] border-b border-preto-2/20">
                <div className="container pt-10 pb-10 sm:pt-20 sm:pb-20">
                    <div>
                        <div className="text-xs font-bold uppercase text-cinza-1 sm:text-sm">
                            Destaque
                        </div>
                        <div className="text-2xl font-bold text-preto-2 sm:text-3xl">
                            Profissionais mais bem avaliados
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-6">
                        {PROFISSIONAIS.map((pro) => (
                            <div
                                key={pro.nome}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white sm:rounded-2xl"
                            >
                                <div className="relative">
                                    <img
                                        src={pro.foto}
                                        alt={pro.nome}
                                        className="h-32 w-full object-cover sm:h-48"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Favoritar"
                                        className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow hover:bg-white sm:top-3 sm:right-3 sm:h-8 sm:w-8"
                                    >
                                        <Heart className="h-3.5 w-3.5 text-preto-2 sm:h-4 sm:w-4" />
                                    </button>
                                </div>

                                <div className="p-2.5 sm:p-4">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="flex min-w-0 items-center gap-1 truncate text-sm font-bold text-preto-2 sm:text-base">
                                            <span className="truncate">{pro.nome}</span>
                                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-amarelo-2 sm:h-4 sm:w-4" />
                                        </span>
                                        <span className="shrink-0 text-sm font-bold text-amarelo-2 sm:text-base">
                                            {pro.preco}
                                        </span>
                                    </div>

                                    <p className="truncate text-xs text-cinza-1 sm:text-sm">{pro.profissao}</p>

                                    <div className="mt-2 flex flex-col gap-1 text-xs text-cinza-1 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                                        <span className="flex items-center gap-1">
                                            <Star
                                                className="h-3.5 w-3.5 shrink-0 text-amarelo-2"
                                                fill="currentColor"
                                            />
                                            <span className="font-bold text-preto-2">{pro.nota}</span>
                                            <span>({pro.avaliacoes})</span>
                                        </span>
                                        <span className="flex min-w-0 items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{pro.local}</span>
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="mt-3 w-full cursor-pointer rounded-xl bg-amarelo-2/15 py-1.5 text-xs font-bold text-amarelo-2 transition hover:bg-amarelo-2/25 sm:mt-4 sm:py-2 sm:text-sm"
                                    >
                                        Ver perfil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>

    )

}