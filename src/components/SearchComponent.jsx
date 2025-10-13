import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import config from '../config/config';
import { getStoredToken } from '../utils/authStorage';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Hash, 
  MessageSquare,
  X,
  Filter,
  Calendar,
  MapPin
} from 'lucide-react';

const SearchComponent = ({ onResultSelect, onResultsUpdate, className = "" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    posts: [],
    users: [],
    groups: [],
    hashtags: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trending, setTrending] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all', // all, today, week, month
    mediaType: 'all', // all, images, videos
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Carregar pesquisas recentes e trending
  useEffect(() => {
    loadRecentSearches();
    loadTrending();
  }, []);

  // Debounce para pesquisa
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults({ posts: [], users: [], groups: [], hashtags: [] });
      setShowResults(false);
      if (onResultsUpdate) {
        onResultsUpdate(null, {
          query: '',
          totals: { posts: 0, users: 0, groups: 0, hashtags: 0 },
          filters
        });
      }
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filters]);

  // Carregar pesquisas recentes do localStorage
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('empowerup_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar pesquisas recentes:', error);
    }
  };

  // Salvar pesquisa recente
  const saveRecentSearch = (searchQuery) => {
    try {
      const updated = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 10); // Manter apenas 10 recentes
      
      setRecentSearches(updated);
      localStorage.setItem('empowerup_recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao salvar pesquisa recente:', error);
    }
  };

  // Carregar trending topics
  const loadTrending = async () => {
    try {
      const endpoint = config.getApiUrl('explore/trending');
      const token = getStoredToken();
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, { headers });
      if (response.ok) {
        const data = await response.json();
        const trendingData = Array.isArray(data.trending)
          ? data.trending
          : Array.isArray(data.trending?.hashtags)
            ? data.trending.hashtags
            : [];
        setTrending(trendingData);
      }
    } catch (error) {
      console.error('Erro ao carregar trending:', error);
    }
  };

  // Realizar pesquisa
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        tab: activeTab,
        ...filters
      });

      const endpoint = config.getApiUrl('explore/search');
      const token = getStoredToken();
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${endpoint}?${params}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const payload = data.results || { posts: [], users: [], groups: [], hashtags: [] };
        setResults(payload);
        saveRecentSearch(searchQuery);
        if (onResultsUpdate) {
          const totals = data.meta?.totals || {
            posts: payload.posts?.length || 0,
            users: payload.users?.length || 0,
            groups: payload.groups?.length || 0,
            hashtags: payload.hashtags?.length || 0
          };
          onResultsUpdate(payload, {
            query: searchQuery,
            totals,
            filters,
            meta: data.meta || null
          });
        }
      } else {
        console.error('Erro na pesquisa:', response.status);
        if (onResultsUpdate) {
          onResultsUpdate(null, {
            query: searchQuery,
            totals: { posts: 0, users: 0, groups: 0, hashtags: 0 },
            filters
          });
        }
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      if (onResultsUpdate) {
        onResultsUpdate(null, {
          query: searchQuery,
          totals: { posts: 0, users: 0, groups: 0, hashtags: 0 },
          filters
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Remover pesquisa recente
  const removeRecentSearch = (searchQuery) => {
    const updated = recentSearches.filter(s => s !== searchQuery);
    setRecentSearches(updated);
    localStorage.setItem('empowerup_recent_searches', JSON.stringify(updated));
  };

  // Limpar todas as pesquisas recentes
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('empowerup_recent_searches');
  };

  // Selecionar resultado
  const selectResult = (result, type) => {
    if (onResultSelect) {
      onResultSelect(result, type);
    }
    setShowResults(false);
    setQuery('');
  };

  // Pesquisar por hashtag ou usuário
  const searchByTag = (tag) => {
    setQuery(tag);
    setActiveTab('all');
  };

  // Tabs de pesquisa
  const tabs = [
    { id: 'all', label: 'Tudo', icon: Search },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'users', label: 'Pessoas', icon: Users },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'hashtags', label: 'Hashtags', icon: Hash }
  ];

  // Contar total de resultados
  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Barra de pesquisa */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar posts, pessoas, grupos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(query.length >= 2 || recentSearches.length > 0)}
            className="pl-10 pr-20 py-2 text-base"
          />
          
          {/* Botões de ação */}
          <div className="absolute right-2 top-2 flex items-center space-x-1">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowResults(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 hover:bg-gray-100 rounded-full ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-20 shadow-lg">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Período</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Qualquer período</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mês</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de mídia</label>
                  <select
                    value={filters.mediaType}
                    onChange={(e) => setFilters({...filters, mediaType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="images">Apenas imagens</option>
                    <option value="videos">Apenas vídeos</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Todas as categorias</option>
                    <option value="Artesanato">Artesanato</option>
                    <option value="Negócios">Negócios</option>
                    <option value="Culinária">Culinária</option>
                    <option value="Moda">Moda</option>
                    <option value="Tecnologia">Tecnologia</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resultados da pesquisa */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-10 shadow-lg max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {query.length >= 2 ? (
              <div>
                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const count = tab.id === 'all' ? totalResults : results[tab.id]?.length || 0;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {count > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {count}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Resultados */}
                <div className="max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-500">Pesquisando...</span>
                    </div>
                  ) : totalResults === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum resultado encontrado para "{query}"</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {/* Posts */}
                      {(activeTab === 'all' || activeTab === 'posts') && results.posts?.map((post) => (
                        <div
                          key={`post-${post.id}`}
                          onClick={() => selectResult(post, 'post')}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={post.user_foto} />
                              <AvatarFallback>{post.user_nome?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{post.user_nome}</span>
                                <span className="text-gray-500 text-xs">@{post.username}</span>
                                <span className="text-gray-400 text-xs">·</span>
                                <span className="text-gray-400 text-xs">{post.tempo_relativo}</span>
                              </div>
                              <p className="text-sm text-gray-900 mt-1 line-clamp-2">{post.conteudo}</p>
                              {post.categoria && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {post.categoria}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Usuários */}
                      {(activeTab === 'all' || activeTab === 'users') && results.users?.map((user) => (
                        <div
                          key={`user-${user.id}`}
                          onClick={() => selectResult(user, 'user')}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.foto_perfil} />
                              <AvatarFallback>{user.nome?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{user.nome}</div>
                              <div className="text-gray-500 text-xs">@{user.username}</div>
                              {user.bio && (
                                <p className="text-gray-600 text-xs mt-1 line-clamp-1">{user.bio}</p>
                              )}
                            </div>
                            <Users className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}

                      {/* Hashtags */}
                      {(activeTab === 'all' || activeTab === 'hashtags') && results.hashtags?.map((hashtag) => (
                        <div
                          key={`hashtag-${hashtag.tag}`}
                          onClick={() => searchByTag(hashtag.tag)}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Hash className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">#{hashtag.tag}</div>
                                <div className="text-gray-500 text-xs">{hashtag.count} posts</div>
                              </div>
                            </div>
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Pesquisas recentes e trending quando não há query */
              <div className="max-h-64 overflow-y-auto">
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm text-gray-900">Pesquisas recentes</h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Limpar tudo
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <div key={index} className="flex items-center justify-between group">
                          <button
                            onClick={() => setQuery(search)}
                            className="flex items-center space-x-3 text-left flex-1 hover:bg-gray-50 rounded p-2"
                          >
                            <Search className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{search}</span>
                          </button>
                          <button
                            onClick={() => removeRecentSearch(search)}
                            className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trending.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 mb-3">Trending para você</h3>
                    <div className="space-y-2">
                      {trending.slice(0, 5).map((trend, index) => (
                        <button
                          key={index}
                          onClick={() => searchByTag(trend.tag)}
                          className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded p-2"
                        >
                          <div>
                            <div className="text-sm font-medium">#{trend.tag}</div>
                            <div className="text-xs text-gray-500">{trend.count} posts</div>
                          </div>
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchComponent;
