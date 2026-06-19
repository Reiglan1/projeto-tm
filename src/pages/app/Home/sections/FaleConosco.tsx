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
        <section className="px-10">

            {/* Header */}
            <div className="text-center mb-14">
                <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#8aa0bc] mb-4">
                    Fale conosco
                </p>
                <h2 className="text-[44px] font-black leading-none tracking-[-2px] text-[#0a0a0a]">
                    Como podemos te ajudar?
                </h2>
            </div>

            <div className="max-w-[860px] mx-auto grid grid-cols-2 gap-6">

                {/* Formulário */}
                <div className="col-span-2 bg-white border border-[#d0dce8] rounded-2xl p-8">

                    {sent ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
                            <div className="w-14 h-14 rounded-full bg-[#eef4ff] border border-[#d0dce8] flex items-center justify-center text-2xl">
                                ✅
                            </div>
                            <h3 className="text-xl font-black tracking-[-1px] text-[#0a0a0a]">
                                Mensagem enviada!
                            </h3>
                            <p className="text-sm text-[#5a6a7a] max-w-xs leading-relaxed">
                                Recebemos sua mensagem e retornaremos em breve. Obrigado pelo contato!
                            </p>
                            <button
                                onClick={() => { setSent(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                                className="mt-2 text-sm font-semibold text-[#1a6dff] hover:underline bg-transparent border-none cursor-pointer"
                            >
                                Enviar outra mensagem
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#334a60]">Nome completo</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Seu nome"
                                        className="bg-[#f4f8fd] border border-[#d0dce8] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#a0b4c8] outline-none focus:border-[#1a6dff] focus:bg-white transition-all duration-150"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#334a60]">E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="seu@email.com"
                                        className="bg-[#f4f8fd] border border-[#d0dce8] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#a0b4c8] outline-none focus:border-[#1a6dff] focus:bg-white transition-all duration-150"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#334a60]">Telefone</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                        className="bg-[#f4f8fd] border border-[#d0dce8] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#a0b4c8] outline-none focus:border-[#1a6dff] focus:bg-white transition-all duration-150"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#334a60]">Assunto</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="bg-[#f4f8fd] border border-[#d0dce8] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] outline-none focus:border-[#1a6dff] focus:bg-white transition-all duration-150 cursor-pointer"
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
                                <label className="text-xs font-semibold text-[#334a60]">Mensagem</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Descreva sua dúvida ou problema..."
                                    className="bg-[#f4f8fd] border border-[#d0dce8] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#a0b4c8] outline-none focus:border-[#1a6dff] focus:bg-white transition-all duration-150 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-[#1a6dff] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#0052d4] transition-colors duration-150 cursor-pointer border-none w-fit mt-2"
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