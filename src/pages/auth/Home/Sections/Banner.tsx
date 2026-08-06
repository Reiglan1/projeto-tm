import ManWorker from "@/assets/images/ManWorker.png";

export default function Banner() {

    return (

        <>
            <div className="container">
                <div className="flex justify-center pt-15">
                    <div className="flex items-center font-bold text-amarelo-2 gap-2 text-sm bg-amarelo-2/20 px-5 py-1 rounded-full text-center uppercase border border-amarelo-2/30">
                        Não perca tempo
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 7.00008C1.90539 7.0004 1.81262 6.97387 1.73248 6.92357C1.65234 6.87327 1.58812 6.80126 1.54728 6.71591C1.50644 6.63056 1.49065 6.53538 1.50175 6.44141C1.51286 6.34745 1.55039 6.25856 1.61 6.18508L6.56 1.08508C6.59713 1.04222 6.64773 1.01326 6.70349 1.00295C6.75926 0.992636 6.81687 1.00159 6.86687 1.02833C6.91687 1.05508 6.9563 1.09803 6.97867 1.15014C7.00105 1.20224 7.00504 1.26041 6.99 1.31508L6.03 4.32508C6.0017 4.40084 5.99219 4.48234 6.0023 4.56259C6.01241 4.64283 6.04183 4.71942 6.08805 4.7858C6.13426 4.85217 6.19589 4.90634 6.26764 4.94366C6.33939 4.98098 6.41913 5.00035 6.5 5.00008H10C10.0946 4.99976 10.1874 5.02629 10.2675 5.07659C10.3477 5.1269 10.4119 5.1989 10.4527 5.28425C10.4936 5.3696 10.5094 5.46479 10.4983 5.55875C10.4872 5.65272 10.4496 5.7416 10.39 5.81508L5.44 10.9151C5.40287 10.9579 5.35227 10.9869 5.29651 10.9972C5.24075 11.0075 5.18314 10.9986 5.13314 10.9718C5.08314 10.9451 5.04371 10.9021 5.02134 10.85C4.99896 10.7979 4.99497 10.7398 5.01 10.6851L5.97 7.67508C5.99831 7.59932 6.00782 7.51782 5.99771 7.43758C5.9876 7.35734 5.95817 7.28074 5.91196 7.21437C5.86574 7.148 5.80412 7.09382 5.73237 7.0565C5.66062 7.01918 5.58088 6.99982 5.5 7.00008H2Z" stroke="#F5B800" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
                <div className="flex justify-center pt-5">
                    <div className="text-preto-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center max-w-4xl">
                        Conectando quem <span className="text-amarelo-2">precisa</span>,
                        com quem <span className="text-amarelo-2">faz</span>.
                    </div>
                </div>
                <div className="flex justify-center pt-5">
                    <div className="text-preto-2 text-sm sm:text-base md:text-lg text-center max-w-2xl">
                        Encontre profissionais verificados para qualquer serviço em minutos — de encanamento a aulas particulares.
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-stretch pt-8 sm:pt-10 gap-2.5 sm:gap-5">
                    <div className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-amarelo-2 px-5 py-2.5 sm:py-3 rounded-2xl text-preto-2 font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-amarelo-2/80 transition-all">
                            Criar conta grátis
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.33333 8H12.6667" stroke="#111110" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M8 3.33325L12.6667 7.99992L8 12.6666" stroke="#111110" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                        </button>
                    </div>
                    <div className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-white border border-preto-2/20 px-5 py-2.5 sm:py-3 rounded-2xl text-preto-2 font-bold cursor-pointer hover:bg-preto-2/5 transition-all">
                            Ver como funciona
                        </button>
                    </div>
                </div>
                <div>
                    <div className="relative mx-auto flex w-full max-w-sm justify-center pt-10 md:w-auto md:max-w-none">
                        <img src={ManWorker} className="w-full md:w-auto" />

                        {/* Novo pedido */}
                        <div className="absolute left-32 top-15 hidden items-center gap-3 rounded-2xl border border-preto-2/20 bg-white px-4 py-3 shadow-xl md:flex">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amarelo-2/20 text-amarelo-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M6.667 1L2 9h4l-.667 6L10.667 7h-4l0.667-6Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-preto-2">Novo pedido!</p>
                                <p className="text-xs text-cinza-1">Elétrica · São Paulo</p>
                            </div>
                        </div>

                        {/* Pagamento confirmado */}
                        <div className="absolute right-25 top-22 hidden items-center gap-3 rounded-2xl border border-preto-2/20 bg-white px-4 py-3 shadow-xl md:flex">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 text-green-600">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-preto-2">Pagamento confirmado</p>
                                <p className="text-xs text-cinza-1">R$ 240,00 · via Pix</p>
                            </div>
                        </div>

                        {/* Serviço concluído */}
                        <div className="absolute bottom-8 left-36 hidden items-center gap-2 rounded-2xl border border-preto-2/20 bg-white px-4 py-3 shadow-xl md:flex">
                            <div className="flex items-center gap-0.5 text-amarelo-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .951.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 0 0-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 0 0-.363-1.118L2.06 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .951-.69l1.287-3.958Z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-preto-2">Serviço concluído!</p>
                        </div>

                        {/* Profissional verificado */}
                        <div className="absolute bottom-8 right-24 hidden items-center gap-3 rounded-2xl border border-preto-2/20 bg-white px-4 py-3 shadow-xl md:flex">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amarelo-2/20 text-amarelo-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 7.53-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 1 1 1.06 1.06Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-preto-2">Profissional verificado</p>
                                <p className="text-xs text-cinza-1">Identidade confirmada</p>
                            </div>
                        </div>
                    </div>

                    {/* Cards em grade 2x2, só no mobile/tablet */}
                    <div className="mx-auto mt-5 grid w-full max-w-sm grid-cols-2 gap-3 md:hidden">
                        <div className="flex items-center gap-2 rounded-xl border border-preto-2/20 bg-white px-3 py-2.5 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amarelo-2/20 text-amarelo-2">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M6.667 1L2 9h4l-.667 6L10.667 7h-4l0.667-6Z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-preto-2">Novo pedido!</p>
                                <p className="truncate text-[11px] text-cinza-1">Elétrica · São Paulo</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-preto-2/20 bg-white px-3 py-2.5 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-green-600">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-preto-2">Pagamento</p>
                                <p className="truncate text-[11px] text-cinza-1">R$ 240 · Pix</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 rounded-xl border border-preto-2/20 bg-white px-3 py-2.5 shadow-sm">
                            <div className="flex items-center gap-0.5 text-amarelo-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .951.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 0 0-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 0 0-.363-1.118L2.06 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .951-.69l1.287-3.958Z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="truncate text-xs font-bold text-preto-2">Serviço concluído!</p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-preto-2/20 bg-white px-3 py-2.5 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amarelo-2/20 text-amarelo-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 7.53-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 1 1 1.06 1.06Z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-preto-2">Verificado</p>
                                <p className="truncate text-[11px] text-cinza-1">Identidade ok</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )


}