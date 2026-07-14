import { ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]/50 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0A0A0A]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#3A3A3A] hover:text-[#0A0A0A] transition-colors duration-150 text-2xl leading-none bg-transparent border-none cursor-pointer"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}