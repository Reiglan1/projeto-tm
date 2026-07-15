import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { getServiceOrderById, getServiceOrders } from "@/services/serviceOrder";
import {
  getMessages,
  sendTextMessage,
  sendMediaMessage,
  markMessagesDelivered,
  markMessagesRead,
  getUnreadCounts,
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
import { buildChatPath, ROUTES } from "@/constants/Constants";
import { SERVICE_ORDER_STATUS } from "@/constants/ServiceOrderStatus";

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

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function conversationStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case SERVICE_ORDER_STATUS.COMPLETED:
      return "Concluído";
    case SERVICE_ORDER_STATUS.IN_PROGRESS:
      return "Em andamento";
    case SERVICE_ORDER_STATUS.ACCEPTED:
      return "Aceito";
    case SERVICE_ORDER_STATUS.CANCELLED:
      return "Cancelado";
    case SERVICE_ORDER_STATUS.DISPUTED:
      return "Em disputa";
    default:
      return "Pendente";
  }
}

export default function ChatPage() {
  const { serviceOrderId } = useParams<{ serviceOrderId?: string }>();
  const navigate = useNavigate();
  const { user } = useLayout();

  const [order, setOrder] = useState<ResponseServiceOrderJason | null>(null);
  const [messages, setMessages] = useState<ResponseChatMessageJason[]>([]);
  const [loading, setLoading] = useState(Boolean(serviceOrderId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [otherTyping, setOtherTyping] = useState(false);

  const [conversations, setConversations] = useState<ResponseServiceOrderJason[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [unreadByOrder, setUnreadByOrder] = useState<Record<string, number>>({});
  const [conversationFilter, setConversationFilter] = useState("");

  // Lista de conversas pra sidebar (todos os chamados do usuário, mais recentes primeiro)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setConversationsLoading(true);

    getServiceOrders({
      page: 1,
      pageSize: 50,
      clientId: user.role === "client" ? user.id : undefined,
      workerId: user.role === "worker" ? user.id : undefined,
    })
      .then((response) => {
        if (cancelled) return;
        const sorted = [...(response.items ?? [])].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setConversations(sorted);
      })
      .catch(() => {
        // Sem lista não bloqueia a conversa atual, só perde a sidebar.
      })
      .finally(() => {
        if (!cancelled) setConversationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Contagem de não lidas por chamado, pra mostrar o badge na sidebar
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    function fetchUnread() {
      getUnreadCounts()
        .then((data) => {
          if (cancelled) return;
          const map: Record<string, number> = {};
          (data.perOrder ?? []).forEach((entry) => {
            map[entry.serviceOrderId] = entry.count;
          });
          setUnreadByOrder(map);
        })
        .catch(() => {
          // Badge é só um detalhe visual.
        });
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, serviceOrderId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingActiveRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConversation = conversations.find((c) => c.id === serviceOrderId);

  const counterpartName =
    (user?.role === "client" ? activeConversation?.workerName : activeConversation?.clientName) ??
    (user?.role === "client" ? order?.workerName : order?.clientName);

  const activeCategoryName = activeConversation?.categoryName ?? order?.categoryName;

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

  
  const filteredConversations = conversations.filter((conversation) => {
    if (!conversationFilter.trim()) return true;
    const name = (user?.role === "client" ? conversation.workerName : conversation.clientName) ?? "";
    const haystack = `${name} ${conversation.categoryName}`.toLowerCase();
    return haystack.includes(conversationFilter.trim().toLowerCase());
  });

  return (
    <div className="w-full">
      <div className="flex h-[calc(100vh-64px)] bg-white border-t border-[#D9D6D0] overflow-hidden">

        {/* Sidebar de conversas — no mobile só aparece quando nenhuma conversa está aberta */}
        <aside className={`${serviceOrderId ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[320px] shrink-0 border-r border-[#D9D6D0]`}>
          <div className="px-5 py-4 border-b border-[#D9D6D0]">
            <p className="text-sm font-bold text-[#0A0A0A] mb-3">Conversas</p>
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={conversationFilter}
                onChange={(event) => setConversationFilter(event.target.value)}
                placeholder="Buscar conversa..."
                className="w-full border border-[#D9D6D0] rounded-full pl-8 pr-3 py-2 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading && (
              <p className="text-xs text-[#8A8A8A] px-5 py-4">Carregando...</p>
            )}
            {!conversationsLoading && filteredConversations.length === 0 && (
              <p className="text-xs text-[#8A8A8A] px-5 py-4">
                {conversations.length === 0 ? "Nenhuma conversa ainda." : "Nada encontrado."}
              </p>
            )}
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === serviceOrderId;
              const name = user?.role === "client" ? conversation.workerName : conversation.clientName;
              const unread = unreadByOrder[conversation.id];
              return (
                <button
                  key={conversation.id}
                  onClick={() => navigate(buildChatPath(conversation.id))}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-b border-[#F5F2EC] cursor-pointer transition-colors duration-150 ${isActive ? "bg-[#F5F2EC]" : "bg-white hover:bg-[#FAF7F1]"
                    }`}
                >
                  <span className="shrink-0 w-11 h-11 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-xs font-bold">
                    {getInitials(name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${unread ? "font-bold text-[#0A0A0A]" : "font-semibold text-[#0A0A0A]"}`}>{name}</span>
                      {Boolean(unread) && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E63946] text-white text-[10px] font-semibold flex items-center justify-center">
                          {unread! > 99 ? "99+" : unread}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-[#5C5C5C] truncate">{conversation.categoryName}</span>
                      <span className="text-[11px] text-[#8A8A8A] shrink-0">
                        {conversationStatusLabel(conversation.status)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Conversa ativa */}
        <div className={`${serviceOrderId ? "flex" : "hidden lg:flex"} flex-1 flex-col min-w-0`}>
          {!serviceOrderId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center bg-[#FAF7F1]/60">
              {/* Ilustração */}
              <div className="relative w-[220px] h-[220px] flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-[#F5F2EC]" />
                <span className="absolute inset-[18px] rounded-full border border-[#E2DCD0]" />
                <span className="absolute inset-[36px] rounded-full border border-[#E2DCD0]" />
                <svg width="86" height="86" viewBox="0 0 24 24" fill="none" className="relative">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                    fill="#0A0A0A"
                  />
                  <circle cx="8.5" cy="11.5" r="1.15" fill="#F5C518" />
                  <circle cx="12" cy="11.5" r="1.15" fill="#F5C518" />
                  <circle cx="15.5" cy="11.5" r="1.15" fill="#F5C518" />
                </svg>
                <span className="absolute -top-1 right-4 w-3 h-3 bg-[#F5C518] rounded-full" />
              </div>

              <div>
                <h2
                  className="text-2xl sm:text-[28px] leading-none uppercase text-[#0A0A0A] mb-3"
                  style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}
                >
                  Suas conversas em um só lugar
                </h2>
                <p className="text-sm text-[#5C5C5C] max-w-[38ch] leading-relaxed mx-auto">
                  Escolha um chamado ao lado para ver o histórico e continuar
                  conversando com o profissional ou cliente em tempo real.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#8A8A8A] border-t border-[#E2DCD0] pt-5 mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Suas mensagens ficam vinculadas a cada chamado e só o cliente e o profissional têm acesso
              </div>
            </div>
          ) : (
          <>
          {/* Cabeçalho */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#D9D6D0]">
            <button
              onClick={() => navigate(ROUTES.MESSAGES)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#0A0A0A] hover:bg-[#F5F2EC] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="hidden lg:flex shrink-0 w-10 h-10 rounded-full bg-[#0A0A0A] text-white items-center justify-center text-xs font-bold">
              {getInitials(counterpartName)}
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#0A0A0A] truncate">
                {counterpartName ?? "Conversa"}
              </p>
              <p className="text-xs text-[#5C5C5C] truncate">{activeCategoryName}</p>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-2 bg-[#FAF7F1]/40">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#8A8A8A]">Carregando mensagens...</p>
              </div>
            ) : loadError && messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-red-600">{loadError}</p>
              </div>
            ) : (
              <>
                {hasMore && (
                  <button
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                    className="text-xs text-[#5C5C5C] font-medium underline bg-transparent border-none cursor-pointer self-center mb-2 disabled:opacity-60"
                  >
                    {loadingMore ? "Carregando..." : "Carregar mensagens anteriores"}
                  </button>
                )}

                {messages.length === 0 && !hasMore && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#5C5C5C]">
                      Nenhuma mensagem ainda. Diga oi 👋
                    </p>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isMine = message.senderId === user?.id;
                  const previous = messages[index - 1];
                  const showDayDivider = !previous || !isSameDay(previous.createdAt, message.createdAt);
                  const kind = mediaKind(message);

                  return (
                    <div key={message.id}>
                      {showDayDivider && (
                        <p className="text-center text-xs text-[#8A8A8A] my-3">
                          {formatDay(message.createdAt)}
                        </p>
                      )}
                      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] sm:max-w-[55%] rounded-xl px-3.5 py-2.5 ${isMine
                            ? "bg-[#0A0A0A] text-white rounded-br-sm"
                            : "bg-white border border-[#D9D6D0] text-[#0A0A0A] rounded-bl-sm"
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
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMine ? "text-white/60" : "text-[#8A8A8A]"
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
                  <p className="text-xs text-[#5C5C5C] italic">digitando...</p>
                )}

                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Composer */}
          <div className="px-4 sm:px-6 py-3 border-t border-[#D9D6D0] bg-white">
            <form onSubmit={handleSend} className="flex items-end gap-2">
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
          </>
          )}
        </div>
      </div>
    </div>
  );
}