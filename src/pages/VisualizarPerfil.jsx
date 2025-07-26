import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MessageCircle, MapPin, Calendar, User, Mail, Phone, UserPlus, UserMinus } from "lucide-react"

export default function VisualizarPerfil() {
  const { username } = useParams()
  const [seguindo, setSeguindo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await fetch(`/api/usuarios.php?action=get_profile&username=${username}`);
        const result = await response.json();
        
        if (result.success && result.usuario) {
          const userData = result.usuario;
          const perfilData = {
            id: userData.id,
            nome: userData.nome,
            username: userData.username,
            avatar: userData.avatar_url ? `http://localhost/empowerup/public${userData.avatar_url}` : "/placeholder.svg?height=128&width=128",
            bio: userData.bio || "Este usuário ainda não adicionou uma biografia.",
            localizacao: userData.localizacao || "Localização não informada",
            membro_desde: new Date(userData.created_at).toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            }),
            especialidades: userData.especialidades || ["Usuário"],
            email: userData.email,
            telefone: userData.telefone || "Não informado",
            seguidores: userData.seguidores || 0,
            seguindo: userData.seguindo || 0,
            posts: userData.posts_count || 0,
          };
          
          setPerfil(perfilData);
        } else {
          setPerfil(null);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [username]);

  const handleSeguir = () => {
    setSeguindo(!seguindo)
    // Aqui você pode fazer uma chamada para a API para seguir/desseguir
    console.log("Seguindo:", !seguindo)
  }

  const handleConversar = () => {
    // Aqui você pode implementar a lógica para iniciar uma conversa
    console.log("Iniciar conversa com:", perfil.nome)
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

  if (!perfil) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
            <p className="text-gray-600">O usuário que você está procurando não existe.</p>
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
          {/* Header do Perfil */}
          <div className="bg-gradient-to-r from-coral/10 to-sage/10 rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={perfil.avatar} alt={perfil.nome} />
                <AvatarFallback className="text-2xl bg-coral text-white">{perfil.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{perfil.nome}</h1>
                <p className="text-gray-600 mb-1">@{perfil.username}</p>
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
                
                {/* Estatísticas do Perfil */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{perfil.posts}</div>
                    <div className="text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{perfil.seguidores}</div>
                    <div className="text-gray-600">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{perfil.seguindo}</div>
                    <div className="text-gray-600">Seguindo</div>
                  </div>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleSeguir} 
                  className={seguindo ? "bg-gray-500 hover:bg-gray-600" : "bg-coral hover:bg-coral/90"}
                >
                  {seguindo ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Seguir
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleConversar}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Conversar
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
                  Informações de Contato
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm">{perfil.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm">{perfil.telefone}</span>
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
                  <Calendar className="h-5 w-5 mr-2 text-coral" />
                  Atividade
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Membro desde</span>
                    <span className="text-sm font-medium">{perfil.membro_desde}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posts publicados</span>
                    <span className="text-sm font-medium">{perfil.posts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Posts Recentes */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Posts Recentes</h3>
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum post encontrado.</p>
                <p className="text-sm mt-2">Este usuário ainda não publicou nenhum conteúdo.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
