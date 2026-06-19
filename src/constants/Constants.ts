// Constantes de rotas e nomes de páginas
export const ROUTES = {
    // Páginas logadas
    HOME: "/",

    // Páginas que não estão logadas
    LOGIN: "/login",

} as const;

// // Mapeamento de rotas para nomes de páginas (para breadcrumbs)
// export const PAGE_NAMES: { [key: string]: string } = {

//     [ROUTES.FAQ]: "Perguntas frequentes",

// };

// Função utilitária para obter o nome da página baseado na rota
// export const getPageName = (pathname: string): string => {
//     return PAGE_NAMES[pathname] || "Página";
// };
