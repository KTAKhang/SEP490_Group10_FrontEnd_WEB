import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Bot, Camera, Loader2, X, Sparkles, AlertCircle } from "lucide-react";
import api from "../../api";

const DEBOUNCE_MS = 400;

/** Max 5 MB — must match backend `FRUIT_IMAGE_MAX_BYTES` (multer). */
const MAX_FRUIT_IMAGE_BYTES = 5 * 1024 * 1024;

function formatMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function pickServerMessage(data) {
  if (!data) return null;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  return null;
}

/**
 * No axios response (fetch failed / Network Error) often happens with large files, proxies, or dropped connections.
 */
function resolveFruitAnalyzeError(err, file, maxBytes) {
  const status = err.response?.status;
  const data = err.response?.data;
  const serverMsg = pickServerMessage(data);
  if (serverMsg) return serverMsg;

  if (status === 413) {
    return `Payload too large (HTTP 413). Your proxy may limit body size — try an image ≤ ${formatMb(maxBytes)} MB.`;
  }

  const code = err.code;
  const raw = String(err.message || "");
  const lower = raw.toLowerCase();

  const isTransportFailure =
    code === "ECONNABORTED" ||
    code === "ERR_NETWORK" ||
    code === "ETIMEDOUT" ||
    lower.includes("network error") ||
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("load failed") ||
    lower.includes("networkerror") ||
    lower.includes("timeout");

  if (isTransportFailure || !err.response) {
    const sizeMb = formatMb(file.size);
    const maxMb = formatMb(maxBytes);
    if (file.size > maxBytes) {
      return `Image is too large (${sizeMb} MB). Maximum allowed is ${maxMb} MB. Choose a smaller file or compress it before uploading.`;
    }
    return (
      `Could not upload the image (${sizeMb} MB). ` +
      `Common causes: unstable network, server offline or closing the connection, or file still over the server limit (max ${maxMb} MB). ` +
      `Try a smaller image, ensure the backend is running, or check your proxy (e.g. client_max_body_size).`
    );
  }

  return raw || "Unknown error while analyzing the image.";
}

function MessageBubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isUser
            ? "bg-violet-600 text-white rounded-br-md"
            : "bg-white text-gray-800 border border-violet-100 rounded-bl-md"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

MessageBubble.propTypes = {
  role: PropTypes.oneOf(["user", "assistant"]).isRequired,
  children: PropTypes.node,
};

const TOPIC_CHOICES = [
  { id: "nutrition", label: "Nutritional value" },
  { id: "recipes", label: "Recipes & formulas" },
  { id: "health", label: "Health benefits" },
];

