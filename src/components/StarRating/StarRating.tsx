import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;
  const textSize = size === "sm" ? "text-base" : "text-2xl";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          className={`bg-transparent border-none p-0 leading-none ${textSize} ${
            readOnly ? "cursor-default" : "cursor-pointer"
          } ${star <= active ? "text-[#C99A00]" : "text-[#D9D6D0]"}`}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}