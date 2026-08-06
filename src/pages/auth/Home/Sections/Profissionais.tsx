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
                <div className="container pt-20 pb-20">
                    <div>
                        <div className="text-sm font-bold uppercase text-cinza-1">
                            Destaque
                        </div>
                        <div className="text-3xl font-bold text-preto-2">
                            Profissionais mais bem avaliados
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {PROFISSIONAIS.map((pro) => (
                            <div
                                key={pro.nome}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                            >
                                <div className="relative">
                                    <img
                                        src={pro.foto}
                                        alt={pro.nome}
                                        className="h-48 w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Favoritar"
                                        className="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
                                    >
                                        <Heart className="h-4 w-4 text-preto-2" />
                                    </button>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1 font-bold text-preto-2">
                                            {pro.nome}
                                            <BadgeCheck className="h-4 w-4 text-amarelo-2" />
                                        </span>
                                        <span className="shrink-0 font-bold text-amarelo-2">
                                            {pro.preco}
                                        </span>
                                    </div>

                                    <p className="text-sm text-cinza-1">{pro.profissao}</p>

                                    <div className="mt-2 flex items-center justify-between text-sm text-cinza-1">
                                        <span className="flex items-center gap-1">
                                            <Star
                                                className="h-3.5 w-3.5 text-amarelo-2"
                                                fill="currentColor"
                                            />
                                            <span className="font-bold text-preto-2">{pro.nota}</span>
                                            <span>({pro.avaliacoes})</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {pro.local}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="mt-4 w-full cursor-pointer rounded-xl bg-amarelo-2/15 py-2 text-sm font-bold text-amarelo-2 transition hover:bg-amarelo-2/25"
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