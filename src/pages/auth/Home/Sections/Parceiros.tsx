import Marquee from "react-fast-marquee";

const PARTNERS = [
    "Votorantim",
    "Grupo Boticário",
    "Localiza",
    "Magazine Luiza",
    "Movile",
    "Nubank",
    "iFood",
    "Ambev",
    "Bradesco",
    "Totvs",
];

export default function Parceiros() {

    return (

        <>
            <div className="py-12 sm:py-12">
                <p className="text-center text-xs font-bold uppercase tracking-widest text-cinza-1">
                    Profissionais de empresas como
                </p>

                <div className="mt-6">
                    <Marquee
                        speed={40}
                        pauseOnHover
                        autoFill
                        gradient
                        gradientColor="#ffffff"
                        gradientWidth={80}
                    >
                        {PARTNERS.map((name) => (
                            <span
                                key={name}
                                className="mx-5 shrink-0 whitespace-nowrap text-sm font-semibold text-cinza-1/70 sm:mx-8 sm:text-base"
                            >
                                {name}
                            </span>
                        ))}
                    </Marquee>
                </div>
                <div className="border-b border-preto-2/10 pt-10">

                </div>
            </div>
        </>

    )

}
