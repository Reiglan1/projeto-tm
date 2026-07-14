import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { getServiceOrderById } from "@/services/serviceOrder";
import {
  getMessages,
  sendTextMessage,
  sendMediaMessage,
  markMessagesDelivered,
  markMessagesRead,
} from "@/services/chat";
import {
  ensureChatConnectionStarted,
  joinConversation,
  sendTyping,
  onReceiveMessage,
  onTypingChanged,
  onMessagesDelivered,
  onMessagesRead,
  parseHubError,
} from "@/services/chatHbu";
import { ResponseChatMessageJason } from "@/types/chat";
import { ResponseServiceOrderJason } from "@/types/serviceOrder";
import { ApiError } from "@/services/apiError";
import { ROUTES } from "@/constants/Constants";

const TYPING_STOP_DELAY = 2000;

function formatTime(value: string): string {
  try {
    return new Date(value).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDay(value: string): string {
  try {
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function mediaKind(message: ResponseChatMessageJason): "image" | "video" | "audio" | "file" | null {
  if (!message.mediaUrl) return null;
  const contentType = message.mediaContentType ?? "";
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  return "file";
}

export default function ChatPage() {
  const { serviceOrderId } = useParams<{ serviceOrderId: string }>();
  const navigate = useNavigate();
  const { user } = useLayout();

  const [order, setOrder] = useState<ResponseServiceOrderJason | null>(null);
  const [messages, setMessages] = useState<ResponseChatMessageJason[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [otherTyping, setOtherTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingActiveRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const counterpartName =
    user?.role === "client" ? order?.workerName : order?.clientName;

  // Carrega o pedido (pra mostrar nome de quem está do outro lado) + histórico
  useEffect(() => {
    if (!serviceOrderId) return;
    let cancelled = false;

    getServiceOrderById(serviceOrderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        // Se falhar, a tela ainda funciona, só sem o nome no cabeçalho.
      });

    setLoading(true);
    setLoadError(null);
    pageRef.current = 1;

    getMessages(serviceOrderId, { page: 1, pageSize: 20 })
      .then((response) => {
        if (cancelled) return;
        const sorted = [...(response.items ?? [])].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted);
        setHasMore(response.totalPages > 1);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível carregar as mensagens"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceOrderId]);

  // Conecta no hub, entra na conversa, e escuta os eventos em tempo real
  useEffect(() => {
    if (!serviceOrderId) return;
    let cancelled = false;

    ensureChatConnectionStarted()
      .then(() => joinConversation(serviceOrderId))
      .then(() => {
        // Ao abrir o chat, já marca tudo como entregue/lido pra esse chamado.
        markMessagesDelivered(serviceOrderId).catch(() => { });
        markMessagesRead(serviceOrderId).catch(() => { });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const hubError = parseHubError(error);
        if (hubError.kind === "unauthorized") {
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
          return;
        }
        setLoadError(hubError.message);
      });

    const unsubReceive = onReceiveMessage((message: any) => {
      if (message.serviceOrderId !== serviceOrderId) return;
      setMessages((current) => {
        if (current.some((m) => m.id === message.id)) return current;
        return [...current, message];
      });
      if (message.senderId !== user?.id) {
        markMessagesRead(serviceOrderId).catch(() => { });
      }
    });

    const unsubTyping = onTypingChanged((payload: any) => {
      if (payload.serviceOrderId !== serviceOrderId) return;
      if (payload.senderRole === (user?.role === "client" ? "Client" : "Worker")) return;
      setOtherTyping(payload.isTyping);
    });

    const unsubDelivered = onMessagesDelivered((payload: any) => {
      if (payload.serviceOrderId !== serviceOrderId) return;
      setMessages((current) =>
        current.map((m) =>
          m.senderId === user?.id && !m.deliveredAt ? { ...m, deliveredAt: payload.at } : m
        )
      );
    });

    const unsubRead = onMessagesRead((payload: any) => {
      if (payload.serviceOrderId !== serviceOrderId) return;
      setMessages((current) =>
        current.map((m) =>
          m.senderId === user?.id && !m.readAt ? { ...m, readAt: payload.at } : m
        )
      );
    });

    return () => {
      cancelled = true;
      unsubReceive();
      unsubTyping();
      unsubDelivered();
      unsubRead();
      if (typingActiveRef.current) {
        sendTyping(serviceOrderId, false);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOrderId, user?.id, user?.role]);

  // Rola pro final quando chegam mensagens novas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleTextChange(value: string) {
    setText(value);
    if (!serviceOrderId) return;

    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      sendTyping(serviceOrderId, true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingActiveRef.current = false;
      sendTyping(serviceOrderId, false);
    }, TYPING_STOP_DELAY);
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!serviceOrderId || !text.trim()) return;

    setSendError(null);
    setSending(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingActiveRef.current = false;
    sendTyping(serviceOrderId, false);

    try {
      const message = await sendTextMessage(serviceOrderId, { content: text.trim() });
      setMessages((current) =>
        current.some((m) => m.id === message.id) ? current : [...current, message]
      );
      setText("");
    } catch (error) {
      const apiError = error as ApiError;
      setSendError(apiError.messages?.join(" ") ?? "Não foi possível enviar a mensagem");
    } finally {
      setSending(false);
    }
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !serviceOrderId) return;

    setSendError(null);
    setUploadingMedia(true);

    try {
      const message = await sendMediaMessage(serviceOrderId, file);
      setMessages((current) =>
        current.some((m) => m.id === message.id) ? current : [...current, message]
      );
    } catch (error) {
      const apiError = error as ApiError;
      setSendError(
        apiError.messages?.join(" ") ?? "Não foi possível enviar o arquivo"
      );
    } finally {
      setUploadingMedia(false);
    }
  }

  async function loadMoreMessages() {
    if (!serviceOrderId || loadingMore) return;
    setLoadingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      const response = await getMessages(serviceOrderId, { page: nextPage, pageSize: 20 });
      const older = [...(response.items ?? [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages((current) => [...older, ...current]);
      pageRef.current = nextPage;
      setHasMore(nextPage < response.totalPages);
    } catch {
      // Falhar em carregar mais antigas não é crítico, só deixa o botão lá.
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-sm text-[#3A3A3A]">Carregando conversa...</p>
      </div>
    );
  }

  if (loadError && messages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-4">
        <p className="text-sm text-red-600">{loadError}</p>
        <button
          onClick={() => navigate(ROUTES.MY_SERVICE_ORDERS)}
          className="text-sm text-[#3A3A3A] font-medium underline self-start"
        >
          Voltar pros meus chamados
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-80px)]">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#F5F2EC]">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#0A0A0A] hover:bg-[#F5F2EC] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[#0A0A0A] truncate">
            {counterpartName ?? "Conversa"}
          </p>
          <p className="text-xs text-[#3A3A3A] truncate">{order?.categoryName}</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2">
        {hasMore && (
          <button
            onClick={loadMoreMessages}
            disabled={loadingMore}
            className="text-xs text-[#3A3A3A] font-medium underline bg-transparent border-none cursor-pointer self-center mb-2 disabled:opacity-60"
          >
            {loadingMore ? "Carregando..." : "Carregar mensagens anteriores"}
          </button>
        )}

        {messages.length === 0 && (
          <p className="text-sm text-[#3A3A3A] text-center mt-10">
            Nenhuma mensagem ainda. Diga oi 👋
          </p>
        )}

        {messages.map((message, index) => {
          const isMine = message.senderId === user?.id;
          const previous = messages[index - 1];
          const showDayDivider = !previous || !isSameDay(previous.createdAt, message.createdAt);
          const kind = mediaKind(message);

          return (
            <div key={message.id}>
              {showDayDivider && (
                <p className="text-center text-xs text-[#3A3A3A] my-3">
                  {formatDay(message.createdAt)}
                </p>
              )}
              <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${isMine
                    ? "bg-[#0A0A0A] text-white rounded-br-sm"
                    : "bg-[#F5F2EC] text-[#0A0A0A] rounded-bl-sm"
                    }`}
                >
                  {kind === "image" && message.mediaUrl && (
                    <img
                      src={message.mediaUrl}
                      alt={message.mediaFileName ?? "Imagem"}
                      className="rounded-md max-w-full max-h-72 mb-1.5 object-cover"
                    />
                  )}
                  {kind === "video" && message.mediaUrl && (
                    <video
                      src={message.mediaUrl}
                      controls
                      className="rounded-md max-w-full max-h-72 mb-1.5"
                    />
                  )}
                  {kind === "audio" && message.mediaUrl && (
                    <audio src={message.mediaUrl} controls className="mb-1.5 max-w-full" />
                  )}
                  {kind === "file" && message.mediaUrl && (
                    
                      <a href={message.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2 text-sm underline mb-1.5 ${isMine ? "text-white" : "text-[#3A3A3A]"
                        }`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      {message.mediaFileName ?? "Arquivo anexado"}
                    </a>
                  )}

                  {message.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMine ? "text-white/60" : "text-[#3A3A3A]"
                      }`}
                  >
                    {formatTime(message.createdAt)}
                    {isMine && (
                      <span>{message.readAt ? "✓✓" : message.deliveredAt ? "✓✓" : "✓"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {otherTyping && (
          <p className="text-xs text-[#3A3A3A] italic">digitando...</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="flex items-end gap-2 pt-3 border-t border-[#F5F2EC]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelected}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingMedia}
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[#3A3A3A] hover:bg-[#F5F2EC] transition-colors duration-150 bg-transparent border border-[#D9D6D0] cursor-pointer disabled:opacity-60"
          title="Anexar foto, vídeo ou arquivo"
        >
          {uploadingMedia ? (
            <span className="text-xs">...</span>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          )}
        </button>

        <textarea
          value={text}
          onChange={(event) => handleTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend(event as unknown as FormEvent);
            }
          }}
          rows={1}
          placeholder="Digite sua mensagem..."
          className="flex-1 border border-[#D9D6D0] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none max-h-32"
        />

        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-10 h-10 shrink-0 rounded-full bg-[#0A0A0A] border-none text-white flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </form>

      {sendError && <p className="text-xs text-red-600 mt-2">{sendError}</p>}
    </div>
  );
}