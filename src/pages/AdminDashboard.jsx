import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Users, 
  MessageCircle, 
  Users2, 
  TrendingUp, 
  Heart,  
  Edit2, 
  Trash2,
  BarChart3,
  Shield,
  LogOut
} from 'lucide-react';
import config from '../config/config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [posts, setPosts] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingItem, setEditingItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const API_BASE = `${config.API_BASE_URL}/admin`;

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats.php`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  useEffect(() => {
    // Verificar se o admin está logado
    const isAdminLoggedIn = localStorage.getItem('admin_logged_in');
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
      return;
    }

    fetchStats();
    fetchUsuarios();
    fetchPosts();
    fetchGrupos();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    navigate('/admin/login');
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE}/usuarios.php`);
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/posts.php`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }
  };

  const fetchGrupos = async () => {
    try {
      const response = await fetch(`${API_BASE}/grupos.php`);
      const data = await response.json();
      if (data.success) {
        setGrupos(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;

    try {
      const response = await fetch(`${API_BASE}/${type}.php?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        // Atualizar lista
        if (type === 'usuarios') fetchUsuarios();
        else if (type === 'posts') fetchPosts();
        else if (type === 'grupos') fetchGrupos();
        
        alert('Item excluído com sucesso!');
      } else {
        alert('Erro ao excluir: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir item');
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`${API_BASE}/${editingItem.type}.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Atualizar lista
        if (editingItem.type === 'usuarios') fetchUsuarios();
        else if (editingItem.type === 'posts') fetchPosts();
        else if (editingItem.type === 'grupos') fetchGrupos();
        
        setEditDialogOpen(false);
        setEditingItem(null);
        alert('Item atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar item');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="grupos">Grupos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total de Usuários"
                value={stats.total_usuarios || 0}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Total de Posts"
                value={stats.total_posts || 0}
                icon={MessageCircle}
                color="green"
              />
              <StatCard
                title="Total de Grupos"
                value={stats.total_grupos || 0}
                icon={Users2}
                color="purple"
              />
              <StatCard
                title="Total de Likes"
                value={stats.engagement?.total_likes || 0}
                icon={Heart}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Crescimento (30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Novos Usuários</span>
                      <Badge variant="outline">{stats.usuarios_ultimos_30_dias || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Novos Posts</span>
                      <Badge variant="outline">{stats.posts_ultimos_30_dias || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Novos Grupos</span>
                      <Badge variant="outline">{stats.grupos_ultimos_30_dias || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total de Likes</span>
                      <Badge variant="outline">{stats.engagement?.total_likes || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total de Comentários</span>
                      <Badge variant="outline">{stats.engagement?.total_comentarios || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total de Compartilhamentos</span>
                      <Badge variant="outline">{stats.engagement?.total_compartilhamentos || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{usuario.nome}</p>
                            <p className="text-sm text-gray-600">{usuario.email}</p>
                            <Badge variant="outline" className="mt-1">
                              {usuario.tipo}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(usuario, 'usuarios')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('usuarios', usuario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{post.autor}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{post.conteudo}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{post.categoria}</Badge>
                              <span className="text-xs text-gray-500">
                                {post.likes} likes • {post.comentarios} comentários
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post, 'posts')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('posts', post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grupos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Grupos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grupos.map((grupo) => (
                    <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{grupo.nome}</p>
                            <p className="text-sm text-gray-600">{grupo.descricao}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{grupo.categoria}</Badge>
                              <span className="text-xs text-gray-500">
                                {grupo.membros} membros
                              </span>
                              {grupo.ativo == 1 && (
                                <Badge variant="success">Ativo</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(grupo, 'grupos')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('grupos', grupo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar {editingItem?.type?.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingItem && (
              <>
                {editingItem.type === 'usuarios' && (
                  <>
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={editingItem.nome || ''}
                        onChange={(e) => setEditingItem({...editingItem, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingItem.email || ''}
                        onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={editingItem.telefone || ''}
                        onChange={(e) => setEditingItem({...editingItem, telefone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editingItem.bio || ''}
                        onChange={(e) => setEditingItem({...editingItem, bio: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {editingItem.type === 'posts' && (
                  <>
                    <div>
                      <Label htmlFor="conteudo">Conteúdo</Label>
                      <Textarea
                        id="conteudo"
                        value={editingItem.conteudo || ''}
                        onChange={(e) => setEditingItem({...editingItem, conteudo: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={editingItem.categoria || ''}
                        onChange={(e) => setEditingItem({...editingItem, categoria: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {editingItem.type === 'grupos' && (
                  <>
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={editingItem.nome || ''}
                        onChange={(e) => setEditingItem({...editingItem, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={editingItem.descricao || ''}
                        onChange={(e) => setEditingItem({...editingItem, descricao: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={editingItem.categoria || ''}
                        onChange={(e) => setEditingItem({...editingItem, categoria: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
