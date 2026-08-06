import { useState } from "react";
import { ArrowRight, Check, CreditCard, MessageCircle, Zap } from "lucide-react";

const TABS = [
    {
        key: "busca",
        label: "Busca",
        heading: "Encontre o profissional ideal em segundos",
        checklist: [
            "Filtro por especialidade e distância",
            "Perfis verificados com portfólio",
            "Disponibilidade em tempo real",
        ],
        url: "threeminds.com.br/busca",
        rowIcon: Zap,
        rows: [
            { width: "60%", value: "R$100/h" },
            { width: "40%", value: "R$120/h" },
            { width: "70%", value: "R$140/h" },
        ],
    },
    {
        key: "propostas",
        label: "Propostas",
        heading: "Receba propostas personalizadas em minutos",
        checklist: [
            "Orçamentos digitais e comparáveis",
            "Histórico de serviços do profissional",
            "Aceite com um clique",
        ],
        url: "threeminds.com.br/propostas",
        rowIcon: MessageCircle,
        rows: [
            { width: "55%", value: "Aceitar" },
            { width: "65%", value: "Aceitar" },
            { width: "45%", value: "Aceitar" },
        ],
    },
    {
        key: "pagamento",
        label: "Pagamento",
        heading: "Pague com um clique, com segurança",
        checklist: [
            "Pix, cartão ou boleto",
            "Pagamento retido até você confirmar o serviço",
            "Recibo automático",
        ],
        url: "threeminds.com.br/pagamento",
        rowIcon: CreditCard,
        rows: [
            { width: "60%", value: "Pago" },
            { width: "50%", value: "Pago" },
            { width: "70%", value: "Pendente" },
        ],
    },
];

export default function Plataforma() {
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const tab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
    const RowIcon = tab.rowIcon;

    return (

        <>
            <div className="bg-preto-2 pb-10 sm:pb-20">
                <div className="container">
                    <div className="text-amarelo-2 uppercase font-bold text-center pt-10 text-sm sm:pt-20 sm:text-base">
                        Tudo em um lugar
                    </div>
                    <div className="text-white text-center text-2xl sm:text-3xl md:text-4xl font-bold pt-2">
                        Pare de perder horas procurando
                    </div>
                    <div className="text-white/40 text-center text-sm sm:text-base">
                        A Three Minds centraliza busca, negociação e pagamento numa plataforma só.
                    </div>
                </div>

                <div className="container pt-6 sm:pt-10">
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setActiveTab(t.key)}
                                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-5 sm:py-2 sm:text-sm ${t.key === activeTab
                                    ? "bg-amarelo-2 text-preto-2"
                                    : "bg-white/10 text-white hover:bg-white/15"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5 sm:mt-8 sm:rounded-3xl sm:p-10">
                        <div className="grid gap-6 sm:grid-cols-2 sm:items-center sm:gap-10">
                            <div className="flex flex-col gap-4 sm:gap-5">
                                <h3 className="text-lg sm:text-2xl font-bold text-white">
                                    {tab.heading}
                                </h3>
                                <ul className="space-y-3">
                                    {tab.checklist.map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                                            <Check className="h-4 w-4 shrink-0 text-amarelo-2" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-center sm:justify-start">
                                    <button className="inline-flex items-center gap-2 rounded-2xl bg-amarelo-2 px-5 py-3 text-sm font-bold text-preto-2 cursor-pointer hover:brightness-95 transition">
                                        Criar conta grátis
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amarelo-2" />
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
                                    <span className="ml-2 min-w-0 truncate text-xs text-white/40">{tab.url}</span>
                                </div>
                                <div className="space-y-3 p-4">
                                    {tab.rows.map((row, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amarelo-2/20 text-amarelo-2">
                                                <RowIcon className="h-4 w-4" />
                                            </div>
                                            <div
                                                className="h-2 flex-1 rounded-full bg-white/15"
                                                style={{ maxWidth: row.width }}
                                            />
                                            <span className="ml-auto shrink-0 text-xs font-bold text-amarelo-2">
                                                {row.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )

}
