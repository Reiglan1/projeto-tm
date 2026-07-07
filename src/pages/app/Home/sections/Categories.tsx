import { useEffect, useState } from "react";
import { getCategories } from "@/services/categories";
import { ResponseCategoryJason } from "@/types/category";
import { ApiError } from "@/services/apiError";
import SearchHero from "./SearchHero";

const PAGE_SIZE = 12;

function CategoryCard({ category }: { category: ResponseCategoryJason }) {
  return (
    <div className="bg-white border border-[#C7D1CB] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="w-10 h-10 rounded-lg bg-[#12233D]/5 text-[#12233D] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </span>
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${
            category.isActive
              ? "bg-[#3F8F5F]/10 text-[#2F6E48]"
              : "bg-[#F1F4F2] text-[#586268]"
          }`}
        >
          {category.isActive ? "Ativa" : "Inativa"}
        </span>
      </div>

      <div>
        <p className="text-[15px] font-semibold text-[#12233D]">
          {category.name}
        </p>
        {category.description && (
          <p className="text-sm text-[#586268] mt-1 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ResponseCategoryJason[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCategories({ page, pageSize: PAGE_SIZE, search })
      .then((response) => {
        if (cancelled) return;
        setCategories(response.items ?? []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const apiError = err as ApiError;
        setError(
          apiError.messages?.[0] ?? "Não foi possível carregar as categorias"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  return (
    <div className="max-w-[1180px] mx-auto px-6 sm:px-10 py-10">
      <SearchHero
        eyebrow="Explore"
        title="Que tipo de serviço você procura?"
        placeholder="Buscar por categoria (ex: hidráulica)"
        onSearch={handleSearch}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#12233D]">
          Categorias de serviço
        </h1>
        {!loading && !error && (
          <p className="text-sm text-[#586268]">{totalCount} encontradas</p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-[#586268]">Carregando categorias...</p>
      )}

      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="text-sm text-[#586268]">
          {search
            ? `Nenhuma categoria encontrada para "${search}".`
            : "Nenhuma categoria cadastrada ainda."}
        </p>
      )}

      {!loading && !error && categories.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="bg-transparent border border-[#C7D1CB] text-[#12233D] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-[#586268]">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="bg-transparent border border-[#C7D1CB] text-[#12233D] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}