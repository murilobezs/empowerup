import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  MessageCircle, 
  Users, 
  Calendar,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp,
  Hash,
  Home,
  Bell,
  Bookmark,
  UserPlus,
  CheckCircle, 
  X,
  Heart,
  GraduationCap,
  Award,
  Megaphone,
  BookOpen
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import UsernameSetup from '../components/UsernameSetup'
import { useToast } from '../components/ui/toast'
import SocialPost from '../components/SocialPost'
import EmpowerUpCreatePost from '../components/EmpowerUpCreatePost'
import SearchComponent from '../components/SearchComponent'
import EditPostModal from '../components/EditPostModal'
import config from '../config/config'
import apiService from '../services/api'
import { getStoredToken } from '../utils/authStorage'
import { SiteHeader } from '../components/site-header'
import CommunityLeftSidebar from '../components/layout/CommunityLeftSidebar'
import CommunityRightSidebar from '../components/layout/CommunityRightSidebar'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationsContext'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { formatTimeAgo } from '../utils'
import {
  normalizeNotificationType,
  getNotificationActorName,
  getNotificationMessage,
  getNotificationSubtitle,
  getNotificationTargetUrl,
} from '../utils/notificationUtils'
import { Loading } from '../components/common'

const COMMUNITY_TAB_VALUES = ['posts', 'seguindo', 'grupos', 'notificacoes']

const isAuthorFollowed = (post = {}) => {
  const rawValue = post?.isFollowed ?? post?.autor_seguido ?? post?.autorSeguido ?? post?.following ?? post?.seguindo

  if (typeof rawValue === 'boolean') {
    return rawValue
  }

  if (typeof rawValue === 'number') {
    return Number(rawValue) > 0
  }

  if (typeof rawValue === 'string') {
    const normalized = rawValue.trim().toLowerCase()
    return normalized === '1' || normalized === 'true' || normalized === 'sim'
  }

  return false
}