function TopicPromptBlock({ promptId, context, topicDone, topicLoadingKey, onPick }) {
  return (
    <div className="space-y-2">
      <p className="text-gray-800 text-sm font-medium">
        Would you like to know more about this fruit?
      </p>
      <p className="text-xs text-gray-500">
        Pick a topic below and we&apos;ll provide nutrition facts, recipe ideas, or health benefits for this fruit.
      </p>
      <div className="flex flex-col gap-2 mt-2">
        {TOPIC_CHOICES.map((t) => {
          const key = `${promptId}-${t.id}`;
          const done = topicDone[key];
          const loading = topicLoadingKey === key;
          return (
            <button
              key={t.id}
              type="button"
              disabled={done || loading}
              onClick={() => onPick(t.id)}
              className="text-left rounded-lg border border-violet-200 bg-violet-50/90 px-3 py-2 text-sm text-violet-900 hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              ) : null}
              <span>
                {done ? "✓ " : ""}
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

TopicPromptBlock.propTypes = {
  promptId: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  topicDone: PropTypes.objectOf(PropTypes.bool).isRequired,
  topicLoadingKey: PropTypes.string,
  onPick: PropTypes.func.isRequired,
};

function getStoredUserRole() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.role_name ?? null;
  } catch {
    return null;
  }
}

export default function FruitAiChatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorText, setErrorText] = useState("");
  const [topicDone, setTopicDone] = useState({});
  const [topicLoadingKey, setTopicLoadingKey] = useState(null);
  const fileInputRef = useRef(null);
  const debounceTimer = useRef(null);
  const objectPreviewUrlsRef = useRef([]);

  const revokeAllPreviewUrls = useCallback(() => {
    objectPreviewUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        /* ignore */
      }
    });
    objectPreviewUrlsRef.current = [];
  }, []);

  useEffect(() => () => revokeAllPreviewUrls(), [revokeAllPreviewUrls]);

  /** Same as staff chat: not logged in → /login; only customers may use Fruit AI. */
  const ensureCustomerAccess = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setOpen(false);
      navigate("/login");
      return false;
    }
    if (getStoredUserRole() !== "customer") {
      window.alert("Only customer accounts can use Fruit AI.");
      return false;
    }
    return true;
  }, [navigate]);

  const openPanel = useCallback(() => {
    if (!ensureCustomerAccess()) return;
    setOpen(true);
  }, [ensureCustomerAccess]);

  const pushBot = useCallback((content) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }, []);

  const appendTopicPrompt = useCallback((context) => {
    const promptId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        kind: "topic_prompt",
        promptId,
        context,
      },
    ]);
  }, []);

  const handleTopicPick = useCallback(
    async (promptId, topicId, context) => {
      if (!ensureCustomerAccess()) return;
      const key = `${promptId}-${topicId}`;
      setTopicLoadingKey(key);
      try {
        const res = await api.post(
          "/fruit-assistant/topic",
          {
            topic: topicId,
            fruitLabelEn: context.fruitLabelEn,
            inStock: !!context.inStock,
            productName: context.productName || undefined,
          },
          { timeout: 120000 },
        );
        const body = res.data;
        if (body.status === "ERR") {
          pushBot(
            <span className="text-red-600">
              {body.message || "Request failed."}
            </span>,
          );
          return;
        }
        const title =
          topicId === "nutrition"
            ? "Nutritional value"
            : topicId === "recipes"
              ? "Recipes & formulas"
              : "Health benefits";
        setTopicDone((prev) => ({ ...prev, [key]: true }));
        pushBot(
          <div className="space-y-2">
            <p className="text-xs font-semibold text-violet-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {title}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap text-xs leading-relaxed">
              {body.data?.text || ""}
            </p>
          </div>,
        );
      } catch (err) {
        const msg =
          pickServerMessage(err.response?.data) ||
          err.message ||
          "Could not load this topic.";
        pushBot(<span className="text-red-600">{msg}</span>);
      } finally {
        setTopicLoadingKey(null);
      }
    },
    [ensureCustomerAccess, pushBot],
  );

  const runAnalyze = useCallback(
    async (file) => {
      if (!ensureCustomerAccess()) return;

      if (file.size > MAX_FRUIT_IMAGE_BYTES) {
        const mb = (MAX_FRUIT_IMAGE_BYTES / (1024 * 1024)).toFixed(0);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const msg = `Image is too large (${sizeMb} MB). Maximum allowed is ${mb} MB.`;
        setStatus("error");
        setErrorText(msg);
        pushBot(<span className="text-red-600">{msg}</span>);
        return;
      }

      setStatus("loading");
      setErrorText("");
      const previewUrl = URL.createObjectURL(file);
      objectPreviewUrlsRef.current.push(previewUrl);
      setMessages((prev) => [
        ...prev,
        { role: "user", imageUrl: previewUrl, caption: file.name },
      ]);

      const form = new FormData();
      form.append("image", file);

      try {
        const res = await api.post("/fruit-assistant/analyze", form, {
          timeout: 180000,
        });
        const body = res.data;

        if (body.status === "ERR") {
          setStatus("error");
          setErrorText(body.message || "Request failed");
          pushBot(
            <span className="text-red-600">
              {body.message || "Something went wrong."}
            </span>,
          );
          return;
        }

        if (body.phase === "low_confidence") {
          setStatus("success");
          pushBot(
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{body.message}</p>
              <p className="text-xs text-gray-500">
                Try a clearer, well-lit photo of the fruit and upload again.
              </p>
            </div>,
          );
          return;
        }

        if (body.phase === "success") {
          setStatus("success");
          const follow = body.data?.geminiFollowUp;
          const ctx = follow?.context;

          if (body.productAvailable === false) {
            pushBot(
              <div className="space-y-3">
                <p className="font-medium text-amber-800">{body.message}</p>
                <p className="text-xs text-gray-600">
                  We don&apos;t list this fruit right now, but you can still learn more using the
                  options below.
                </p>
              </div>,
            );
            if (ctx?.fruitLabelEn) appendTopicPrompt(ctx);
            return;
          }

          const products = body.data?.products || [];
          pushBot(
            <div className="space-y-3">
              <p className="text-gray-800">
                Good news —{" "}
                <span className="font-semibold text-violet-700">
                  this fruit is available
                </span>{" "}
                in our shop right now.
              </p>
              <p className="text-xs text-gray-600">
                You can tap a link below to open the product page and buy.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Shop</p>
                {products.map((p) => (
                  <Link
                    key={p._id}
                    to={p.productUrl || `/products/${p._id}`}
                    className="block rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2 text-violet-900 hover:bg-violet-100 transition text-sm font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>,
          );
          if (ctx?.fruitLabelEn) appendTopicPrompt(ctx);
        }
      } catch (err) {
        setStatus("error");
        const msg = resolveFruitAnalyzeError(err, file, MAX_FRUIT_IMAGE_BYTES);
        setErrorText(msg);
        pushBot(<span className="text-red-600">{msg}</span>);
      }
    },
    [pushBot, ensureCustomerAccess, appendTopicPrompt],
  );

  const onFileSelected = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        runAnalyze(file);
      }, DEBOUNCE_MS);
    },
    [runAnalyze],
  );

  const requestUpload = useCallback(() => {
    if (!ensureCustomerAccess()) return;
    fileInputRef.current?.click();
  }, [ensureCustomerAccess]);

  const clearChat = () => {
    revokeAllPreviewUrls();
    setMessages([]);
    setStatus("idle");
    setErrorText("");
    setTopicDone({});
    setTopicLoadingKey(null);
  };

  return (
    <div
      className="fixed bottom-6 z-[48]"
      style={{ right: "7.5rem" }}
    >
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 hover:scale-105 transition text-white"
          aria-label="Open fruit AI assistant"
        >
          <Bot className="w-7 h-7 md:w-8 md:h-8" />
        </button>
      )}

      {open && (
        <div
          className="w-[min(100vw-2rem,22rem)] md:w-96 bg-white rounded-2xl shadow-2xl border border-violet-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "min(560px, 70vh)" }}
        >
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm leading-tight">Fruit AI</h3>
                <p className="text-[11px] text-white/85">Scan &amp; nutrition tips</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-white/15 p-1 rounded"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 min-h-0">
            {messages.length === 0 && (
              <MessageBubble role="assistant">
                <p className="text-gray-700">
                  Upload a fruit photo. We&apos;ll recognize it, see if we stock it, then you can ask us to
                  provide nutrition facts, recipes, or health benefits.
                </p>
              </MessageBubble>
            )}
            {messages.map((m, i) => {
              const key = m.promptId || `msg-${i}`;
              if (m.role === "user" && m.imageUrl) {
                return (
                  <MessageBubble key={key} role="user">
                    <img
                      src={m.imageUrl}
                      alt={m.caption ? `Uploaded: ${m.caption}` : "Your upload"}
                      className="rounded-lg max-h-44 w-auto max-w-full object-cover border border-white/30"
                    />
                    {m.caption ? (
                      <p className="text-[11px] mt-1.5 opacity-90 truncate max-w-[220px]">
                        {m.caption}
                      </p>
                    ) : null}
                  </MessageBubble>
                );
              }
              if (m.kind === "topic_prompt" && m.context) {
                return (
                  <MessageBubble key={key} role="assistant">
                    <TopicPromptBlock
                      promptId={m.promptId}
                      context={m.context}
                      topicDone={topicDone}
                      topicLoadingKey={topicLoadingKey}
                      onPick={(topicId) =>
                        handleTopicPick(m.promptId, topicId, m.context)
                      }
                    />
                  </MessageBubble>
                );
              }
              return (
                <MessageBubble key={key} role={m.role}>
                  {m.content}
                </MessageBubble>
              );
            })}
            {status === "loading" && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white border border-violet-100 px-3 py-2 text-xs text-violet-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading &amp; analyzing…
                </div>
              </div>
            )}
            {status === "error" && errorText && messages.length === 0 && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {errorText}
              </div>
            )}
          </div>

          <div className="border-t border-violet-100 p-3 bg-white flex flex-col gap-2 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelected}
                disabled={status === "loading"}
              />
              <button
                type="button"
                disabled={status === "loading"}
                onClick={requestUpload}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition"
              >
                <Camera className="w-4 h-4" />
                Upload fruit photo
              </button>
              <button
                type="button"
                onClick={clearChat}
                className="px-3 rounded-xl border border-gray-200 text-gray-600 text-xs hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Max 5 MB · Customer login required
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
