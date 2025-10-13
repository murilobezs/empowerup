import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, MessageCircle, Send, ArrowLeft, MoreHorizontal, Phone, Video, Check, CheckCheck, Clock3, Dot } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { useAuth } from '../contexts/AuthContext'
import { useMessages } from '../contexts/MessagesContext'
import apiService from '../services/api'
import config from '../config/config'
import CommunityLeftSidebar from "../components/layout/CommunityLeftSidebar"

export function MensagensHeader({ user, logout }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo-sem-fundo.png" alt="EmpowerUp" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <MessageCircle className="w-6 h-6 text-coral" />
            Mensagens
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar_url ? config.getPublicUrl(user.avatar_url) : ""} />
              <AvatarFallback className="bg-coral text-white text-sm font-medium">
                {user?.nome?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900 hidden sm:block">{user?.nome}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer">
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="cursor-pointer text-red-600"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function MensagensPage() {
  const { user, logout } = useAuth();
  const { refresh: refreshMessagesSummary } = useMessages();
  const [activeTab, setActiveTab] = useState("all") // "all" ou "groups"
  const [conversas, setConversas] = useState([])
  const [conversaSelecionada, setConversaSelecionada] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  // Dados auxiliares da sidebar direita não são necessários na página de mensagens

  const chatEndRef = useRef(null)
  const navigate = useNavigate()

  const mapConversationFromApi = useCallback((conversation) => {
    if (!conversation) {
      return null
    }

    const participantes = conversation.participantes || []
    const outroUsuario = conversation.outro_usuario || participantes.find((p) => p.id !== user?.id)
    const rawLastMessage = conversation.ultima_mensagem ?? conversation.last_message ?? null
    const ultimaInfo = normalizeUltimaMensagem(rawLastMessage, user?.id)
    const timestamp = ultimaInfo.timestamp || rawLastMessage?.enviada_em || conversation.ultima_mensagem_em || conversation.ultima_mensagem_data || conversation.timestamp || new Date().toISOString()
    const tipoNormalizado = conversation.tipo === 'grupo' ? 'group' : 'private'
    const avatarUrl = conversation.avatar_url || outroUsuario?.avatar_url || conversation.imagem || null

    return {
      id: conversation.id,
      nome: conversation.nome || outroUsuario?.nome || 'Usuário',
      tipo: tipoNormalizado,
      ultima_mensagem: rawLastMessage,
      ultima_mensagem_preview: ultimaInfo.preview,
      timestamp,
      outro_usuario: outroUsuario || null,
      conversa_existente: true,
      avatar_url: avatarUrl,
      unread_count: conversation.unread_count ?? 0,
      participantes,
      isPotential: false
    }
  }, [user?.id])

  const normalizeUltimaMensagem = (raw, currentUserId) => {
    if (!raw) {
      return { preview: '', timestamp: null, isMine: false, raw: null }
    }

    if (typeof raw === 'string') {
      return { preview: raw, timestamp: null, isMine: false, raw }
    }

    if (Array.isArray(raw)) {
      const combinedText = raw
        .map((item) => normalizeUltimaMensagem(item, currentUserId).preview)
        .filter(Boolean)
        .join(', ')
      return { preview: combinedText, timestamp: null, isMine: false, raw }
    }

    if (typeof raw === 'object') {
      const previewRaw = raw.conteudo ?? raw.texto ?? raw.message ?? raw.preview ?? ''
      const previewBase = typeof previewRaw === 'string' ? previewRaw : String(previewRaw ?? '')
      const timestamp = raw.enviada_em ?? raw.created_at ?? raw.timestamp ?? raw.data ?? null
      const authorName = raw.autor?.nome ?? raw.autor_nome ?? ''
      const resolvedUserId = raw.usuario_id ?? raw.autor?.id ?? null
      const isMine = resolvedUserId && currentUserId ? Number(resolvedUserId) === Number(currentUserId) : !!raw.isMine
      const decoratedPreview = isMine
        ? `Você: ${previewBase}`
        : authorName
          ? `${authorName.split(' ')[0]}: ${previewBase}`
          : previewBase

      return {
        preview: decoratedPreview,
        timestamp: timestamp || null,
        isMine,
        raw
      }
    }

    return { preview: String(raw), timestamp: null, isMine: false, raw }
  }

  const handleNewMessage = () => {
    // Se há usuários seguindo, abrir modal para escolher
    if (conversas.some(c => c.isPotential)) {
      setShowNewMessageModal(true);
    } else {
      // Redirecionar para página de explorar para seguir usuários
      navigate('/explore');
    }
  };

  useEffect(() => {
    refreshMessagesSummary();
  }, [refreshMessagesSummary, mapConversationFromApi, user?.id]);

  useEffect(() => {
    const fetchConversas = async () => {
      try {
        // Primeiro, buscar conversas existentes
        console.log('🔍 Buscando conversas existentes...');
    const conversasResponse = await apiService.getConversations();
    const conversasExistentes = conversasResponse.conversas || [];
        console.log('📋 Conversas existentes:', conversasExistentes);

        // Depois, buscar usuários que sigo (para criar novas conversas)
        console.log('🔍 Buscando usuários que sigo...');
        let usuariosSeguindo = [];
        
        try {
          const usuariosResponse = await apiService.request('/usuarios/seguindo');
          console.log('👥 Resposta completa da API /usuarios/seguindo:', usuariosResponse);
          
          // A API retorna diretamente o array de usuários ou um objeto success com os dados
          if (Array.isArray(usuariosResponse)) {
            usuariosSeguindo = usuariosResponse;
          } else if (usuariosResponse && Array.isArray(usuariosResponse.data)) {
            usuariosSeguindo = usuariosResponse.data;
          } else if (usuariosResponse && usuariosResponse.success && Array.isArray(usuariosResponse.data)) {
            usuariosSeguindo = usuariosResponse.data;
          } else {
            // Fallback: pegar todos os usuários se não conseguir pegar os seguindo
            console.log('⚠️ Estrutura inesperada, tentando fallback...');
            usuariosSeguindo = usuariosResponse || [];
          }
        } catch (followingError) {
          console.log('❌ Erro ao buscar usuários seguindo, tentando todos os usuários...', followingError);
          
          // Fallback: buscar todos os usuários
          try {
            const todosUsuariosResponse = await apiService.request('/usuarios');
            console.log('👥 Fallback - Todos os usuários:', todosUsuariosResponse);
            
            if (Array.isArray(todosUsuariosResponse)) {
              usuariosSeguindo = todosUsuariosResponse;
            } else if (todosUsuariosResponse && Array.isArray(todosUsuariosResponse.data)) {
              usuariosSeguindo = todosUsuariosResponse.data;
            } else {
              usuariosSeguindo = todosUsuariosResponse || [];
            }
          } catch (allUsersError) {
            console.error('❌ Erro ao buscar todos os usuários:', allUsersError);
            usuariosSeguindo = [];
          }
        }
        
        console.log('👥 Usuários que sigo (final):', usuariosSeguindo);

        // Filtrar usuários seguindo que não têm conversa ainda
        const usuariosComConversa = conversasExistentes
          .map(c => {
            if (c.outro_usuario?.id) return c.outro_usuario.id;
            const participante = (c.participantes || []).find(p => p.id !== user?.id);
            return participante?.id;
          })
          .filter(Boolean);
        
        // IMPORTANTE: Se não há conversas, TODOS os usuários seguindo devem aparecer
        const usuariosSemConversa = usuariosSeguindo.filter(u => {
          // Verificar se o usuário tem os dados necessários
          if (!u || !u.id) {
            console.log('⚠️ Usuário inválido encontrado:', u);
            return false;
          }
          
          // Se não há conversas ainda, mostrar todos os usuários seguindo
          if (conversasExistentes.length === 0) {
            console.log('✅ Sem conversas existentes - mostrando usuário:', u.nome);
            return true;
          }
          
          // Se há conversas, filtrar apenas os que não têm conversa ainda
          const temConversa = usuariosComConversa.includes(u.id);
          console.log(`${temConversa ? '❌' : '✅'} Usuário ${u.nome} ${temConversa ? 'JÁ tem' : 'NÃO tem'} conversa`);
          return !temConversa;
        });

        console.log('📊 Estatísticas DETALHADAS:', {
          conversasExistentes: conversasExistentes.length,
          usuariosSeguindo: usuariosSeguindo.length,
          usuariosComConversa: usuariosComConversa,
          usuariosSemConversa: usuariosSemConversa.length,
          usuariosSemConversaDetalhes: usuariosSemConversa,
          logica: conversasExistentes.length === 0 ? 'MOSTRANDO TODOS (sem conversas)' : 'FILTRANDO (com conversas)'
        });

        // Mapear conversas existentes
        const conversasFormatadas = conversasExistentes
          .map(mapConversationFromApi)
          .filter(Boolean)

        // Mapear usuários sem conversa como conversas potenciais
        const conversasPotenciais = usuariosSemConversa.map(u => ({
          id: `potential_${u.id}`,
          nome: u.nome,
          tipo: "private",
          ultima_mensagem: "",
          timestamp: new Date().toISOString(),
          outro_usuario: u,
          conversa_existente: false,
          avatar_url: u.avatar_url,
          isPotential: true
        }));

        // Buscar grupos (mantido para futuro)
        const gruposResponse = await apiService.request('/grupos');
        const grupos = (gruposResponse.grupos || [])
          .map((g) => {
            const mapped = mapConversationFromApi({ ...g, tipo: 'grupo' })
            if (!mapped) return null
            return {
              ...mapped,
              grupo: g
            }
          })
          .filter(Boolean)

        // Combinar e ordenar por timestamp
        const todasConversas = [...conversasFormatadas, ...conversasPotenciais, ...grupos]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log('🎯 Resultado final:', {
          conversasExistentes: conversasExistentes.length,
          usuariosSeguindo: usuariosSeguindo.length,
          conversasFormatadas: conversasFormatadas.length,
          conversasPotenciais: conversasPotenciais.length,
          todasConversas: todasConversas.length,
          dados: todasConversas
        });

        setConversas(todasConversas);
        refreshMessagesSummary();
      } catch (err) {
        console.error("❌ Erro geral ao buscar conversas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversas();
  }, [refreshMessagesSummary]);

  const iniciarConversa = async (userId) => {
    try {
      const response = await apiService.startConversation(userId);
      
      if (response.success) {
        const conversaId = response.conversa_id;
        setConversaSelecionada(conversaId);
        setShowMobileChat(true);
        
        // Carregar mensagens da conversa
        const mensagensResponse = await apiService.getConversationMessages(conversaId);
        setMensagens(mensagensResponse.mensagens || []);
        scrollToBottom();

        await refreshMessagesSummary();

        // Atualizar a lista de conversas para remover a conversa potencial e adicionar a real
        const fetchConversas = async () => {
          const conversasResponse = await apiService.getConversations();
          const conversasExistentes = conversasResponse.conversas || [];
          const conversasFormatadas = conversasExistentes
            .map(mapConversationFromApi)
            .filter(Boolean);
          
          setConversas(prev => [
            ...conversasFormatadas,
            ...prev.filter(c => c.tipo === "group" || (c.isPotential && c.outro_usuario?.id !== userId))
          ]);
        };
        fetchConversas();
        refreshMessagesSummary();
      }
    } catch (err) {
      console.error("Erro ao iniciar conversa:", err);
    }
  };

  const carregarMensagens = async (conversaId) => {
    try {
      setConversaSelecionada(conversaId);
      setShowMobileChat(true);
      const response = await apiService.getConversationMessages(conversaId);
      setMensagens(response.mensagens || []);
      setConversas(prev => prev.map(c =>
        c.id === conversaId ? { ...c, unread_count: 0 } : c
      ));
      scrollToBottom();
      await refreshMessagesSummary();
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;

    try {
      const response = await apiService.sendMessage(conversaSelecionada, { 
        conteudo: novaMensagem 
      });
      
      if (response.success) {
        setMensagens(prev => [...prev, response.mensagem]);
        setNovaMensagem("");
        scrollToBottom();
        
        // Atualizar última mensagem na lista de conversas
        setConversas(prev => prev.map(c => 
          c.id === conversaSelecionada ? 
          { 
            ...c, 
            ultima_mensagem: response.mensagem,
            ultima_mensagem_preview: normalizeUltimaMensagem(response.mensagem, user?.id).preview,
            timestamp: response.mensagem?.enviada_em || new Date().toISOString(),
            unread_count: 0
          } : 
          c
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        refreshMessagesSummary();
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'agora' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusDescriptor = (mensagem) => {
    if (!mensagem) return null;
    const usuarioId = Number(mensagem.usuario_id ?? mensagem.autor?.id ?? null);
    const currentUserId = Number(user?.id ?? null);
    const isMine = currentUserId && usuarioId ? usuarioId === currentUserId : false;
    const status = mensagem.status || {};

    return {
      isMine,
      key: status.key || (isMine ? 'sent' : ''),
      label: status.label || '',
      timestamp: status.timestamp || null,
      isUnread: Boolean(mensagem.is_unread)
    };
  };

  const renderStatusIcon = (descriptor, variant = 'bubble') => {
    if (!descriptor) return null;

    const { isMine, key, label, timestamp, isUnread } = descriptor;
    const sizeClasses = variant === 'bubble' ? 'w-4 h-4' : 'w-3 h-3';
    const titleParts = [];
    if (label) titleParts.push(label);
    if (timestamp) titleParts.push(formatMessageTime(timestamp));
    const title = titleParts.length > 0 ? titleParts.join(' • ') : undefined;

    if (isMine) {
      switch (key) {
        case 'read':
          return <CheckCheck className={`${sizeClasses} ${variant === 'bubble' ? 'text-white' : 'text-coral'}`} title={title} />;
        case 'delivered':
          return <CheckCheck className={`${sizeClasses} ${variant === 'bubble' ? 'text-white/90' : 'text-gray-400'}`} title={title} />;
        case 'sent':
          return <Check className={`${sizeClasses} ${variant === 'bubble' ? 'text-white/90' : 'text-gray-400'}`} title={title} />;
        default:
          return <Clock3 className={`${sizeClasses} ${variant === 'bubble' ? 'text-white/70' : 'text-gray-400'}`} title={title || 'Enviando'} />;
      }
    }

    if (isUnread) {
      return <Dot className={`${sizeClasses} text-coral`} title="Nova mensagem" />;
    }

    if (key === 'seen') {
      return <CheckCheck className={`${sizeClasses} text-gray-400`} title={title} />;
    }

    if (key === 'received') {
      return <Check className={`${sizeClasses} text-gray-400`} title={title} />;
    }

    return null;
  };

  // Filtrar conversas baseado na busca e tab ativo
  const conversasFiltradas = conversas
    .filter(c => {
      if (activeTab === "groups") return c.tipo === "group";
      return c.tipo === "private";
    })
    .filter(c => {
      if (!searchQuery) return true;
      return c.nome.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const conversaAtual = conversas.find(c => c.id === conversaSelecionada);

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral/5 to-olive/5 text-gray-800">
      <MensagensHeader user={user} logout={logout} />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <CommunityLeftSidebar active="mensagens" />

          <section className="lg:col-span-9">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="flex flex-col h-[calc(100vh-240px)] md:h-[calc(100vh-200px)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h1 className="text-xl font-semibold text-gray-900">Mensagens</h1>
                  <button
                    onClick={handleNewMessage}
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-coral text-white text-sm font-medium rounded-full hover:bg-coral-dark transition-colors"
                  >
                    Nova mensagem
                  </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Sidebar de conversas */}
                  <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} md:w-80 w-full flex-col border-r border-gray-100 bg-white`}>
                    {/* Header da sidebar */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Buscar conversas..."
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:bg-white focus:ring-2 focus:ring-coral outline-none transition-all"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex bg-gray-100 rounded-full p-1">
                        <button
                          className={`flex-1 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                            activeTab === "all"
                              ? "bg-white text-coral shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                          onClick={() => setActiveTab("all")}
                        >
                          Todas
                        </button>
                        <button
                          className={`flex-1 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                            activeTab === "groups"
                              ? "bg-white text-coral shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                          onClick={() => setActiveTab("groups")}
                        >
                          Grupos
                        </button>
                      </div>
                    </div>

                    {/* Lista de conversas */}
                    <div className="flex-1 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-coral border-t-transparent"></div>
                        </div>
                      ) : conversasFiltradas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">
                            {activeTab === "groups" ? "Nenhuma conversa encontrada" : 
                             conversas.filter(c => c.isPotential).length > 0 ? 
                             "Escolha alguém na lista para conversar" : 
                             "Nenhuma conversa encontrada"}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {activeTab === "groups" ? 
                              "Você ainda não participa de nenhum grupo" : 
                              conversas.filter(c => c.isPotential).length > 0 ?
                              `${conversas.filter(c => c.isPotential).length} ${conversas.filter(c => c.isPotential).length === 1 ? 'pessoa disponível' : 'pessoas disponíveis'} para conversar` :
                              "Comece seguindo alguns usuários"
                            }
                          </p>
                          {conversas.filter(c => c.isPotential).length === 0 && activeTab !== "groups" && (
                            <button 
                              onClick={() => navigate('/explore')}
                              className="mt-4 px-4 py-2 bg-coral text-white rounded-full text-sm hover:bg-coral-dark transition-colors"
                            >
                              Explorar usuários
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {conversasFiltradas.map((conversa) => {
                            const ultimaMensagemInfo = normalizeUltimaMensagem(conversa.ultima_mensagem, user?.id);
                            const ultimaMensagemPreview = ultimaMensagemInfo.preview;
                            const lastMessageDescriptor = getStatusDescriptor(conversa.ultima_mensagem);
                            const listStatusIcon = (conversa.unread_count > 0 && !(lastMessageDescriptor?.isMine))
                              ? null
                              : renderStatusIcon(lastMessageDescriptor, 'list');

                            return (
                              <div
                                key={conversa.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  conversaSelecionada === conversa.id ? 'bg-coral/10 border-r-2 border-coral' : ''
                                }`}
                                onClick={() => {
                                  if (conversa.tipo === 'private') {
                                    if (conversa.conversa_existente) {
                                      carregarMensagens(conversa.id);
                                    } else {
                                      iniciarConversa(conversa.outro_usuario.id);
                                    }
                                  } else {
                                    carregarMensagens(conversa.id);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="w-12 h-12">
                                      <AvatarImage 
                                        src={conversa.avatar_url ? config.getPublicUrl(conversa.avatar_url) : ""} 
                                      />
                                      <AvatarFallback className="bg-gradient-to-br from-coral to-coral-light text-white font-medium">
                                        {conversa.nome.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {conversa.tipo === "group" && (
                                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-semibold text-gray-900 truncate">
                                        {conversa.nome}
                                      </h3>
                                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                        {formatTime(conversa.timestamp)}
                                      </span>
                                    </div>
                                    
                                    <div className="mt-1 flex items-center gap-2">
                                      {listStatusIcon}
                                      <span
                                        className={`text-sm truncate flex-1 ${
                                          conversa.unread_count > 0 && !conversa.isPotential
                                            ? 'font-semibold text-gray-900'
                                            : 'text-gray-600'
                                        }`}
                                      >
                                        {ultimaMensagemPreview ? (
                                          ultimaMensagemPreview
                                        ) : conversa.isPotential ? (
                                          <span className="italic text-coral">Iniciar conversa</span>
                                        ) : (
                                          <span className="italic">Sem mensagens</span>
                                        )}
                                      </span>
                                      {conversa.unread_count > 0 && !conversa.isPotential && (
                                        <span className="ml-auto inline-flex min-w-[20px] justify-center rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
                                          {conversa.unread_count > 99 ? '99+' : conversa.unread_count}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Área do chat */}
                  <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
                    {conversaSelecionada && conversaAtual ? (
                      <>
                        {/* Header do chat */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                          <div className="flex items-center gap-3">
                            <button
                              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                              onClick={() => setShowMobileChat(false)}
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            
                            <Avatar className="w-10 h-10">
                              <AvatarImage 
                                src={conversaAtual.avatar_url ? config.getPublicUrl(conversaAtual.avatar_url) : ""} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-coral to-coral-light text-white font-medium">
                                {conversaAtual.nome.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h2 className="font-semibold text-gray-900">{conversaAtual.nome}</h2>
                              <p className="text-sm text-gray-500">
                                {conversaAtual.tipo === "group" ? "Grupo" : "Online"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <Phone className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <Video className="w-5 h-5 text-gray-600" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                                <DropdownMenuItem>Silenciar</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Bloquear</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Área de mensagens */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                          {mensagens.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-coral" />
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-2">
                                {conversaAtual.isPotential ? "Inicie uma conversa" : "Nenhuma mensagem ainda"}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                {conversaAtual.isPotential 
                                  ? `Envie uma mensagem para ${conversaAtual.nome}`
                                  : "Seja a primeira a enviar uma mensagem!"
                                }
                              </p>
                            </div>
                          ) : (
                            <>
                              {mensagens.map((mensagem, index) => {
                                const isOwn = mensagem.usuario_id === user?.id;
                                const showAvatar = !isOwn && (index === mensagens.length - 1 || mensagens[index + 1]?.usuario_id !== mensagem.usuario_id);
                                const statusDescriptor = getStatusDescriptor(mensagem);
                                const bubbleStatusIcon = renderStatusIcon(statusDescriptor, 'bubble');
                                
                                return (
                                  <div
                                    key={mensagem.id}
                                    className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                                  >
                                    {!isOwn && (
                                      <Avatar className={`w-8 h-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                        <AvatarImage 
                                          src={conversaAtual.avatar_url ? config.getPublicUrl(conversaAtual.avatar_url) : ""} 
                                        />
                                        <AvatarFallback className="bg-gray-300 text-gray-600 text-sm">
                                          {conversaAtual.nome.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    
                                    <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                                      <div
                                        className={`px-4 py-2 rounded-2xl shadow-sm ${
                                          isOwn
                                            ? 'bg-coral text-white rounded-br-md'
                                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                                        }`}
                                      >
                                        <p className="text-sm leading-relaxed break-words">
                                          {mensagem.conteudo}
                                        </p>
                                      </div>
                                      <div
                                        className={`mt-1 flex items-center gap-1 px-1 text-xs ${
                                          isOwn ? 'text-white/80' : 'text-gray-500'
                                        }`}
                                      >
                                        <span>{formatMessageTime(mensagem.enviada_em)}</span>
                                        {bubbleStatusIcon}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              <div ref={chatEndRef} />
                            </>
                          )}
                        </div>

                        {/* Input de mensagem */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <textarea
                                placeholder={`Mensagem para ${conversaAtual.nome}...`}
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 resize-none focus:bg-white focus:ring-2 focus:ring-coral outline-none transition-all max-h-32"
                                value={novaMensagem}
                                onChange={(e) => setNovaMensagem(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    enviarMensagem();
                                  }
                                }}
                                rows={1}
                                style={{
                                  minHeight: '48px',
                                  height: 'auto'
                                }}
                              />
                            </div>
                            <button
                              onClick={enviarMensagem}
                              disabled={!novaMensagem.trim()}
                              className="w-12 h-12 bg-coral hover:bg-coral-dark disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                            >
                              <Send className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-coral/10 rounded-full flex items-center justify-center mb-6">
                          <MessageCircle className="w-12 h-12 text-coral" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Suas Mensagens</h2>
                        <p className="text-gray-500 text-lg mb-6 max-w-sm">
                          Envie uma mensagem para começar uma conversa
                        </p>
                        <button 
                          className="px-6 py-3 bg-coral hover:bg-coral-dark text-white font-medium rounded-full transition-colors"
                          onClick={handleNewMessage}
                        >
                          Nova mensagem
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modal Nova Mensagem */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Nova Mensagem</h3>
                <button 
                  onClick={() => setShowNewMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">Selecione um usuário para iniciar uma conversa</p>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {conversas.filter(c => c.isPotential).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Você ainda não segue ninguém</p>
                  <button 
                    onClick={() => {
                      setShowNewMessageModal(false);
                      navigate('/explore');
                    }}
                    className="mt-4 px-4 py-2 bg-coral text-white rounded-full text-sm hover:bg-coral-dark transition-colors"
                  >
                    Explorar usuários
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversas
                    .filter(c => c.isPotential)
                    .map((conversa) => (
                      <div
                        key={conversa.id}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => {
                          setShowNewMessageModal(false);
                          iniciarConversa(conversa.outro_usuario.id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={conversa.avatar_url ? config.getPublicUrl(conversa.avatar_url) : ""} 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-coral to-coral-light text-white font-medium">
                              {conversa.nome.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">{conversa.nome}</h4>
                            <p className="text-sm text-gray-500">@{conversa.outro_usuario.username}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}