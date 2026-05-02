import type { Category } from "@/types";

const ALL_CATEGORIES: Category[] = [
  "नागरिकता",
  "राहदानी",
  "जग्गा",
  "सवारी",
  "शिक्षा",
  "कर",
  "स्वास्थ्य",
  "वैदेशिक रोजगार",
  "अन्य",
];

interface Props {
  active: Category | "all";
  onChange: (c: Category | "all") => void;
}

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`chip ${active === "all" ? "chip-active" : ""}`}
      >
        सबै
      </button>
      {ALL_CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`chip ${active === c ? "chip-active" : ""}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
