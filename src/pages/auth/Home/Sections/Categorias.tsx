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

    return (

        <>
            <div className="border-b border-preto-2/20">
                <div className="container pt-20 pb-20">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm font-bold uppercase text-cinza-1">
                                Explorar
                            </div>
                            <div className="text-3xl font-bold text-preto-2">
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

                    <div className="mt-6 flex gap-2.5 overflow-x-hidden pb-2">
                        {CATEGORIAS.map((categoria) => {
                            const Icon = categoria.icon;
                            return (
                                <div
                                    key={categoria.label}
                                    className="flex w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-4 cursor-pointer hover:border-amarelo-2/40 transition"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amarelo-2/15 text-amarelo-2">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-center text-xs font-semibold text-preto-2">
                                        {categoria.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>

    )

}