export default function ComunidadePage() {
  const [posts, setPosts] = useState([])
  const [groups, setGroups] = useState([])
  const [groupPosts, setGroupPosts] = useState([])
  const [events, setEvents] = useState([])
  const [trending, setTrending] = useState([])
  const [selectedFilter, setSelectedFilter] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(true)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' }) // Novo estado para o modal
  const [editingPost, setEditingPost] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const bannerStorageKey = useMemo(() => (
    user?.id ? `empowerup_banner_hidden_${user.id}` : 'empowerup_banner_hidden'
  ), [user?.id])
  const {
    notifications,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    refresh: refreshNotifications
  } = useNotifications()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab')
    return tabParam && COMMUNITY_TAB_VALUES.includes(tabParam) ? tabParam : 'posts'
  })
  const successTimeoutRef = useRef(null)

  const removeComposeParam = useCallback(() => {
    const composeParam = searchParams.get('compose')
    if (!composeParam) {
      return
    }

    const updated = new URLSearchParams(searchParams)
    updated.delete('compose')
    setSearchParams(updated, { replace: true })
  }, [searchParams, setSearchParams])

  const closeCreatePostModal = useCallback(() => {
    setShowCreatePostModal(false)
    removeComposeParam()
  }, [removeComposeParam])

  const refreshGroups = useCallback(async () => {
    try {
      const data = await apiService.listGroups({ limit: 12 })
      if (data?.success) {
        setGroups(data.groups || data.grupos || [])
      } else {
        setGroups([])
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      setGroups([])
    }
  }, [setGroups, user?.id])

  const refreshEvents = useCallback(async () => {
    try {
      const data = await apiService.getEvents({ status: 'ativo', futuro: 'true', limit: 12 })
      if (data?.success) {
        setEvents(data.events || data.eventos || [])
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      setEvents([])
    }
  }, [setEvents, user?.id])

  useEffect(() => {
    const tabParam = searchParams.get('tab')

    if (tabParam === 'grupos') {
      navigate('/grupos', { replace: true })
      return
    }

    if (tabParam === 'eventos') {
      navigate('/eventos', { replace: true })
      return
    }

    const normalized = tabParam && COMMUNITY_TAB_VALUES.includes(tabParam) ? tabParam : 'posts'
    if (normalized !== activeTab) {
      setActiveTab(normalized)
    }
  }, [searchParams, activeTab, navigate])

  useEffect(() => {
    const composeParam = searchParams.get('compose')

    if (composeParam === '1') {
      if (!user) {
        addToast('Faça login para criar um post', 'warning')
        removeComposeParam()
        return
      }

      setShowCreatePostModal(true)
    }
  }, [searchParams, user, addToast, removeComposeParam])

  useEffect(() => {
    if (!showCreatePostModal) {
      removeComposeParam()
    }
  }, [showCreatePostModal, removeComposeParam])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(bannerStorageKey)
      if (stored === '1') {
        setShowBanner(false)
        setBannerVisible(false)
      } else {
        setShowBanner(true)
      }
    } catch (error) {
      console.warn('Não foi possível verificar o estado do banner:', error)
    }
  }, [bannerStorageKey])

  useEffect(() => {
    if (showBanner) {
      const t = setTimeout(() => setBannerVisible(true), 50)
      return () => clearTimeout(t)
    }
  }, [showBanner])

  const closeBanner = () => {
    if (typeof document !== 'undefined') {
      const active = document.activeElement
      if (active && typeof active.blur === 'function') {
        active.blur()
      }
    }
    setBannerVisible(false)
    setTimeout(() => setShowBanner(false), 220)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(bannerStorageKey, '1')
      } catch (error) {
        console.warn('Não foi possível salvar preferência do banner:', error)
      }
    }
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    if (value === 'posts') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    setSearchParams(params, { replace: true })
  }

  useEffect(() => {
    if (activeTab === 'notificacoes') {
      refreshNotifications()
    }
  }, [activeTab, refreshNotifications])

  useEffect(() => {
    const handleCreatePost = () => {
      setShowCreatePostModal(true)
    }

    window.addEventListener('openCreatePost', handleCreatePost)
    return () => window.removeEventListener('openCreatePost', handleCreatePost)
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await apiService.getPosts()

        if (result.success && Array.isArray(result.posts)) {
          setPosts(result.posts)
        } else {
          setPosts([])
        }
      } catch (error) {
        console.error('Erro ao carregar posts:', error)
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
        console.error('Erro ao carregar trending:', error)
      }
    }

    const fetchGroupPosts = async () => {
      if (!user) {
        setGroupPosts([])
        return
      }
      
      try {
        const result = await apiService.getMyGroupsPosts()
        if (result.success && Array.isArray(result.posts)) {
          setGroupPosts(result.posts)
        } else {
          setGroupPosts([])
        }
      } catch (error) {
        console.error('Erro ao carregar posts dos grupos:', error)
        setGroupPosts([])
      }
    }

    let isMounted = true
    const MIN_LOADER_DURATION = 2300

    const loadData = async () => {
      setLoading(true)
      const getNow = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now())
      const startedAt = getNow()

      try {
        await Promise.allSettled([
          fetchPosts(),
          refreshGroups(),
          refreshEvents(),
          fetchTrending(),
          fetchGroupPosts()
        ])
      } catch (error) {
        console.error('Erro ao carregar dados da comunidade:', error)
      }

      const elapsed = getNow() - startedAt
      const remaining = MIN_LOADER_DURATION - elapsed

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining))
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user, refreshGroups, refreshEvents])

  const [showUsernameModal, setShowUsernameModal] = useState(false)
  useEffect(() => {
    if (user && !user.username) {
      setShowUsernameModal(true)
    }
  }, [user])

  const handleNewPost = async (postData, mediaFile) => {
    try {
      if (!user?.id) {
        addToast('Você precisa estar logada para postar', 'error')
        return { success: false, message: 'Usuária não logada' }
      }

      const formData = new FormData()
      formData.append('conteudo', postData.conteudo)
      formData.append('categoria', postData.categoria)
      formData.append('tags', JSON.stringify(postData.tags))

      if (mediaFile) {
        if (mediaFile.type.startsWith('image/')) {
          formData.append('image', mediaFile)
        } else if (mediaFile.type.startsWith('video/')) {
          formData.append('video', mediaFile)
        }
      }

      const token = getStoredToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(`${config.API_BASE_URL}/posts`, {
        method: 'POST',
        headers,
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setPosts(prevPosts => [result.post, ...prevPosts])
        setSuccessModal({ visible: true, message: 'Post realizado com sucesso' })
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
        successTimeoutRef.current = setTimeout(() => setSuccessModal({ visible: false, message: '' }), 4000)
        if (showCreatePostModal) {
          closeCreatePostModal()
        }
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
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
        addToast('Post deletado com sucesso! ✅', 'success')
      } else {
        throw new Error('Erro ao deletar post')
      }
    } catch (error) {
      console.error('Erro ao deletar post:', error)
      addToast('Erro ao deletar post', 'error')
    }
  }

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

  // Handle follow functionality
  const handleFollow = async (userId, following, followersCount) => {
    if (!user) {
      addToast('Faça login para seguir usuários', 'warning')
      return
    }

    // Atualizar todos os posts deste usuário na lista
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.user_id === userId 
          ? { 
              ...post, 
              isFollowed: following,
              followers_count: followersCount
            }
          : post
      )
    )
    addToast(following ? 'Agora você está seguindo este usuário!' : 'Você parou de seguir este usuário', 'success')
  }

  // Handle comment functionality
  const handleComment = async (postId, commentPayload, parentId = null) => {
    if (!user) {
      addToast('Faça login para comentar', 'warning')
      return
    }

    // Quando o componente filho já tratou o envio (payload vazio ou objeto),
    // apenas atualizamos os contadores locais e evitamos chamadas duplicadas à API.
    if (!commentPayload || (typeof commentPayload === 'object' && !Array.isArray(commentPayload))) {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comentarios: (post.comentarios || 0) + 1
              }
            : post
        )
      )
      addToast('Comentário adicionado! 💬', 'success')
      return
    }

    const commentText = typeof commentPayload === 'string' ? commentPayload : ''

    if (!commentText.trim()) {
      addToast('Digite um comentário antes de enviar.', 'warning')
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
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comentarios: (post.comentarios || 0) + 1
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
    // Abrir modal de edição
    setEditingPost(post)
    setShowEditModal(true)
  }

  const handleSaveEditPost = async (postId, updatedData) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedData)
      })

      const data = await response.json()

      if (data.success) {
        // Atualizar post na lista
        setPosts(prevPosts => 
          prevPosts.map(p => p.id === postId ? { ...p, ...data.post } : p)
        )
        addToast('Post atualizado com sucesso!', 'success')
      } else {
        throw new Error(data.message || 'Erro ao atualizar post')
      }
    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      addToast('Erro ao atualizar post. Tente novamente.', 'error')
      throw error
    }
  }

  const matchesCategoryFilter = useCallback((post) => {
    if (!post) return false
    if (selectedFilter === 'todos') return true
    const category = (post.categoria || post.category || '')
    return category.toLowerCase() === selectedFilter.toLowerCase()
  }, [selectedFilter])

  const filteredPosts = useMemo(() => posts.filter(matchesCategoryFilter), [posts, matchesCategoryFilter])

  const filteredFollowingPosts = useMemo(
    () => posts.filter((post) => isAuthorFollowed(post) && matchesCategoryFilter(post)),
    [posts, matchesCategoryFilter]
  )

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

  const renderCategoryFilter = () => (
    <div className="mb-3 sm:mb-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter className="h-4 w-4 text-gray-500" />
          <span>Filtrar por categoria</span>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full border-sage/30 focus:border-coral focus:ring-coral/40">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {filters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderPostList = (postList, emptyState = {}) => {
    const {
      icon: EmptyIcon = MessageCircle,
      title = 'Nenhum post encontrado',
      description = 'Seja a primeira a compartilhar algo inspirador!',
      action = null,
    } = emptyState

    return (
      <div className="space-y-4 sm:space-y-6">
        {postList.map((post) => (
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
            onFollow={handleFollow}
            showSaveButton={true}
            isSaved={post.user_saved || post.isSaved || false}
            showGroupBadge={post.grupo_nome ? true : false}
            groupName={post.grupo_nome}
          />
        ))}

        {postList.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              {EmptyIcon && (
                <EmptyIcon className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:mb-4 sm:h-12 sm:w-12" />
              )}
              <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
              {action && <div className="mt-4 flex justify-center">{action}</div>}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderCreatePostSection = () => {
    if (user) {
      return (
        <div className="hidden md:block">
          <EmpowerUpCreatePost
            user={user}
            onPostCreated={handleNewPost}
            className="mb-4 sm:mb-6"
          />
        </div>
      )
    }

    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 text-center sm:p-6">
          <p className="mb-4 text-gray-600">Faça login para participar da comunidade</p>
          <Button className="bg-coral hover:bg-coral/90">
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  const coursesUrl = config.getCoursesUrl()

  const quickLinks = [
    {
      id: 'groups',
      to: '/grupos',
      title: 'Comunidade em grupos',
      description: 'Acesse os grupos temáticos completos para interagir com outras empreendedoras.',
      icon: Users,
      accent: 'bg-emerald-100 text-emerald-600',
      cta: 'Ir para grupos'
    },
    {
      id: 'events',
      to: '/eventos',
      title: 'Agenda de eventos',
      description: 'Confira workshops, mentorias e encontros presenciais ou online.',
      icon: Calendar,
      accent: 'bg-violet-100 text-violet-600',
      cta: 'Ver agenda completa'
    },
    {
      id: 'courses',
      to: coursesUrl,
      title: 'Cursos EmpowerUp',
      description: 'Domine novas habilidades com conteúdos feitos para microempreendedoras.',
      icon: GraduationCap,
      accent: 'bg-sky-100 text-sky-600',
      cta: 'Começar agora',
      external: true
    },
    {
      id: 'plans',
      to: '/planos',
      title: 'Planos e Assinaturas',
      description: 'Desbloqueie benefícios exclusivos, mentorias e ferramentas premium.',
      icon: Award,
      accent: 'bg-amber-100 text-amber-600',
      cta: 'Ver benefícios'
    },
    {
      id: 'campaigns',
      to: '/campanhas',
      title: 'Campanhas de Anúncios',
      description: 'Impulsione seu negócio e alcance novas clientes com campanhas guiadas.',
      icon: Megaphone,
      accent: 'bg-rose-100 text-rose-600',
      cta: 'Criar campanha'
    }
  ]

  const [hiddenQuickLinks, setHiddenQuickLinks] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem('empowerup_hidden_quick_links')
  }, [])

  const visibleQuickLinks = quickLinks.filter((item) => !hiddenQuickLinks.includes(item.id))

  const handleDismissQuickLink = (event, id) => {
    event.preventDefault()
    event.stopPropagation()
    setHiddenQuickLinks((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const renderNotificationIcon = (notification) => {
    const type = normalizeNotificationType(notification)

    switch (type) {
      case 'like':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-red-500" />
          </div>
        )
      case 'comment':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-blue-500" />
          </div>
        )
      case 'follow':
        return (
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-emerald-500" />
          </div>
        )
      case 'save':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-purple-500" />
          </div>
        )
      case 'message':
        return (
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-sky-500" />
          </div>
        )
      case 'group':
        return (
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-amber-500" />
          </div>
        )
      case 'course':
        return (
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-500" />
          </div>
        )
      case 'system':
        return (
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-rose-500" />
          </div>
        )
      case 'campaign':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-orange-500" />
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-gray-500" />
          </div>
        )
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification?.id) return

    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }

    const targetUrl = getNotificationTargetUrl(notification)
    if (targetUrl) {
      window.location.href = targetUrl
    }
  }

  const handleMarkAllNotifications = async () => {
    const success = await markAllNotificationsAsRead()
    if (success) {
      refreshNotifications()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-coral/5 to-olive/5">
        <Loading size="lg" text="Carregando a comunidade..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral/5 to-olive/5 text-gray-800">
      {/* Modal de Sucesso personalizado */}
      {successModal.visible && (
        <div className="fixed top-5 right-5 z-[70]">
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

  <main className="container mx-auto max-w-7xl px-3 sm:px-4 pb-20 md:pb-16 pt-4 sm:pt-6">
        {/* Banner - accessible and dismissible with entrance/exit animation */}
        {showBanner && (
          <div role="region" aria-label="Banner da Comunidade" className="mb-4 sm:mb-6">
            <div
              className={`relative bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-5 flex items-start gap-3 sm:gap-4 transform transition-all duration-300 ease-out ${bannerVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-98 pointer-events-none'}`}
              data-state={bannerVisible ? 'open' : 'closing'}
            >
              <div className="flex-shrink-0">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-coral" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Comunidade EmpowerUp</h2>
                <p className="text-sm text-gray-600 leading-relaxed">Conecte-se, compartilhe e cresça com outras empreendedoras — participe de grupos, eventos e troque experiências.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button className="bg-olive hover:bg-olive/90 transition-transform transform hover:-translate-y-0.5" size="sm" aria-label="Saiba mais sobre a comunidade">Saiba mais</Button>
                  <Button variant="outline" size="sm" aria-label="Minimizar banner" onClick={() => closeBanner()}>Minimizar</Button>
                </div>
              </div>
              <button
                aria-label="Fechar banner"
                className="absolute right-2 top-2 sm:right-3 sm:top-3 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral transition-colors"
                onClick={() => closeBanner()}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar - mimic Twitter: hidden on small screens */}
          <CommunityLeftSidebar active={activeTab === 'notificacoes' ? 'notificacoes' : 'comunidade'} />

          {/* Main column */}
          <section className="lg:col-span-6">
            <div className="bg-transparent">
              <div className="space-y-4 mb-4 sm:mb-6">
                <div className="px-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tudo para crescer seu negócio em um só lugar</h2>
                  <p className="text-sm text-gray-600 mt-1">Acesse cursos, planos e campanhas diretamente daqui da comunidade.</p>
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleQuickLinks.length > 0 ? (
                    visibleQuickLinks.map((item) => {
                      const LinkComponent = item.external ? 'a' : Link;
                      const linkProps = item.external 
                        ? { href: item.to, target: '_blank', rel: 'noopener noreferrer' }
                        : { to: item.to };
                      
                      return (
                        <LinkComponent key={item.id} {...linkProps} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-coral rounded-xl">
                          <Card className="relative h-full flex flex-col transition-transform duration-200 transition-colors group-hover:-translate-y-1 group-hover:shadow-lg group-hover:bg-olive group-hover:border-olive/40">
                          <button
                            type="button"
                            aria-label={`Fechar card ${item.title}`}
                            className="absolute right-2 top-2 sm:right-3 sm:top-3 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/80 text-gray-400 transition hover:bg-white hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                            onClick={(event) => handleDismissQuickLink(event, item.id)}
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <CardHeader className="flex flex-row items-start gap-2 sm:gap-3 space-y-0 pb-3 sm:pb-4 pr-8 sm:pr-10 transition-colors">
                            <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${item.accent} group-hover:bg-white/20 group-hover:text-white`}>
                              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col min-w-0 gap-1 transition-colors">
                              <CardTitle className="text-sm sm:text-base text-gray-900 leading-tight break-words transition-colors group-hover:text-white">{item.title}</CardTitle>
                              <p className="text-xs sm:text-sm text-gray-600 leading-snug break-words whitespace-normal transition-colors group-hover:text-white/90">{item.description}</p>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 mt-auto transition-colors px-4 pb-3 sm:pb-4">
                            <Button variant="ghost" className="px-0 text-coral transition-colors hover:text-olive group-hover:text-white group-hover:hover:text-white text-sm">{item.cta} <ChevronRight className="inline h-3 w-3 sm:h-4 sm:w-4 ml-1" /></Button>
                          </CardContent>
                        </Card>
                      </LinkComponent>
                    );
                    })
                  ) : null}
                </div>
              </div>
              
              {/* Create Post Section - Sempre visível */}
              <div className="mb-4 sm:mb-6">
                {renderCreatePostSection()}
              </div>

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="mb-3 sm:mb-4 grid w-full grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 shadow-sm" role="tablist">
                  <TabsTrigger 
                    value="posts" 
                    className="rounded-lg px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4 sm:py-2.5 sm:text-base" 
                    role="tab"
                  >
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="seguindo" 
                    className="rounded-lg px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4 sm:py-2.5 sm:text-base" 
                    role="tab"
                  >
                    Seguindo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="grupos" 
                    className="rounded-lg px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4 sm:py-2.5 sm:text-base" 
                    role="tab"
                  >
                    Grupos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-0">
                  <div className="space-y-4 sm:space-y-6">
                    {renderCategoryFilter()}
                    {renderPostList(filteredPosts, {
                      title: 'Nenhum post encontrado',
                      description:
                        selectedFilter === 'todos'
                          ? 'Seja a primeira a compartilhar algo inspirador!'
                          : 'Nenhum post encontrado para esta categoria.',
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="seguindo" className="mt-0">
                  <div className="space-y-4 sm:space-y-6">
                    {renderCategoryFilter()}
                    {renderPostList(filteredFollowingPosts, {
                      icon: UserPlus,
                      title:
                        selectedFilter === 'todos'
                          ? 'Ainda não há posts de quem você segue'
                          : 'Ainda não há posts nesta categoria',
                      description:
                        selectedFilter === 'todos'
                          ? 'Comece a seguir outras empreendedoras para acompanhar as novidades por aqui.'
                          : 'As empreendedoras que você segue ainda não compartilharam nessa categoria.',
                      action: user ? (
                        <Button variant="outline" asChild>
                          <Link to="/explorar">Descobrir empreendedoras</Link>
                        </Button>
                      ) : null,
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="grupos" className="mt-0">
                  <div className="space-y-4 sm:space-y-6">
                    {renderCategoryFilter()}
                    {renderPostList(groupPosts, {
                      icon: Users,
                      title: 'Nenhum post dos seus grupos',
                      description: 'Entre em grupos para ver os posts das empreendedoras que fazem parte das mesmas comunidades que você!',
                      action: user ? (
                        <Button variant="outline" asChild>
                          <Link to="/grupos">Explorar grupos</Link>
                        </Button>
                      ) : null,
                    })}
                  </div>
                </TabsContent>

                {/* Conteúdos de eventos foram movidos para página dedicada */}

                {/* Notificações */}
                {user && (
                  <TabsContent value="notificacoes" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllNotifications}
                            className="text-sm text-coral hover:text-coral"
                          >
                            Marcar todas como lidas
                          </Button>
                        )}
                      </div>

                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const actorName = getNotificationActorName(notification) || 'Usuário'
                          const message = getNotificationMessage(notification)
                          const subtitle = getNotificationSubtitle(notification)
                          const actorUsername = notification.from_user?.username

                          return (
                            <Card
                              key={notification.id || `${notification.type}-${notification.created_at}`}
                              className={`shadow-sm cursor-pointer transition-colors ${
                                !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {renderNotificationIcon(notification)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                      {actorName && actorUsername ? (
                                        <>
                                          <Link 
                                            to={`/perfil/${actorUsername}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-medium hover:underline"
                                          >
                                            {actorName}
                                          </Link>{' '}
                                          <span className="text-gray-700">{message}</span>
                                        </>
                                      ) : actorName ? (
                                        <>
                                          <span className="font-medium">{actorName}</span>{' '}
                                          <span className="text-gray-700">{message}</span>
                                        </>
                                      ) : (
                                        <span className="text-gray-700">{message}</span>
                                      )}
                                    </p>
                                    {subtitle && (
                                      <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                  {!notification.is_read && (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
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
          <CommunityRightSidebar trending={trending} events={events} groups={groups} />
        </div>
      </main>

      {/* Modals */}
      {showUsernameModal && (
        <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Nome de Usuário</DialogTitle>
              <DialogDescription>
                Complete seu perfil configurando um nome de usuário único.
              </DialogDescription>
            </DialogHeader>
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

      <Dialog
        open={showCreatePostModal}
        onOpenChange={(open) => (open ? setShowCreatePostModal(true) : closeCreatePostModal())}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100vw-3rem)] max-w-full overflow-y-auto overflow-x-hidden rounded-none p-0 sm:w-full sm:max-w-[640px] sm:rounded-lg sm:p-6">
          <DialogHeader className="px-4 pt-6 pr-10 sm:px-0 sm:pt-0 sm:pr-0">
            <DialogTitle className="text-base font-semibold leading-snug text-gray-900 sm:text-lg">
              Compartilhe algo com a comunidade
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
              Crie uma nova publicação para compartilhar com a comunidade.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-6 sm:px-0">
            {user ? (
              <EmpowerUpCreatePost
                user={user}
                onPostCreated={handleNewPost}
                className="border-0 shadow-none"
              />
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="mb-4 text-gray-600">Faça login para publicar na comunidade</p>
                  <Button asChild className="bg-coral hover:bg-coral/90">
                    <Link to="/login">Fazer login</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Post */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingPost(null)
        }}
        post={editingPost}
        onSave={handleSaveEditPost}
      />
    </div>
  )
}
