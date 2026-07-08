// Constantes de rotas e nomes de páginas
export const ROUTES = {
    // Páginas logadas
    HOME: "/",

    PROFILE: "/perfil",

    VERIFICATION: "/verificacao",

    OPEN_SERVICE_ORDER: "/abrir-chamado/:workerId",

    WORKER_PROFILE: "/profissionais/:workerId",

    MY_SERVICE_ORDERS: "/meus-chamados",

    PROFESSIONAL_WALLET: "/carteira-profissional",

    CLIENT_WALLET: "/carteira-cliente",

    CATEGORIES: "/servicos",

    PAYMENT: "/pagamento/:serviceOrderId",

    // Páginas que não estão logadas
    LOGIN: "/login",

    RESET_PASSWORD: "/redefinir-senha",



} as const;

// Monta o caminho de "abrir chamado" já com o id do profissional escolhido
export function buildOpenServiceOrderPath(workerId: string): string {
    return `/abrir-chamado/${workerId}`;
}

export function buildWorkerProfilePath(workerId: string): string {
    return `/profissionais/${workerId}`;
}

export function buildPaymentPath(serviceOrderId: string): string {
    return `/pagamento/${serviceOrderId}`;
}

// // Mapeamento de rotas para nomes de páginas (para breadcrumbs)
// export const PAGE_NAMES: { [key: string]: string } = {

//     [ROUTES.FAQ]: "Perguntas frequentes",

// };

// Função utilitária para obter o nome da página baseado na rota
// export const getPageName = (pathname: string): string => {
//     return PAGE_NAMES[pathname] || "Página";
// };
