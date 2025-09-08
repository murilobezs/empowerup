import React, { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  MessageCircle, 
  Users, 
  Calendar,
  MapPin,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp,
  Hash,
  Home,
  Bell,
  Bookmark,
  Mail,
  User,
  CheckCircle, 
  X,
  Heart
} from 'lucide-react'
import { CreateGroupModal } from '../components/create-group-modal'
import { useAuth } from '../contexts/AuthContext'
import { Dialog, DialogContent } from '../components/ui/dialog'
import UsernameSetup from '../components/UsernameSetup'
import { useToast } from '../components/ui/toast'
import SocialPost from '../components/SocialPost'
import EmpowerUpCreatePost from '../components/EmpowerUpCreatePost'
import SearchComponent from '../components/SearchComponent'
import config from '../config/config'
import { SiteHeader } from '../components/site-header'

export default function ComunidadePage() {
  const [posts, setPosts] = useState([])
  const [groups, setGroups] = useState([])
  const [events, setEvents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [trending, setTrending] = useState([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(true)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' }) // Novo estado para o modal
  
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const successTimeoutRef = useRef(null)

  // Handle banner animations and persistence
  useEffect(() => {
    // small delay to trigger entrance animation
    if (showBanner) {
      const t = setTimeout(() => setBannerVisible(true), 50)
      return () => clearTimeout(t)
    }
  }, [showBanner])

  const closeBanner = () => {
    // play exit animation then hide
    setBannerVisible(false)
    setTimeout(() => setShowBanner(false), 220)
    // persist preference (optional): localStorage.setItem('empowerup_banner_hidden', '1')
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // fetch all posts via API endpoint
        // Always fetch posts from all users
        const url = `${config.API_BASE_URL}/posts`
        const response = await fetch(url)
        if (response.ok) {
          const result = await response.json()
          // Carregar posts do campo 'posts' da resposta da API
          if (result.success && Array.isArray(result.posts)) {
            setPosts(result.posts)
          } else {
            setPosts([])
          }
        }
      } catch (error) {
        console.error("Erro ao carregar posts:", error)
      }
    }

    const fetchGroups = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/groups/grupos.php`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setGroups(data.groups || [])
          }
        }
      } catch (error) {
        console.error("Erro ao carregar grupos:", error)
      }
    }

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/events/list.php`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setEvents(data.events || [])
          }
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error)
      }
    }

    const fetchTrending = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/trending/`)
        if (response.ok) {
          const data = await response.json()
          setTrending(data.trending || [])
        }
      } catch (error) {
        console.error("Erro ao carregar trending:", error)
      }
    }

    const fetchNotifications = async () => {
      if (!user?.token) return
      
      try {
        const response = await fetch(`${config.API_BASE_URL}/notifications/list.php`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setNotifications(data.notifications || [])
          }
        }
      } catch (error) {
        console.error("Erro ao carregar notificações:", error)
      }
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchPosts(),
        fetchGroups(),
        fetchEvents(),
        fetchTrending(),
        user ? fetchNotifications() : Promise.resolve()
      ])
      setLoading(false)
    }
    
    loadData()
  }, [user])
  // open username setup modal for new users
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  useEffect(() => {
    if (user && !user.username) {
      setShowUsernameModal(true)
    }
  }, [user])

  const handleNewPost = async (postData, mediaFile) => {
    try {
      if (!user?.id) {
        addToast('Você precisa estar logado para postar', 'error')
        return { success: false, message: 'Usuário não logado' }
      }

      // Preparar FormData para envio
      const formData = new FormData()
      formData.append('conteudo', postData.conteudo)
      formData.append('categoria', postData.categoria)
      formData.append('tags', JSON.stringify(postData.tags))
      
      // Adicionar arquivo de mídia se existir
      if (mediaFile) {
        if (mediaFile.type.startsWith('image/')) {
          formData.append('image', mediaFile)
        } else if (mediaFile.type.startsWith('video/')) {
          formData.append('video', mediaFile)
        }
      }

      // Obter token de autenticação
      const userData = JSON.parse(localStorage.getItem('empowerup_user') || '{}')
      
      // Fazer chamada para API usando a nova estrutura
      const response = await fetch(`${config.API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': userData.token ? `Bearer ${userData.token}` : ''
        },
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        // Adicionar o novo post à lista de posts
        setPosts(prevPosts => [result.post, ...prevPosts])
  // Exibir modal de sucesso personalizado
  setSuccessModal({ visible: true, message: 'Post realizado com sucesso' })
  if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
  successTimeoutRef.current = setTimeout(() => setSuccessModal({ visible: false, message: '' }), 4000)
        return { success: true, post: result.post }
      } else {
        addToast('Erro ao criar post: ' + result.message, 'error')
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Erro ao criar post:', error)
      addToast('Erro ao publicar post: ' + error.message, 'error')
      return { success: false, message: error.message }
    }
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
    }
  }, [])

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) {
      return
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/posts/postagens.php?id=${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
        addToast('Post deletado com sucesso! ✅', 'success')
      } else {
        throw new Error('Erro ao deletar post')
      }
    } catch (error) {
      console.error("Erro ao deletar post:", error)
      addToast('Erro ao deletar post', 'error')
    }
  }

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/groups/grupos.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      })

      if (response.ok) {
        // Recarregar grupos
        const groupsResponse = await fetch(`${config.API_BASE_URL}/groups/grupos.php`)
        if (groupsResponse.ok) {
          const data = await groupsResponse.json()
          if (data.success) {
            setGroups(data.groups || [])
          }
        }
        setShowCreateGroup(false)
        addToast('Grupo criado com sucesso! 🎉', 'success')
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error)
      addToast('Erro ao criar grupo', 'error')
    }
  }

  // Handle like functionality
  const handleLike = async (postId, liked, likesCount) => {
    if (!user) {
      addToast('Faça login para curtir posts', 'warning')
      return
    }

    // Atualizar o post na lista com os novos valores
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: likesCount,
              user_liked: liked,
              isLiked: liked
            }
          : post
      )
    )
    addToast(liked ? 'Post curtido! ❤️' : 'Like removido', 'success')
  }

  // Handle save functionality
  const handleSave = async (postId, saved) => {
    if (!user) {
      addToast('Faça login para salvar posts', 'warning')
      return
    }

    // Atualizar o post na lista com os novos valores
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              user_saved: saved,
              isSaved: saved
            }
          : post
      )
    )
    addToast(saved ? 'Post salvo!' : 'Post removido dos salvos', 'success')
  }

  // Handle comment functionality
  const handleComment = async (postId, commentText, parentId = null) => {
    if (!user) {
      addToast('Faça login para comentar', 'warning')
      return
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/comments/posts/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          conteudo: commentText,
          parent_id: parentId
        })
      })

      const data = await response.json()
      if (data.success) {
        addToast('Comentário adicionado! 💬', 'success')
        // Atualizar contagem de comentários no post
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comentarios: post.comentarios + 1
                }
              : post
          )
        )
      }
    } catch (error) {
      console.error('Erro ao comentar:', error)
      addToast('Erro ao adicionar comentário', 'error')
    }
  }

  // Handle share functionality
  const handleShare = async (postId) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'EmpowerUp - Comunidade',
          text: 'Confira este post incrível!',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        addToast('Link copiado para a área de transferência! 📋', 'success')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const handleUpdatePost = (post) => {
    // Atualizar post na lista
    setPosts(prevPosts => 
      prevPosts.map(p => p.id === post.id ? post : p)
    )
  }

  const filteredPosts = posts.filter((post) => {
    if (selectedFilter === "todos") return true
    return post.categoria?.toLowerCase() === selectedFilter.toLowerCase()
  })

  const filters = [
    { label: "Todos", value: "todos" },
    { label: "Artesanato", value: "artesanato" },
    { label: "Culinária", value: "culinaria" },
    { label: "Moda", value: "moda" },
    { label: "Beleza", value: "beleza" },
    { label: "Tecnologia", value: "tecnologia" },
    { label: "Negócios", value: "negocios" },
    { label: "Saúde", value: "saude" },
    { label: "Educação", value: "educacao" },
  ]

  const markAsRead = async (notificationId) => {
    if (!user?.token) return
    
    try {
      const response = await fetch(`${config.API_BASE_URL}/notifications/mark_read.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ notification_id: notificationId })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId 
                ? { ...notif, is_read: true }
                : notif
            )
          )
        }
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando comunidade...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral/5 to-olive/5 text-gray-800">
      {/* Modal de Sucesso personalizado */}
      {successModal.visible && (
        <div className="fixed top-5 right-5 z-50">
          <div className="w-80 bg-white rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-start gap-3 p-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{successModal.message}</div>
                <div className="text-xs text-gray-500">Seu post foi publicado e aparece na comunidade.</div>
              </div>
              <button aria-label="Fechar" onClick={() => { if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current); setSuccessModal({ visible: false, message: '' }) }} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-1 bg-emerald-100">
              <div className="h-full bg-emerald-500 animate-progress" style={{ animationDuration: '4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Platform header */}
      <SiteHeader />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Banner - accessible and dismissible with entrance/exit animation */}
        {showBanner && (
          <div role="region" aria-label="Banner da Comunidade" className="mb-6">
            <div
              className={`relative bg-white rounded-xl shadow-md p-4 md:p-5 flex items-start gap-4 transform transition-all duration-300 ease-out ${bannerVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-98'}`}
              aria-hidden={!bannerVisible}
            >
              <div className="flex-shrink-0">
                <Sparkles className="h-8 w-8 text-coral" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Comunidade EmpowerUp</h2>
                <p className="text-sm text-gray-600">Conecte-se, compartilhe e cresça com outras empreendedoras — participe de grupos, eventos e troque experiências.</p>
                <div className="mt-3 flex items-center gap-3">
                  <Button className="bg-olive hover:bg-olive/90 transition-transform transform hover:-translate-y-0.5" size="sm" aria-label="Saiba mais sobre a comunidade">Saiba mais</Button>
                  <Button variant="outline" size="sm" aria-label="Minimizar banner" onClick={() => closeBanner()}>Minimizar</Button>
                </div>
              </div>
              <button
                aria-label="Fechar banner"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral rounded transition-colors"
                onClick={() => closeBanner()}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - mimic Twitter: hidden on small screens */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 self-start">
            <nav aria-label="Navegação principal" className="space-y-2">
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="/" className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-coral" aria-current="false">
                    <Home className="h-5 w-5 text-gray-700" />
                    <span className="font-medium">Início</span>
                  </a>
                </li>
                <li>
                  <a href="/comunidade" className="flex items-center gap-3 p-3 rounded-full bg-coral/10 text-coral font-semibold focus:outline-none focus:ring-2 focus:ring-coral" aria-current="true">
                    <Users className="h-5 w-5" />
                    <span>Comunidade</span>
                  </a>
                </li>
                <li>
                  <a href="/explore" className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-coral">
                    <TrendingUp className="h-5 w-5 text-gray-700" />
                    <span>Explorar</span>
                  </a>
                </li>
                <li>
                  <a href="/notificacoes" className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-coral">
                    <Bell className="h-5 w-5 text-gray-700" />
                    <span>Notificações</span>
                  </a>
                </li>
                <li>
                  <a href="/mensagens" className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-coral">
                    <Mail className="h-5 w-5 text-gray-700" />
                    <span>Mensagens</span>
                  </a>
                </li>
                <li>
                  <a href="/posts-salvos" className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-coral">
                    <Bookmark className="h-5 w-5 text-gray-700" />
                    <span>Salvos</span>
                  </a>
                </li>
                <li>
                  <a href="/perfil" className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-coral">
                    <User className="h-5 w-5 text-gray-700" />
                    <span>Perfil</span>
                  </a>
                </li>
              </ul>
              <div className="mt-4">
                <Button className="w-full bg-coral hover:bg-coral/90">Criar Post</Button>
              </div>
            </nav>
          </aside>

          {/* Main column */}
          <section className="lg:col-span-6">
            <div className="bg-transparent">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="flex space-x-2 mb-4" role="tablist">
                  <TabsTrigger value="posts" className="text-base px-3 py-2 rounded-md" role="tab">Posts</TabsTrigger>
                  <TabsTrigger value="grupos" className="text-base px-3 py-2 rounded-md" role="tab">Grupos</TabsTrigger>
                  <TabsTrigger value="eventos" className="text-base px-3 py-2 rounded-md" role="tab">Eventos</TabsTrigger>
                  {user && (
                    <TabsTrigger value="notificacoes" className="text-base px-3 py-2 rounded-md flex items-center gap-2" role="tab">
                      <Bell className="h-4 w-4" />
                      Notificações
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="posts" className="mt-0">
                  <div className="space-y-6">
                    {user ? (
                      <EmpowerUpCreatePost 
                        user={user} 
                        onPostCreated={handleNewPost}
                        className="mb-6"
                      />
                    ) : (
                      <Card className="shadow-sm">
                        <CardContent className="p-6 text-center">
                          <p className="text-gray-600 mb-4">Faça login para participar da comunidade</p>
                          <Button className="bg-coral hover:bg-coral/90">
                            Fazer Login
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-2 items-center" aria-hidden="false">
                      <div className="flex items-center space-x-2 mr-4">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
                      </div>
                      {filters.map((filter) => (
                        <Button
                          key={filter.value}
                          variant={selectedFilter === filter.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedFilter(filter.value)}
                          aria-pressed={selectedFilter === filter.value}
                          className={selectedFilter === filter.value ? "bg-coral hover:bg-coral/90" : ""}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {filteredPosts.map((post) => (
                        <SocialPost
                          key={post.id}
                          post={post}
                          currentUser={user}
                          onLike={handleLike}
                          onComment={handleComment}
                          onShare={handleShare}
                          onDelete={handleDeletePost}
                          onUpdate={handleUpdatePost}
                          onSave={handleSave}
                          showSaveButton={true}
                          isSaved={post.user_saved || post.isSaved || false}
                        />
                      ))}

                      {filteredPosts.length === 0 && (
                        <Card className="shadow-sm">
                          <CardContent className="p-12 text-center">
                            <div className="text-gray-500">
                              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2">Nenhum post encontrado</h3>
                              <p className="text-sm">
                                {selectedFilter === "todos" 
                                  ? "Seja o primeiro a compartilhar algo inspirador!" 
                                  : "Nenhum post encontrado para este filtro."
                                }
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Grupos e Eventos usam the existing markup - preserved */}
                <TabsContent value="grupos" className="mt-0">
                  {/* ...existing code... */}
                </TabsContent>
                <TabsContent value="eventos" className="mt-0">
                  {/* ...existing code... */}
                </TabsContent>
                
                {/* Notificações */}
                {user && (
                  <TabsContent value="notificacoes" className="mt-0">
                    <div className="space-y-4">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Card 
                            key={notification.id} 
                            className={`shadow-sm cursor-pointer transition-colors ${
                              !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {notification.type === 'like' && (
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                      <Heart className="h-5 w-5 text-red-500" />
                                    </div>
                                  )}
                                  {notification.type === 'comment' && (
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <MessageCircle className="h-5 w-5 text-blue-500" />
                                    </div>
                                  )}
                                  {notification.type === 'follow' && (
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-green-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">{notification.from_user_name}</span>
                                    {notification.type === 'like' && ' curtiu seu post'}
                                    {notification.type === 'comment' && ' comentou em seu post'}
                                    {notification.type === 'follow' && ' começou a seguir você'}
                                  </p>
                                  {notification.message && (
                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                {!notification.is_read && (
                                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card className="shadow-sm">
                          <CardContent className="p-12 text-center">
                            <div className="text-gray-500">
                              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                              <p className="text-sm">Suas notificações aparecerão aqui</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </section>

          {/* Right column - search, trending, events, groups */}
          <aside className="lg:col-span-3 space-y-6">
            <SearchComponent />

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-coral" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trending.length > 0 ? (
                    trending.slice(0, 5).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center">
                            <Hash className="h-5 w-5 text-coral" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">#{trend.tag}</div>
                            <div className="text-xs text-gray-500">{trend.count} posts</div>
                          </div>
                        </div>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma hashtag em alta ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Próximos Eventos */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-coral" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="border-l-3 border-coral pl-3">
                      <h4 className="font-medium text-sm">{event.titulo}</h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.data_evento).toLocaleDateString('pt-BR')}
                      </div>
                      {event.localizacao && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.localizacao}
                        </div>
                      )}
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum evento programado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Grupos Ativos - kept */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-olive" />
                  Grupos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groups.slice(0, 4).map((group) => (
                    <div key={group.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-olive/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-olive" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{group.nome}</p>
                          <p className="text-xs text-gray-500">{group.membros_count || 0} membros</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum grupo ativo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onSave={handleCreateGroup}
        />
      )}
      {showUsernameModal && (
        <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
          <DialogContent>
            {/* Modal for initial username setup */}
            <UsernameSetup
              user={user}
              onUsernameSet={(username) => {
                updateUser({ username });
                setShowUsernameModal(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
