import useEmblaCarousel from "embla-carousel-react";
import {
    BookOpen,
    Camera,
    // ChevronRight,
    Dumbbell,
    Home,
    PaintRoller,
    Scissors,
    Truck,
    Wrench,
    Zap,
} from "lucide-react";

const CATEGORIAS = [
    { label: "Reparos", icon: Wrench },
    { label: "Limpeza", icon: PaintRoller },
    { label: "Elétrica", icon: Zap },
    { label: "Reforma", icon: Home },
    { label: "Beleza", icon: Scissors },
    { label: "Aulas", icon: BookOpen },
    { label: "Fotografia", icon: Camera },
    { label: "Mudança", icon: Truck },
    { label: "Personal", icon: Dumbbell },
];

export default function Categorias() {
    const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: "trimSnaps" });

    return (

        <>
            <div className="border-b border-preto-2/20">
                <div className="container pt-10 pb-10 sm:pt-20 sm:pb-20">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-xs font-bold uppercase text-cinza-1 sm:text-sm">
                                Explorar
                            </div>
                            <div className="text-2xl font-bold text-preto-2 sm:text-3xl">
                                Categorias populares
                            </div>
                        </div>

                        {/* <a
                            href="#"
                            className="flex items-center gap-1 text-sm font-bold text-amarelo-2 hover:opacity-80 transition"
                        >
                            Ver todas
                            <ChevronRight className="h-4 w-4" />
                        </a> */}
                    </div>

                    <div className="-mx-4 mt-4 overflow-hidden px-4 sm:mx-0 sm:mt-6 sm:px-0" ref={emblaRef}>
                        <div className="flex gap-2 sm:gap-2.5">
                            {CATEGORIAS.map((categoria) => {
                                const Icon = categoria.icon;
                                return (
                                    <div
                                        key={categoria.label}
                                        className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-3 cursor-pointer hover:border-amarelo-2/40 transition select-none sm:w-28 sm:rounded-2xl sm:px-3 sm:py-4"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amarelo-2/15 text-amarelo-2 sm:h-10 sm:w-10">
                                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <span className="text-center text-[11px] font-semibold text-preto-2 sm:text-xs">
                                            {categoria.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>

    )

}
