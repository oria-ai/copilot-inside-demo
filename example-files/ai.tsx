import React, { useState, useEffect, useRef } from "react";

/** ---------------------------------------------------------
 *  Minimal front‑only chat demo (OpenAI Responses API + tools)
 *  ‑ manages the whole conversation in browser localStorage
 *  ‑ streams assistant text, handles automatic tool calls
 *  ‑ system prompt is fetched from /system_prompt.txt in /public
 *  ---------------------------------------------------------*/

// ---------- Types ---------------------------------------------------------

type BaseMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;              // plain text
  name?: string;                 // for tool messages
  tool_call_id?: string;         // echo back id the model supplied
};

/** A richer assistant message may include pending tool_calls. */
export type AssistantMessage = BaseMessage & {
  role: "assistant";
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string; // json‑encoded
    };
  }>;
};

export type Message = BaseMessage | AssistantMessage;

// ---------- Local tools ---------------------------------------------------
/**
 * Map every declared tool name to an async implementation that *returns*
 * a string.  The string is sent back to the model as the tool result.
 * You can enhance/replace these with real business logic.
 */
const TOOLS: Record<string, (args: any) => Promise<string>> = {
  say_hello: async ({ name }: { name: string }) => {
    alert(`👋 Hi, ${name}! (from tool)`);
    return `Greeted ${name} at ${new Date().toISOString()}`;
  },
  change_theme: async ({ color }: { color: string }) => {
    document.body.style.backgroundColor = color;
    return `Theme switched to ${color}`;
  },
};

// helper: turn the TOOLS map into OpenAI "tools" schema
const openAIToolSchema = Object.keys(TOOLS).map((k) => ({
  type: "function",
  function: {
    name: k,
    description: `Local browser tool «${k}»`,
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: true, // let the model pass any JSON it wants
    },
  },
}));

// ---------- Component -----------------------------------------------------

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("conversation");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // persist + autoscroll
  useEffect(() => {
    localStorage.setItem("conversation", JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // load system prompt once
  useEffect(() => {
    (async () => {
      if (messages.length === 0) {
        const prompt = await fetch("/system_prompt.txt").then((r) => r.text());
        setMessages([{ role: "system", content: prompt }]);
      }
    })();
  }, []);

  // ---- core: send to OpenAI --------------------------------------------
  const runOpenAI = async (history: Message[]) => {
    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or whichever model supports Responses API
        stream: true,
        messages: history,
        tools: openAIToolSchema,
      }),
    });

    if (!resp.ok || !resp.body) throw new Error(await resp.text());

    const reader = resp.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const pushAssistantChunk = (chunk: string) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && !("tool_calls" in last)) {
          return [...prev.slice(0, -1), { ...last, content: (last.content || "") + chunk }];
        }
        return [...prev, { role: "assistant", content: chunk }];
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop()!; // keep incomplete chunk

      for (const raw of lines) {
        const line = raw.replace(/^data:\s*/, "").trim();
        if (!line || line === "[DONE]") continue;

        const payload = JSON.parse(line);
        const delta = payload.choices[0].delta as Partial<AssistantMessage>;

        if (delta.tool_calls) {
          // the model decided to call a tool (or multiple)
          for (const call of delta.tool_calls) {
            const fnName = call.function.name;
            const args = JSON.parse(call.function.arguments || "{}");
            const impl = TOOLS[fnName];
            if (!impl) continue;

            // execute locally and send "tool" message back so the model can continue
            const result = await impl(args);
            const toolMsg: Message = {
              role: "tool",
              name: fnName,
              content: result,
              tool_call_id: call.id,
            };
            const newHistory = [...history, toolMsg];
            setMessages((m) => [...m, toolMsg]);
            await runOpenAI(newHistory); // recurse: continue the conversation
          }
        } else if (delta.content) {
          pushAssistantChunk(delta.content);
        }
      }
    }
  };

  // ---- UI events ---------------------------------------------------------

  const sendUser = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    try {
      await runOpenAI(nextHistory);
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <p key={i} className={m.role === "user" ? "text-blue-700" : m.role === "assistant" ? "text-green-700" : "text-purple-700"}>
            <strong>{m.role}:</strong> {m.content}
          </p>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendUser()}
        />
        <button className="border rounded px-4" onClick={sendUser}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
