import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"

  // --- BANCO FUNCIONAL ---
  const fetchUsuarios = async () => {
    const res = await fetch("/api/usuarios"); // Ajuste a rota da sua API
    if (!res.ok) throw new Error("Erro ao buscar usuários");
    return res.json();
  };

  const fetchGrupos = async () => {
    const res = await fetch("/api/grupos"); // Ajuste a rota da sua API
    if (!res.ok) throw new Error("Erro ao buscar grupos");
    return res.json();
  };

  const fetchMensagensPorConversa = async (conversaId) => {
    const res = await fetch(`/api/mensagens?conversa_id=${conversaId}`);
    if (!res.ok) throw new Error("Erro ao buscar mensagens");
    return res.json();
  };

  const enviarMensagemAPI = async (conversaId, usuarioId, conteudo) => {
    const res = await fetch(`/api/mensagens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversa_id: conversaId, usuario_id: usuarioId, conteudo }),
    });
    if (!res.ok) throw new Error("Erro ao enviar mensagem");
    return res.json();
  };
  // --- FIM BANCO FUNCIONAL ---

export function MensagensHeader({ user, logout }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* logo */}
          <Link to="/" className="flex items-center">
            <span>
              <img src="/logo-sem-fundo.png" alt="logo" width="140px" />
            </span>
          </Link>
        </div>

        {/* Avatar + Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar>
              <AvatarImage src={user?.avatar_url ? `http://localhost/empowerup/public${user.avatar_url}` : ""} />
              <AvatarFallback>{user?.nome?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm">{user?.nome}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/perfil')}>
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              logout()
              navigate('/')
            }}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function MensagensPage({ usuarioId, user }) {
  const [tipo, setTipo] = useState("privada")
  const [conversas, setConversas] = useState([])
  const [conversaSelecionada, setConversaSelecionada] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState("")
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef(null)
  const sseRef = useRef(null)
  const TOKEN = "Bearer TOKEN_AQUI"
  const navigate = useNavigate()

  useEffect(() => {
    const fetchConversas = async () => {
      try {
        const [usuarios, grupos] = await Promise.all([fetchUsuarios(), fetchGrupos()]);

        // Mapear usuários privados para o formato esperado
        const conversasPrivadas = usuarios.map(u => ({
          id: u.id,
          nome: u.nome,
          tipo: "privada",
          ultima_mensagem: u.ultima_mensagem || "" 
        }));

        setConversas([...conversasPrivadas, ...grupos]);
      } catch (err) {
        console.error("Erro ao buscar conversas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversas();
  }, []);

  // Carregar primeira conversa automaticamente
  useEffect(() => {
    if (tipo && conversas.length > 0) {
      const primeira = conversas.find((c) => c.tipo === tipo)
      if (primeira) carregarMensagens(primeira.id)
    }
  }, [tipo, conversas])

  const carregarMensagens = async (conversaId) => {
    try {
      setConversaSelecionada(conversaId);
      const msgs = await fetchMensagensPorConversa(conversaId);
      setMensagens(msgs);
      scrollToBottom();
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;

    try {
      const msgEnviada = await enviarMensagemAPI(conversaSelecionada, usuarioId, novaMensagem);
      setMensagens(prev => [...prev, msgEnviada]);
      setNovaMensagem("");
      scrollToBottom();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  //Pesquisa
  const [filtro, setFiltro] = useState("")


  // Conversas filtradas
  const conversasFiltradas = conversas
    .filter((c) => c.tipo === tipo)
    .filter((c) => tipo === "privada" ? c.ultima_mensagem : true)
    .filter((c) => c.nome.toLowerCase().includes(filtro.toLowerCase()))

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <MensagensHeader user={user} logout={() => {}} />

      {/* Conteúdo principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Coluna esquerda - Conversas */}
        <div className="w-1/3 border-r flex flex-col p-4 overflow-y-auto">
          {/* Barra de pesquisa */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar usuário ou grupo..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all duration-200 shadow-sm"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
          </div>

          {/* Botões Privada/Grupo */}
          <div className="flex mb-4 gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                tipo === "privada"
                  ? "bg-coral text-white"
                  : "bg-gray-200 hover:bg-coral/30 hover:text-white"
              } active:scale-95`}
              onClick={() => setTipo("privada")}
            >
              Privada
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                tipo === "grupo"
                  ? "bg-coral text-white"
                  : "bg-gray-200 hover:bg-coral/30 hover:text-white"
              } active:scale-95`}
              onClick={() => setTipo("grupo")}
            >
              Grupos
            </button>
          </div>

          {/* Lista de conversas */}
          {loading ? (
            <p>Carregando conversas...</p>
          ) : conversasFiltradas.length === 0 ? (
            <p className="text-gray-500">Nenhuma conversa encontrada.</p>
          ) : (
            <ul className="space-y-2">
              {conversasFiltradas.map((c) => (
                <li
                  key={c.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    conversaSelecionada === c.id
                      ? "bg-coral text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-coral/30 hover:text-white"
                  }`}
                  onClick={() => carregarMensagens(c.id)}
                >
                  <p className="font-semibold">{c.nome || `Conversa #${c.id}`}</p>
                  {c.ultima_mensagem && <p className="text-sm text-gray-600 truncate">{c.ultima_mensagem}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coluna direita - Chat */}
        <div className="flex-1 flex flex-col p-4 bg-gray-50">
          {conversaSelecionada ? (
            <>
              {/* Header do chat */}
              <div className="flex items-center border-b p-2 mb-2">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                  <span className="font-semibold text-white">
                    {conversas.find(c => c.id === conversaSelecionada)?.nome?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="font-semibold">
                  {conversas.find(c => c.id === conversaSelecionada)?.nome || "Usuário"}
                </span>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto mb-2 p-2 flex flex-col">
                {mensagens.map((m) => (
                  <div
                    key={m.id}
                    className={`mb-2 p-3 max-w-xs break-words ${
                      m.usuario_id === usuarioId
                        ? "bg-coral text-white self-end rounded-2xl ml-auto"
                        : "bg-gray-300 text-gray-800 self-start rounded-2xl"
                    }`}
                  >
                    <p className="text-sm">{m.conteudo}</p>
                    <p className="text-xs text-gray-400 text-right">{m.enviada_em}</p>
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>

              {/* Input de mensagem */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Digite uma mensagem..."
                  className="flex-1 border rounded-full p-2 px-4 outline-none focus:ring-1 focus:ring-coral focus:border-coral transition-all duration-200"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
                />
                <button
                  className="bg-coral p-2 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-coral/70 active:scale-95"
                  onClick={enviarMensagem}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-7-9-7-2 5-7 2 7 2 2 5z" />
                  </svg>
                </button>
              </div>

            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
              Inicie uma conversa
            </div>
          )}
        </div>
      </div>
    </div>
  )
}