import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MapPin, Calendar, Edit, User, Mail, Phone, Settings, LogOut, MessageCircle, Heart, Share2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import ImageUpload from "../components/ImageUpload"
import UsernameSetup from "../components/UsernameSetup"
import { useToast } from "../components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"

export default function MeuPerfil() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const { addToast, ToastContainer } = useToast()
  const [perfil, setPerfil] = useState({
    nome: "",
    email: "",
    telefone: "",
    bio: "",
    localizacao: "",
    membro_desde: "",
    especialidades: [],
    avatar: "",
    username: "",
    total_posts: 0,
  })
  const [formData, setFormData] = useState(perfil)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showUsernameSetup, setShowUsernameSetup] = useState(false)
  const [recentPosts, setRecentPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [originalUsername, setOriginalUsername] = useState("")

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Carregar dados do perfil
    const fetchPerfil = async () => {
      try {
        // Buscar dados do usuário pelo ID
        const response = await fetch(`http://localhost/empowerup/api/username.php?action=get_user_profile&user_id=${user.id}`)
        const data = await response.json()
        
        if (data.success) {
          const userData = data.user
          const perfilData = {
            nome: userData.nome || "Usuário",
            email: userData.email || "",
            telefone: userData.telefone || "",
            bio: userData.bio || "Olá! Seja bem-vindo ao meu perfil.",
            localizacao: userData.localizacao || "Brasil",
            membro_desde: userData.membro_desde || "2024",
            especialidades: userData.especialidades || ["Membro"],
            avatar: userData.avatar_url || "",
            username: userData.username || "",
            total_posts: userData.total_posts || 0,
          }
          
          setPerfil(perfilData)
          setFormData(perfilData)
          
          // Se não tem username, mostrar setup
          if (!userData.username) {
            setShowUsernameSetup(true)
          } else {
            // Carregar posts recentes
            fetchRecentPosts(userData.username)
            setOriginalUsername(userData.username)
          }
        } else {
          // Fallback para dados do contexto
          const perfilData = {
            nome: user.nome || "Usuário",
            email: user.email || "",
            telefone: user.telefone || "",
            bio: user.bio || "Olá! Seja bem-vindo ao meu perfil.",
            localizacao: user.localizacao || "Brasil",
            membro_desde: user.data_cadastro ? new Date(user.data_cadastro).toLocaleDateString('pt-BR') : "2024",
            especialidades: user.especialidades || ["Membro"],
            avatar: user.avatar_url || "",
            username: user.username || "",
            total_posts: 0,
          }
          
          setPerfil(perfilData)
          setFormData(perfilData)
          
          if (!user.username) {
            setShowUsernameSetup(true)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        // Fallback
        const perfilData = {
          nome: user.nome || "Usuário",
          email: user.email || "",
          telefone: user.telefone || "",
          bio: user.bio || "Olá! Seja bem-vindo ao meu perfil.",
          localizacao: user.localizacao || "Brasil",
          membro_desde: user.data_cadastro ? new Date(user.data_cadastro).toLocaleDateString('pt-BR') : "2024",
          especialidades: user.especialidades || ["Membro"],
          avatar: user.avatar_url || "",
          username: user.username || "",
          total_posts: 0,
        }
        
        setPerfil(perfilData)
        setFormData(perfilData)
      } finally {
        setLoading(false)
      }
    }

    fetchPerfil()
  }, [user, navigate])

  const fetchRecentPosts = async (username) => {
    setLoadingPosts(true)
    try {
      const response = await fetch(`http://localhost/empowerup/api/username.php?action=get_user_posts&username=${username}&limit=5`)
      const data = await response.json()
      
      if (data.success) {
        setRecentPosts(data.posts)
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
    }
    setLoadingPosts(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Verificar se username mudou e está disponível
    if (formData.username !== originalUsername && formData.username !== perfil.username) {
      if (usernameAvailable === false) {
        addToast('Username não está disponível', 'error')
        return
      }
      if (usernameAvailable === null && formData.username.length >= 3) {
        addToast('Verificando disponibilidade do username...', 'warning')
        return
      }
    }
    
    try {
      // Atualizar username se mudou
      if (formData.username !== originalUsername && formData.username.length >= 3) {
        const usernameResponse = await fetch('http://localhost/empowerup/api/username.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'set_username',
            user_id: user.id,
            username: formData.username
          })
        })
        
        const usernameData = await usernameResponse.json()
        if (!usernameData.success) {
          addToast('Erro ao atualizar username: ' + usernameData.message, 'error')
          return
        }
      }
      
      // Atualizar outros dados do perfil
      const profileResponse = await fetch('http://localhost/empowerup/api/usuarios.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_profile',
          user_id: user.id,
          nome: formData.nome,
          bio: formData.bio,
          telefone: formData.telefone,
          avatar_url: formData.avatar
        })
      })
      
      const profileData = await profileResponse.json()
      if (profileData.success) {
        setPerfil(formData)
        setOriginalUsername(formData.username)
        setUsernameAvailable(null)
        
        // Atualizar contexto de autenticação
        updateUser({
          nome: formData.nome,
          bio: formData.bio,
          telefone: formData.telefone,
          avatar_url: formData.avatar,
          username: formData.username
        })
        
        setEditDialogOpen(false)
        addToast('Perfil atualizado com sucesso! 🎉', 'success')
        
        // Recarregar posts se username mudou
        if (formData.username !== originalUsername) {
          fetchRecentPosts(formData.username)
        }
      } else {
        addToast('Erro ao atualizar perfil: ' + profileData.message, 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      addToast('Erro ao atualizar perfil', 'error')
    }
  }

  const handleImageUpload = (imagePath) => {
    // Atualizar o avatar no perfil
    setPerfil(prev => ({
      ...prev,
      avatar: imagePath
    }))
    setFormData(prev => ({
      ...prev,
      avatar: imagePath
    }))
    
    // Atualizar o contexto de autenticação com a nova foto
    updateUser({ avatar_url: imagePath })
    
    setShowImageUpload(false)
  }

  const handleUsernameSet = (newUsername) => {
    setPerfil(prev => ({
      ...prev,
      username: newUsername
    }))
    
    // Atualizar o contexto de autenticação
    updateUser({ username: newUsername })
    
    setShowUsernameSetup(false)
    
    // Carregar posts recentes
    fetchRecentPosts(newUsername)
  }

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3 || username === originalUsername) {
      setUsernameAvailable(null)
      return
    }

    setCheckingUsername(true)
    try {
      const response = await fetch(`http://localhost/empowerup/api/username.php?action=check_username&username=${encodeURIComponent(username)}`)
      const data = await response.json()
      
      setUsernameAvailable(data.available)
    } catch (error) {
      console.error('Erro ao verificar username:', error)
      setUsernameAvailable(false)
    }
    setCheckingUsername(false)
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setFormData(prev => ({
      ...prev,
      username: value
    }))
    
    // Debounce da verificação
    clearTimeout(window.usernameTimeout)
    window.usernameTimeout = setTimeout(() => {
      checkUsernameAvailability(value)
    }, 500)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8">
          {/* Setup de Username */}
          {showUsernameSetup && (
            <div className="mb-8 flex justify-center">
              <UsernameSetup user={user} onUsernameSet={handleUsernameSet} />
            </div>
          )}

          {/* Header do Perfil */}
          <div className="bg-gradient-to-r from-coral/10 to-sage/10 rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={perfil.avatar ? `http://localhost/empowerup/public${perfil.avatar}` : ''} alt={perfil.nome} />
                <AvatarFallback className="text-2xl bg-coral text-white">{perfil.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{perfil.nome}</h1>
                {perfil.username && (
                  <p className="text-coral font-medium text-lg mb-2">@{perfil.username}</p>
                )}
                <p className="text-gray-700 mb-4">{perfil.bio}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-coral" />
                    {perfil.localizacao}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-coral" />
                    Membro desde {perfil.membro_desde}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {perfil.especialidades.map((especialidade, index) => (
                    <Badge key={index} className="bg-coral/10 text-coral hover:bg-coral/20">
                      {especialidade}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="hover:bg-coral hover:text-white">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] p-0">
                    <div className="flex flex-col max-h-[90vh]">
                      <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                        <DialogTitle>Editar Perfil</DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto px-6 py-4">
                        <form onSubmit={handleSubmit} className="space-y-4" id="edit-profile-form">
                      {/* Seção de Avatar */}
                      <div className="flex flex-col items-center space-y-3 pb-4 border-b">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={formData.avatar ? `http://localhost/empowerup/public${formData.avatar}` : ''} alt={formData.nome} />
                          <AvatarFallback className="text-lg">{formData.nome.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowImageUpload(!showImageUpload)}
                          >
                            {showImageUpload ? "Cancelar" : "Alterar foto"}
                          </Button>
                        </div>
                        
                        {showImageUpload && (
                          <div className="w-full max-w-sm">
                            <ImageUpload
                              uploadType="user_avatar"
                              userId={user?.id || 1}
                              onUpload={handleImageUpload}
                              currentImage={formData.avatar}
                              placeholder="Selecione sua nova foto de perfil"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Nome</label>
                        <Input
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Username</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</div>
                          <Input
                            name="username"
                            value={formData.username}
                            onChange={handleUsernameChange}
                            placeholder="seu_username"
                            className="pl-8"
                            maxLength={20}
                          />
                          {checkingUsername && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coral"></div>
                            </div>
                          )}
                          {!checkingUsername && usernameAvailable === true && formData.username !== originalUsername && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="h-4 w-4 text-green-500">✓</div>
                            </div>
                          )}
                          {!checkingUsername && usernameAvailable === false && formData.username.length >= 3 && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="h-4 w-4 text-red-500">✕</div>
                            </div>
                          )}
                        </div>
                        {formData.username.length >= 3 && formData.username !== originalUsername && (
                          <div className={`text-xs mt-1 ${
                            usernameAvailable === true ? 'text-green-600' : 
                            usernameAvailable === false ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {checkingUsername ? 'Verificando...' :
                             usernameAvailable === true ? 'Username disponível!' :
                             usernameAvailable === false ? 'Username já está em uso' :
                             'Digite pelo menos 3 caracteres'}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Use apenas letras, números e underscore (_). 3-20 caracteres.
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Telefone</label>
                        <Input
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Biografia</label>
                        <Textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Conte um pouco sobre você..."
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Localização</label>
                        <Input
                          name="localizacao"
                          value={formData.localizacao}
                          onChange={handleChange}
                          placeholder="Cidade, Estado"
                        />
                      </div>
                        </form>
                      </div>
                      
                      <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
                        <div className="flex justify-end space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            form="edit-profile-form"
                            className="bg-coral hover:bg-coral/90"
                          >
                            Salvar alterações
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="hover:bg-red-500 hover:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>

          {/* Cards de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-coral" />
                  Informações Pessoais
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm">{perfil.email || 'Email não informado'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm">{perfil.telefone || 'Telefone não informado'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm">{perfil.localizacao}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-coral" />
                  Estatísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posts publicados</span>
                    <span className="text-sm font-medium">{perfil.total_posts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Especialidades</span>
                    <span className="text-sm font-medium">{perfil.especialidades.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Atividades Recentes */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
              {loadingPosts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando posts...</p>
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post, index) => (
                    <div key={post.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={post.avatar ? `http://localhost/empowerup/public${post.avatar}` : ''} 
                            alt={post.autor} 
                          />
                          <AvatarFallback className="bg-coral text-white">
                            {post.autor.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-sm">{post.autor}</span>
                            <span className="text-coral text-sm">{post.username}</span>
                            <span className="text-gray-500 text-xs">
                              {new Date(post.created_at).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm mb-3">{post.conteudo}</p>
                          {post.categoria && (
                            <Badge variant="secondary" className="mb-3 text-xs">
                              {post.categoria}
                            </Badge>
                          )}
                          <div className="flex items-center space-x-4 text-gray-500">
                            <div className="flex items-center space-x-1 text-xs">
                              <Heart className="h-4 w-4" />
                              <span>{post.likes || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comentarios || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs">
                              <Share2 className="h-4 w-4" />
                              <span>{post.compartilhamentos || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Você ainda não tem atividades recentes.</p>
                  <p className="text-sm mt-2">Comece a interagir com a comunidade para ver suas atividades aqui!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
      <ToastContainer />
    </div>
  )
}
