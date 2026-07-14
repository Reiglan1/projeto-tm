import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useLayout } from "@/context/LayoutProvider";
import { getMyVerification, submitVerification } from "@/services/verification";
import { ApiError } from "@/services/apiError";
import { VerificationRecord } from "@/types/verification";

const MAX_FILE_SIZE_MB = 5;

interface FilesState {
  documentFront: File | null;
  documentBack: File | null;
  selfie: File | null;
}

interface FileFieldProps {
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

function FileField({ label, hint, file, onChange }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    onChange(selected);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#D9D6D0] rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="w-16 h-16 rounded-md object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-md bg-[#F5F2EC] flex items-center justify-center shrink-0 text-[#3A3A3A]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#0A0A0A] truncate">
            {file ? file.name : "Toque para selecionar uma foto"}
          </p>
          <p className="text-xs text-[#3A3A3A] mt-0.5">{hint}</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function statusLabel(record: VerificationRecord): { label: string; className: string } {
  const raw = (record.decision ?? record.status ?? "").toString().toUpperCase();

  if (raw === "APPROVED" || raw === "VERIFIED") {
    return { label: "Verificação aprovada", className: "bg-[#26A06D]/10 text-[#1F8A5B]" };
  }
  if (raw === "REJECTED" || raw === "DENIED") {
    return { label: "Verificação recusada", className: "bg-red-50 text-red-600" };
  }
  return { label: "Em análise", className: "bg-[#F5C518]/15 text-[#C99A00]" };
}

export default function VerificationPage() {
  const { user } = useLayout();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [record, setRecord] = useState<VerificationRecord | null>(null);

  const [files, setFiles] = useState<FilesState>({
    documentFront: null,
    documentBack: null,
    selfie: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    getMyVerification(user.role)
      .then((data) => {
        if (!cancelled) setRecord(data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível verificar o status"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function updateFile(field: keyof FilesState, file: File | null) {
    if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFormError(`A imagem "${file.name}" passa de ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setFormError(null);
    setFiles((current) => ({ ...current, [field]: file }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitSuccess(false);

    if (!files.documentFront || !files.documentBack || !files.selfie) {
      setFormError("Envie as 3 fotos para continuar.");
      return;
    }
    if (!user) return;

    setSubmitting(true);

    try {
      await submitVerification(user.role, {
        documentFront: files.documentFront,
        documentBack: files.documentBack,
        selfie: files.selfie,
      });
      setSubmitSuccess(true);
      setFiles({ documentFront: null, documentBack: null, selfie: null });
      // Consulta de novo pra refletir o que a API considerar como estado atual
      const updated = await getMyVerification(user.role).catch(() => null);
      setRecord(updated);
    } catch (error) {
      const apiError = error as ApiError;
      setFormError(
        apiError.messages?.join(" ") ?? "Não foi possível enviar seus documentos"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-[#3A3A3A]">Verificando seu status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
          Verificação de identidade
        </h1>
        <p className="text-sm text-[#3A3A3A] mt-1">
          Envie os documentos abaixo pra confirmar sua identidade na plataforma.
        </p>
      </div>

      {loadError && (
        <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
          <p className="text-sm text-red-600">{loadError}</p>
        </div>
      )}

      {!loadError && record && (
        <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
          <span
            className={`inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 ${statusLabel(record).className}`}
          >
            {statusLabel(record).label}
          </span>
          <p className="text-sm text-[#3A3A3A]">
            Você já enviou seus documentos. Assim que a análise for concluída,
            o status aqui é atualizado.
          </p>
          {typeof record.reason === "string" && record.reason && (
            <p className="text-sm text-[#3A3A3A] mt-2">
              <strong className="text-[#0A0A0A]">Observação:</strong> {record.reason}
            </p>
          )}
        </div>
      )}

      {!loadError && !record && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-5"
        >
          <FileField
            label="Frente do documento"
            hint="RG, CNH ou outro documento com foto"
            file={files.documentFront}
            onChange={(file) => updateFile("documentFront", file)}
          />
          <FileField
            label="Verso do documento"
            hint="O outro lado do mesmo documento"
            file={files.documentBack}
            onChange={(file) => updateFile("documentBack", file)}
          />
          <FileField
            label="Selfie"
            hint="Uma foto sua, com boa iluminação"
            file={files.selfie}
            onChange={(file) => updateFile("selfie", file)}
          />

          {formError && <p className="text-sm text-red-600">{formError}</p>}
          {submitSuccess && (
            <p className="text-sm text-[#1F8A5B]">
              Documentos enviados! Vamos avisar quando a análise terminar.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Enviando..." : "Enviar documentos"}
          </button>
        </form>
      )}
    </div>
  );
}