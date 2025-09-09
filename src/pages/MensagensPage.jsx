import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export default function MensagensPage({ usuarioId }) {
  const [tipo, setTipo] = useState("privada");
  const [conversas, setConversas] = useState([]);
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const sseRef = useRef(null);

  const TOKEN = "Bearer TOKEN_AQUI"; 

  
  useEffect(() => {
    const fetchConversas = async () => {
      try {
        const res = await axios.get("/api/conversas", { headers: { Authorization: TOKEN } });
        setConversas(res.data.data.conversas);
      } catch (err) {
        console.error("Erro ao buscar conversas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversas();
  }, []);

  const carregarMensagens = useCallback(async (conversaId) => {
    setConversaSelecionada(conversaId);

    
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    try {
      const res = await axios.get(`/api/mensagens/${conversaId}`, { headers: { Authorization: TOKEN } });
      setMensagens(res.data.data.mensagens);
      scrollToBottom();

      
      const sse = new EventSource(`/api/chat/sse-mensagens.php?conversa_id=${conversaId}`);
      sse.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        setMensagens((prev) => [...prev, msg]);
        scrollToBottom();
      };
      sse.onerror = (e) => {
        console.error("SSE erro:", e);
        sse.close();
      };
      sseRef.current = sse;

    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  }, []);

  // Effect to load messages when type or conversations change
  useEffect(() => {
    if (tipo && conversas.length > 0) {
      const primeira = conversas.find((c) => c.tipo === tipo);
      if (primeira) carregarMensagens(primeira.id);
    }
  }, [tipo, conversas, carregarMensagens]);

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;

    try {
      await axios.post(`/api/mensagens/${conversaSelecionada}`, { conteudo: novaMensagem }, { headers: { Authorization: TOKEN } });
      setNovaMensagem("");
      scrollToBottom();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex h-screen">
      {/* Lista de conversas */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Conversas</h1>

        <div className="mb-4 flex gap-2">
          <button className={`px-4 py-2 rounded ${tipo === "privada" ? "bg-coral text-white" : "bg-gray-200"}`} onClick={() => setTipo("privada")}>Privada</button>
          <button className={`px-4 py-2 rounded ${tipo === "grupo" ? "bg-coral text-white" : "bg-gray-200"}`} onClick={() => setTipo("grupo")}>Grupo</button>
        </div>

        {loading ? (
          <p>Carregando conversas...</p>
        ) : conversas.filter((c) => c.tipo === tipo).length === 0 ? (
          <p className="text-gray-500">Nenhuma conversa encontrada.</p>
        ) : (
          <ul className="space-y-2">
            {conversas.filter((c) => c.tipo === tipo).map((c) => (
              <li key={c.id} className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${conversaSelecionada === c.id ? "bg-coral text-white" : ""}`} onClick={() => carregarMensagens(c.id)}>
                <p className="font-semibold">{c.nome || `Conversa #${c.id}`}</p>
                {c.ultima_mensagem && <p className="text-sm text-gray-600 truncate">{c.ultima_mensagem}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col p-4">
        {conversaSelecionada ? (
          <>
            <div className="flex-1 overflow-y-auto mb-4 border p-2 rounded">
              {mensagens.map((m) => (
                <div key={m.id} className={`mb-2 p-2 rounded ${m.usuario_id === usuarioId ? "bg-blue-100 self-end" : "bg-gray-100"}`}>
                  <p className="font-semibold">{m.autor}</p>
                  <p>{m.conteudo}</p>
                  <p className="text-xs text-gray-500">{m.enviada_em}</p>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            <div className="flex gap-2">
              <input type="text" className="flex-1 border rounded p-2" placeholder="Digite uma mensagem..." value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviarMensagem()} />
              <button className="bg-coral text-white px-4 py-2 rounded" onClick={enviarMensagem}>Enviar</button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Selecione uma conversa para começar o chat.</p>
        )}
      </div>
    </div>
  );
}