const FEATURES = [
    {
        title: "Busca inteligente",
        description:
            "Encontre o profissional certo em segundos com filtros de serviço, localização e avaliação.",
        path: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
    },
    {
        title: "Contratação segura",
        description:
            "Proposta digital, aceite de orçamento e histórico de serviços tudo em um só lugar.",
        path: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    },
    {
        title: "Pague com um clique",
        description:
            "Pix, cartão ou boleto. O pagamento só é liberado após você confirmar o serviço feito.",
        path: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z",
    },
];

export default function Recursos() {

    return (

        <>
            <div className="pt-16 sm:pt-24">
                <div className="bg-[#F2F1EF] px-6 py-10 sm:px-10 sm:py-12 border-t border-b border-preto-2/10">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10 container">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amarelo-2/20 text-amarelo-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={feature.path} />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-preto-2">{feature.title}</h3>
                                    <p className="mt-1 text-sm text-cinza-1">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>

    )

}
