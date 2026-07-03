"use client";

import { useState } from "react";

export default function FaleConosco() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [sent, setSent] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSent(true);
    }

    return (
        <section className="px-6 sm:px-10">

            {/* Header */}
            <div className="text-center mb-14">
                <p className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3E6990] mb-4">
                    <span className="w-[18px] h-px bg-[#3E6990]" />
                    Fale conosco
                </p>
                <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#12233D]">
                    Como podemos te ajudar?
                </h2>
            </div>

            <div className="max-w-[860px] mx-auto grid grid-cols-2 gap-6">

                {/* Formulário */}
                <div className="col-span-2 bg-white border border-[#C7D1CB] rounded-md p-5 sm:p-8">

                    {sent ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
                            <div className="w-14 h-14 rounded-full bg-[#5C8368]/10 border border-[#5C8368]/30 flex items-center justify-center text-2xl">
                                ✅
                            </div>
                            <h3 className="text-xl font-bold tracking-[-1px] text-[#12233D]">
                                Mensagem enviada!
                            </h3>
                            <p className="text-sm text-[#586268] max-w-xs leading-relaxed">
                                Recebemos sua mensagem e retornaremos em breve. Obrigado pelo contato!
                            </p>
                            <button
                                onClick={() => { setSent(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                                className="mt-2 text-sm font-semibold text-[#3E6990] hover:underline bg-transparent border-none cursor-pointer"
                            >
                                Enviar outra mensagem
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.05em] text-[#1B3350]">Nome completo</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Seu nome"
                                        className="bg-[#F4F6F4] border border-[#C7D1CB] rounded-[4px] px-4 py-3 text-sm text-[#12233D] placeholder-[#8a95a0] outline-none focus:border-[#3E6990] focus:bg-white transition-all duration-150"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.05em] text-[#1B3350]">E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="seu@email.com"
                                        className="bg-[#F4F6F4] border border-[#C7D1CB] rounded-[4px] px-4 py-3 text-sm text-[#12233D] placeholder-[#8a95a0] outline-none focus:border-[#3E6990] focus:bg-white transition-all duration-150"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.05em] text-[#1B3350]">Telefone</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                        className="bg-[#F4F6F4] border border-[#C7D1CB] rounded-[4px] px-4 py-3 text-sm text-[#12233D] placeholder-[#8a95a0] outline-none focus:border-[#3E6990] focus:bg-white transition-all duration-150"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.05em] text-[#1B3350]">Assunto</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="bg-[#F4F6F4] border border-[#C7D1CB] rounded-[4px] px-4 py-3 text-sm text-[#12233D] outline-none focus:border-[#3E6990] focus:bg-white transition-all duration-150 cursor-pointer"
                                    >
                                        <option value="" disabled>Selecione</option>
                                        <option value="suporte">Suporte técnico</option>
                                        <option value="pagamento">Pagamento</option>
                                        <option value="profissional">Sou profissional</option>
                                        <option value="denuncia">Denúncia</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.05em] text-[#1B3350]">Mensagem</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Descreva sua dúvida ou problema..."
                                    className="bg-[#F4F6F4] border border-[#C7D1CB] rounded-[4px] px-4 py-3 text-sm text-[#12233D] placeholder-[#8a95a0] outline-none focus:border-[#3E6990] focus:bg-white transition-all duration-150 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full sm:w-fit bg-[#12233D] text-white px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#1B3350] transition-colors duration-150 cursor-pointer border-none mt-2"
                            >
                                Enviar mensagem →
                            </button>

                        </form>
                    )}

                </div>
            </div>

        </section>
    );
}