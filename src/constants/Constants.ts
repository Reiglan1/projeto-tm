// Constantes de rotas e nomes de páginas
export const ROUTES = {
    // Páginas logadas
    HOME: "/",

    PROFILE: "/perfil",

    VERIFICATION: "/verificacao",

    OPEN_SERVICE_ORDER: "/abrir-chamado/:workerId",

    MY_SERVICE_ORDERS: "/meus-chamados",

    WALLET: "/carteira",

    // Páginas que não estão logadas
    LOGIN: "/login",



} as const;

// Monta o caminho de "abrir chamado" já com o id do profissional escolhido
export function buildOpenServiceOrderPath(workerId: string): string {
    return `/abrir-chamado/${workerId}`;
}

// // Mapeamento de rotas para nomes de páginas (para breadcrumbs)
// export const PAGE_NAMES: { [key: string]: string } = {

//     [ROUTES.FAQ]: "Perguntas frequentes",

// };

// Função utilitária para obter o nome da página baseado na rota
// export const getPageName = (pathname: string): string => {
//     return PAGE_NAMES[pathname] || "Página";
// };
