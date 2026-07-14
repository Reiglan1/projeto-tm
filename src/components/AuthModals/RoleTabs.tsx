import { UserRole } from "@/types/auth";

interface RoleTabsProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleTabs({ value, onChange }: RoleTabsProps) {
  return (
    <div className="flex bg-[#F5F2EC] rounded-lg p-1 mb-6">
      <button
        type="button"
        onClick={() => onChange("client")}
        className={`flex-1 py-2 rounded-md text-sm font-semibold cursor-pointer border-none transition-colors duration-150 ${
          value === "client"
            ? "bg-white text-[#0A0A0A] shadow-sm"
            : "bg-transparent text-[#3A3A3A]"
        }`}
      >
        Cliente
      </button>
      <button
        type="button"
        onClick={() => onChange("worker")}
        className={`flex-1 py-2 rounded-md text-sm font-semibold cursor-pointer border-none transition-colors duration-150 ${
          value === "worker"
            ? "bg-white text-[#0A0A0A] shadow-sm"
            : "bg-transparent text-[#3A3A3A]"
        }`}
      >
        Profissional
      </button>
    </div>
  );
}
