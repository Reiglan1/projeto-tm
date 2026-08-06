import Banner from "@/pages/auth/Home/Sections/Banner";
import Recursos from "./Sections/Recursos";
import Parceiros from "./Sections/Parceiros";
import ComoFunciona from "./Sections/ComoFunciona";
import Plataforma from "./Sections/Plataforma";
import Categorias from "./Sections/Categorias";
import Profissionais from "./Sections/Profissionais";
import Depoimentos from "./Sections/Depoimentos";
import Confianca from "./Sections/Confianca";
import Faq from "./Sections/Faq";
import ChamadaFinal from "./Sections/ChamadaFinal";

export default function HomeAuth() {

    return (

        <div className="flex flex-col flex-1">
            <Banner />
            <Recursos />
            <Parceiros />
            <ComoFunciona />
            <Plataforma />
            <Categorias />
            <Profissionais />
            <Depoimentos />
            <Confianca />
            <Faq />
            <ChamadaFinal />
        </div>

    )

}