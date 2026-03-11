import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuditVerification } from "@/hooks/useThesisMeshData";

type ChatRole = "system" | "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const initialMessage: ChatMessage = {
  role: "system",
  content: "Enter a dataset citation hash to verify its cryptographic provenance.",
};

export default function AIAudit() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  const auditMutation = useAuditVerification();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((current) => [...current, userMessage]);

    const pendingInput = input.trim();
    setInput("");

    const response = await auditMutation.mutateAsync(pendingInput);
    const assistantMessage: ChatMessage = { role: "assistant", content: response.message };
    setMessages((current) => [...current, assistantMessage]);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">AI Audit</h2>
        <p className="text-sm text-slate-600">Verify citation hash integrity with backend attestation.</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-300 bg-white">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-indigo-600 text-white"
                    : message.role === "assistant"
                      ? "bg-slate-100 text-slate-900"
                      : "bg-indigo-50 text-indigo-700"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-300 p-3">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste citation hash"
            className="flex-1"
          />
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={auditMutation.isPending}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
