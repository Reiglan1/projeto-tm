import { ArrowRight } from "lucide-react";

export default function ChamadaFinal() {

    return (

        <>
            <div className="bg-preto-2 py-20">
                <div className="container flex flex-col items-center text-center">
                    <span className="text-sm font-bold uppercase tracking-wide text-amarelo-2">
                        Junte-se à rede
                    </span>

                    <h2 className="mt-3 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
                        Leve seu trabalho para o próximo nível.
                    </h2>

                    <p className="mt-4 max-w-md text-sm text-white/50">
                        Cadastre-se grátis e comece a receber pedidos na sua área em menos
                        de 24h.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amarelo-2 px-6 py-3 text-sm font-bold text-preto-2 cursor-pointer hover:brightness-95 transition">
                            Criar conta gratuita
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-bold text-white cursor-pointer hover:bg-white/5 transition">
                            Agendar uma demo
                        </button>
                    </div>

                    <p className="mt-6 text-xs text-white/30">
                        Grátis para contratar · Sem cartão de crédito
                    </p>
                </div>
            </div>
        </>

    )

}
