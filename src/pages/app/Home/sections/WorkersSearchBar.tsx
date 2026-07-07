import SearchHero from "./SearchHero";

interface WorkersSearchBarProps {
  onSearch: (value: string) => void;
}

export default function WorkersSearchBar({ onSearch }: WorkersSearchBarProps) {
  return (
    <SearchHero
      eyebrow="Encontre agora"
      title="Qual serviço você precisa hoje?"
      placeholder="Buscar por nome ou profissão (ex: eletricista)"
      onSearch={onSearch}
    />
  );
}