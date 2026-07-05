import { UserRole } from "@/types/auth";

interface RoleTabsProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleTabs({ value, onChange }: RoleTabsProps) {
  return (
    <div className="flex bg-[#F1F4F2] rounded-lg p-1 mb-6">
      <button
        type="button"
        onClick={() => onChange("client")}
        className={`flex-1 py-2 rounded-md text-sm font-semibold cursor-pointer border-none transition-colors duration-150 ${
          value === "client"
            ? "bg-white text-[#12233D] shadow-sm"
            : "bg-transparent text-[#586268]"
        }`}
      >
        Cliente
      </button>
      <button
        type="button"
        onClick={() => onChange("worker")}
        className={`flex-1 py-2 rounded-md text-sm font-semibold cursor-pointer border-none transition-colors duration-150 ${
          value === "worker"
            ? "bg-white text-[#12233D] shadow-sm"
            : "bg-transparent text-[#586268]"
        }`}
      >
        Profissional
      </button>
    </div>
  );
}
