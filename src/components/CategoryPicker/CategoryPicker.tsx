import { useMemo, useState } from "react";
import { ResponseCategoryJason } from "@/types/category";

interface CategoryPickerProps {
  categories: ResponseCategoryJason[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  hasError?: boolean;
  placeholder?: string;
}

export default function CategoryPicker({
  categories,
  selectedIds,
  onChange,
  loading = false,
  hasError = false,
  placeholder = "Buscar categoria (ex: elétrica)",
}: CategoryPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selectedCategories = categories.filter((category) =>
    selectedIds.includes(category.id)
  );

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter(
      (category) =>
        !selectedIds.includes(category.id) &&
        (term === "" || category.name.toLowerCase().includes(term))
    );
  }, [categories, selectedIds, search]);

  function selectCategory(categoryId: string) {
    onChange([...selectedIds, categoryId]);
    setSearch("");
  }

  function removeCategory(categoryId: string) {
    onChange(selectedIds.filter((id) => id !== categoryId));
  }

  return (
    <div>
      <div className="relative">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3A] pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className={`w-full border rounded-md pl-9 pr-3 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${
            hasError ? "border-red-400" : "border-[#D9D6D0]"
          }`}
        />

        {open && (
          <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-[#D9D6D0] rounded-md shadow-lg">
            {loading && (
              <p className="px-3 py-2 text-sm text-[#3A3A3A]">Carregando...</p>
            )}
            {!loading && filteredOptions.length === 0 && (
              <p className="px-3 py-2 text-sm text-[#3A3A3A]">
                Nenhuma categoria encontrada.
              </p>
            )}
            {!loading &&
              filteredOptions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCategory(category.id)}
                  className="w-full text-left px-3 py-2 text-sm text-[#0A0A0A] bg-transparent border-none cursor-pointer hover:bg-[#F5F2EC]"
                >
                  {category.name}
                </button>
              ))}
          </div>
        )}
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedCategories.map((category) => (
            <span
              key={category.id}
              className="flex items-center gap-1.5 bg-[#0A0A0A]/5 text-[#0A0A0A] text-sm font-medium px-3 py-1.5 rounded-full"
            >
              {category.name}
              <button
                type="button"
                onClick={() => removeCategory(category.id)}
                aria-label={`Remover ${category.name}`}
                className="text-[#3A3A3A] hover:text-[#0A0A0A] bg-transparent border-none cursor-pointer leading-none text-base"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}