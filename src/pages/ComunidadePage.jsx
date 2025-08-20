import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Calendar,
  MapPin,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp,
  Hash
} from 'lucide-react'
import { CreateGroupModal } from '../components/create-group-modal'
import { useAuth } from '../contexts/AuthContext'
import { Dialog, DialogContent } from '../components/ui/dialog'
import UsernameSetup from '../components/UsernameSetup'
import { useToast } from '../components/ui/toast'
import SocialPost from '../components/SocialPost'
import EmpowerUpCreatePost from '../components/EmpowerUpCreatePost'
import SearchComponent from '../components/SearchComponent'

export default function ComunidadePage() {
  const [posts, setPosts] = useState([])
  const [groups, setGroups] = useState([])
  const [events, setEvents] = useState([])
  const [trending, setTrending] = useState([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("todos")
  const [loading, setLoading] = useState(true)
  
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
  // fetch all posts via API endpoint
  const url = `http://localhost/empowerup/api/posts${user?.id ? `?user_id=${user.id}` : ''}`
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
        const response = await fetch("http://localhost/empowerup/api/groups/grupos.php")
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
        const response = await fetch("http://localhost/empowerup/api/events/list.php")
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
        const response = await fetch("http://localhost/empowerup/api/trending/")
        if (response.ok) {
          const data = await response.json()
          setTrending(data.trending || [])
        }
      } catch (error) {
        console.error("Erro ao carregar trending:", error)
      }
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchPosts(),
        fetchGroups(),
        fetchEvents(),
        fetchTrending()
      ])
      setLoading(false)
    }
    
    loadData()
  }, [user?.id])
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
      const response = await fetch('http://localhost/empowerup/api/posts', {
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
        addToast('Post criado com sucesso! 🎉', 'success')
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost/empowerup/api/posts/postagens.php?id=${postId}`, {
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
      const response = await fetch("http://localhost/empowerup/api/groups/grupos.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      })

      if (response.ok) {
        // Recarregar grupos
        const groupsResponse = await fetch("http://localhost/empowerup/api/groups/grupos.php")
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
  const handleLike = async (postId, isLiked) => {
    if (!user) {
      addToast('Faça login para curtir posts', 'warning')
      return
    }

    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const response = await fetch('http://localhost/empowerup/api/posts/likes.php', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: user.id
        })
      })

      const data = await response.json()
      if (data.success) {
        // Atualizar o post na lista
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
                  user_liked: !isLiked
                }
              : post
          )
        )
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error)
      addToast('Erro ao curtir post', 'error')
    }
  }

  // Handle comment functionality
  const handleComment = async (postId, commentText, parentId = null) => {
    if (!user) {
      addToast('Faça login para comentar', 'warning')
      return
    }

    try {
      const response = await fetch('http://localhost/empowerup/api/posts/comentarios.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: user.id,
          comentario: commentText,
          parent_id: parentId
        })
      })

      const data = await response.json()
      if (data.success) {
        addToast('Comentário adicionado! 💬', 'success')
        // Recarregar os posts para mostrar o novo comentário
        const postsResponse = await fetch(`http://localhost/empowerup/api/posts/postagens_new.php${user?.id ? `?user_id=${user.id}` : ''}`)
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          setPosts(Array.isArray(postsData) ? postsData : [])
        }
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
    <div className="min-h-screen bg-gradient-to-b from-coral/5 to-olive/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <Sparkles className="inline h-8 w-8 text-coral mr-2" />
            Comunidade EmpowerUp
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conecte-se, compartilhe e cresça junto com mulheres empreendedoras de todo o país
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="posts" className="text-lg">Posts da Comunidade</TabsTrigger>
              <TabsTrigger value="grupos" className="text-lg">Grupos</TabsTrigger>
              <TabsTrigger value="eventos" className="text-lg">Eventos</TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Coluna Principal - Posts */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Criar Post */}
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

                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2 mb-6">
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
                        className={selectedFilter === filter.value ? "bg-coral hover:bg-coral/90" : ""}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>

                  {/* Posts */}
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

                {/* Coluna Lateral - Pesquisa e Trending */}
                <div className="space-y-6 lg:sticky lg:top-20">
                  {/* Componente de Pesquisa */}
                  <SearchComponent />

                  {/* Trending Topics */}
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

                  {/* Grupos Ativos */}
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
                </div>
              </div>
            </TabsContent>

            {/* Grupos Tab */}
            <TabsContent value="grupos" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Grupos da Comunidade</h2>
                  {user && (
                    <Button 
                      onClick={() => setShowCreateGroup(true)}
                      className="bg-olive hover:bg-olive/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Grupo
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group) => (
                    <Card key={group.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-olive/10 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-olive" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{group.nome}</h3>
                              <p className="text-sm text-gray-500">{group.membros_count || 0} membros</p>
                            </div>
                          </div>
                          <Badge className="bg-olive/10 text-olive">{group.categoria}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.descricao}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Criado em {new Date(group.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <Button size="sm" variant="outline" className="text-olive border-olive hover:bg-olive/10">
                            Participar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {groups.length === 0 && (
                  <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Nenhum grupo encontrado</h3>
                        <p className="text-sm mb-4">Seja a primeira a criar um grupo e conectar mulheres com interesses similares!</p>
                        {user && (
                          <Button 
                            onClick={() => setShowCreateGroup(true)}
                            className="bg-olive hover:bg-olive/90"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeiro Grupo
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Eventos Tab */}
            <TabsContent value="eventos" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Eventos da Comunidade</h2>
                  <Button className="bg-coral hover:bg-coral/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Evento
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{event.titulo}</h3>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(event.data_evento).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            {event.localizacao && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.localizacao}
                              </div>
                            )}
                          </div>
                          <Badge className="bg-coral/10 text-coral">{event.categoria}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.descricao}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {event.participantes_count || 0} interessados
                          </span>
                          <Button size="sm" className="bg-coral hover:bg-coral/90">
                            Participar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {events.length === 0 && (
                  <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
                        <p className="text-sm mb-4">Seja a primeira a criar um evento e reunir a comunidade!</p>
                        <Button className="bg-coral hover:bg-coral/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Evento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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
