import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchComponent from '../components/SearchComponent';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Sparkles,
  Compass,
  Filter,
  TrendingUp,
  Users,
  Hash,
  MessageCircle,
  Heart,
  Loader2,
  ArrowUpRight,
  Flame,
  Globe
} from 'lucide-react';
import apiService from '../services/apiService';
import { formatTimeAgo, utils } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import config from '../config/config';

const defaultTotals = { posts: 0, users: 0, groups: 0, hashtags: 0 };

export function ExploreHeader({ user, logout }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo-sem-fundo.png" alt="EmpowerUp" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Compass className="w-6 h-6 text-coral" />
            Explorar
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
                logout();
                navigate('/');
              }}
              className="cursor-pointer text-red-600"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

const ExplorePage = () => {
  const { user, logout } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [exploreData, setExploreData] = useState({
    trendingPosts: [],
    recommendedUsers: [],
    trendingHashtags: [],
    trendingCategories: [],
    freshVoices: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchMeta, setSearchMeta] = useState({ query: '', totals: defaultTotals });
  const [loadingHashtag, setLoadingHashtag] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchExploreData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getExploreOverview();
        if (response.success && isMounted) {
          setExploreData({
            trendingPosts: response.trendingPosts || [],
            recommendedUsers: response.recommendedUsers || [],
            trendingHashtags: response.trendingHashtags || [],
            trendingCategories: response.trendingCategories || [],
            freshVoices: response.freshVoices || []
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao carregar explorar:', err);
          setError('Não foi possível carregar os destaques agora. Tente novamente em instantes.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExploreData();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryFilters = useMemo(() => {
    const categories = exploreData.trendingCategories || [];
    return [
      { label: 'Tudo', value: 'all', count: exploreData.trendingPosts?.length || 0 },
      ...categories.map((cat) => ({
        label: cat.label,
        value: cat.label,
        slug: cat.value,
        count: cat.count
      }))
    ];
  }, [exploreData.trendingCategories, exploreData.trendingPosts]);

  const normalizeCategory = (value) => utils.removeAccents((value || '').toLowerCase());

  const filteredPosts = useMemo(() => {
    const posts = exploreData.trendingPosts || [];
    if (selectedFilter === 'all') {
      return posts;
    }
    const targetSlug = normalizeCategory(selectedFilter);
    return posts.filter((post) => normalizeCategory(post.categoria) === targetSlug);
  }, [exploreData.trendingPosts, selectedFilter]);

  const handleResultsUpdate = (results, meta) => {
    if (!results) {
      setSearchResults(null);
      setSearchMeta({ query: meta?.query || '', totals: meta?.totals || defaultTotals, filters: meta?.filters });
      return;
    }
    setSearchResults(results);
    setSearchMeta({ query: meta?.query || '', totals: meta?.totals || defaultTotals, filters: meta?.filters });
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchMeta({ query: '', totals: defaultTotals });
  };

  const hasActiveSearch = Boolean(searchResults && searchMeta.query && searchMeta.query.length >= 2);

  const handleTrendingHashtag = async (tag) => {
    try {
      setLoadingHashtag(tag);
      setSelectedFilter('all');
      const response = await apiService.searchExplore({ q: `#${tag}` });
      if (response.success) {
        setSearchResults(response.results || null);
        setSearchMeta({
          query: `#${tag}`,
          totals: response.meta?.totals || defaultTotals,
          filters: response.meta?.filters
        });
      }
    } catch (error) {
      console.error('Erro ao carregar hashtag', error);
    } finally {
      setLoadingHashtag(null);
    }
  };

  const renderSectionTitle = (icon, title, description) => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 uppercase tracking-wide">
          {icon}
          <span>{title}</span>
        </div>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral/5 to-olive/5 text-gray-800 overflow-x-hidden">
      <ExploreHeader user={user} logout={logout} />
      
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr),minmax(0,1fr)]">
          <div className="space-y-6">
          <section className="rounded-3xl bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50 p-6 sm:p-8 border border-slate-100 overflow-hidden relative">
            <div className="absolute -top-10 -right-12 h-36 w-36 rounded-full bg-sky-200/40 blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-indigo-200/40 blur-2xl" aria-hidden="true" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-700 uppercase tracking-wide">
                    <Sparkles className="h-4 w-4" />
                    Descubra novas histórias
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                    Explore a comunidade EmpowerUp
                  </h1>
                  <p className="text-slate-600 mt-3 max-w-2xl">
                    Encontre posts inspiradores, perfis para seguir e tendências que estão movimentando o empreendedorismo feminino.
                  </p>
                </div>
              </div>

              <SearchComponent
                className="bg-white/70 backdrop-blur"
                onResultSelect={() => {}}
                onResultsUpdate={handleResultsUpdate}
              />

              {hasActiveSearch ? (
                <div className="flex items-center justify-between bg-white/80 backdrop-blur rounded-2xl border border-white/60 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Resultados para “{searchMeta.query}”</p>
                    <p className="text-xs text-slate-500">
                      {searchMeta.totals.posts} posts · {searchMeta.totals.users} perfis · {searchMeta.totals.hashtags} hashtags
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                    Limpar busca
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-slate-600">
                  <Badge variant="secondary" className="bg-white/80 text-slate-700">
                    <Compass className="h-3.5 w-3.5 mr-1" /> Explore para se inspirar
                  </Badge>
                  <Badge variant="secondary" className="bg-white/80 text-slate-700">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" /> Veja o que está bombando
                  </Badge>
                </div>
              )}
            </div>
          </section>

          {hasActiveSearch ? (
            <SearchResultsCard
              results={searchResults}
              meta={searchMeta}
              onClear={handleClearSearch}
            />
          ) : (
            <section className="space-y-5">
              {renderSectionTitle(
                <Flame className="h-4 w-4 text-orange-500" />, 
                'Tendências do momento',
                'Filtre por categoria e acompanhe os posts que estão gerando conversas agora.'
              )}

              <div className="flex flex-wrap gap-2">
                {categoryFilters.map((filter) => (
                  <Button
                    key={filter.label}
                    variant={selectedFilter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.value)}
                    aria-pressed={selectedFilter === filter.value}
                    className={`rounded-full px-3 py-1.5 text-xs sm:text-sm transition ${selectedFilter === filter.value ? 'bg-sky-600 hover:bg-sky-600 text-white shadow-sm' : 'border-slate-200 hover:border-sky-300 hover:text-sky-600'}`}
                  >
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    {filter.label}
                    {typeof filter.count === 'number' && filter.count > 0 && (
                      <span className="ml-1 text-[11px] font-medium text-slate-500">{filter.count}</span>
                    )}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {loading ? (
                  <TrendingPostsSkeleton />
                ) : error ? (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="p-6 text-center text-sm text-red-600">
                      {error}
                    </CardContent>
                  </Card>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <TrendingPostCard key={post.id} post={post} />
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-10 text-center text-slate-500">
                      <Compass className="h-8 w-8 mx-auto mb-3 opacity-60" />
                      <p className="font-semibold mb-1">Nada por aqui ainda</p>
                      <p className="text-sm">Experimente outra categoria ou faça uma busca personalizada.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-sky-500" />
                Hashtags em alta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <HashtagSkeleton />
              ) : exploreData.trendingHashtags?.length > 0 ? (
                exploreData.trendingHashtags.slice(0, 8).map((trend, index) => (
                  <button
                    key={`${trend.tag}-${index}`}
                    onClick={() => handleTrendingHashtag(trend.tag)}
                    disabled={loadingHashtag === trend.tag}
                    className="w-full text-left rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/60 transition p-3 flex items-center justify-between disabled:opacity-60"
                  >
                    <div>
                      <p className="font-medium text-slate-800">#{trend.tag}</p>
                      <p className="text-xs text-slate-500">{trend.count} posts</p>
                    </div>
                    {loadingHashtag === trend.tag ? (
                      <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
                    ) : (
                      <Hash className="h-4 w-4 text-sky-400" />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">Ainda não há tendências suficientes para mostrar.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-emerald-500" />
                Sugestões de perfis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <RecommendedSkeleton />
              ) : exploreData.recommendedUsers?.length > 0 ? (
                exploreData.recommendedUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} alt={user.nome} />
                      <AvatarFallback>{user.nome?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">{user.nome}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">{user.followers ?? 0} seguidoras</Badge>
                        {user.posts_count > 0 && (
                          <span>{user.posts_count} posts</span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={user.username ? `/perfil/${user.username}` : `/perfil/${user.id}`}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      Ver perfil
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Siga novos perfis para personalizar sua timeline.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-indigo-500" />
                Novas vozes na comunidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <RecommendedSkeleton items={3} />
              ) : exploreData.freshVoices?.length > 0 ? (
                exploreData.freshVoices.slice(0, 4).map((user) => (
                  <div key={`fresh-${user.id}`} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url} alt={user.nome} />
                        <AvatarFallback>{user.nome?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{user.nome}</p>
                        <p className="text-xs text-slate-500">Ingressou {formatTimeAgo(user.created_at)}</p>
                      </div>
                    </div>
                    {user.bio && (
                      <p className="text-xs text-slate-500 mt-3 line-clamp-2">{user.bio}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Novas empreendedoras surgirão aqui em breve!</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
      </div>
    </div>
  );
};

const TrendingPostCard = ({ post }) => {
  const metrics = [
    { icon: Heart, label: 'Curtidas', value: post.likes || 0 },
    { icon: MessageCircle, label: 'Comentários', value: post.comentarios || 0 }
  ];

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.avatar} alt={post.autor} />
            <AvatarFallback>{post.autor?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{post.autor}</span>
              <span>@{post.username}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
            {post.categoria && (
              <Badge variant="secondary" className="mt-2 bg-sky-50 text-sky-700">
                {post.categoria}
              </Badge>
            )}
            <p className="text-sm text-slate-800 mt-2 leading-6 line-clamp-3">
              {post.conteudo}
            </p>
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            {metrics.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-1">
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{value}</span>
                <span className="hidden sm:inline">{label.toLowerCase()}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700">
            Ver conversa
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SearchResultsCard = ({ results, meta, onClear }) => {
  const sections = [
    { key: 'posts', title: 'Posts', icon: MessageCircle, empty: 'Nenhum post encontrado.' },
    { key: 'users', title: 'Perfis', icon: Users, empty: 'Nenhum perfil encontrado.' },
    { key: 'groups', title: 'Grupos', icon: Globe, empty: 'Nada por aqui ainda.' },
    { key: 'hashtags', title: 'Hashtags', icon: Hash, empty: 'Nenhuma hashtag para exibir.' }
  ];

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-2 bg-sky-50 text-sky-700">
              Resultado da busca
            </Badge>
            <CardTitle className="text-xl text-slate-900">
              “{meta.query}”
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {meta.totals?.posts ?? 0} posts · {meta.totals?.users ?? 0} perfis · {meta.totals?.hashtags ?? 0} hashtags
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClear}>
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map(({ key, title, icon: Icon, empty }) => {
          const items = results?.[key] || [];
          if (!items.length) {
            return null;
          }
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => {
                  if (key === 'posts') {
                    return <PostResultItem key={`post-${item.id}-${index}`} post={item} />;
                  }
                  if (key === 'users') {
                    return <UserResultItem key={`user-${item.id}-${index}`} user={item} />;
                  }
                  if (key === 'groups') {
                    return <GroupResultItem key={`group-${item.id}-${index}`} group={item} />;
                  }
                  if (key === 'hashtags') {
                    return <HashtagResultItem key={`hash-${item.tag}-${index}`} hashtag={item} />;
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}

        {sections.every(({ key }) => !results?.[key]?.length) && (
          <p className="text-sm text-slate-500 text-center">{sections[0].empty}</p>
        )}
      </CardContent>
    </Card>
  );
};

const PostResultItem = ({ post }) => (
  <div className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 transition">
    <div className="flex items-start gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={post.avatar} alt={post.autor} />
        <AvatarFallback>{post.autor?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{post.autor}</span>
          <span>@{post.username}</span>
          <span>•</span>
          <span>{formatTimeAgo(post.created_at)}</span>
        </div>
        <p className="text-sm text-slate-800 mt-2 line-clamp-2">{post.conteudo}</p>
      </div>
    </div>
  </div>
);

const UserResultItem = ({ user }) => (
  <div className="rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:border-sky-300 transition">
    <Avatar className="h-10 w-10">
      <AvatarImage src={user.avatar_url} alt={user.nome} />
      <AvatarFallback>{user.nome?.charAt(0) || '?'}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-slate-800">{user.nome}</p>
      <p className="text-xs text-slate-500">@{user.username}</p>
      {user.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{user.bio}</p>}
    </div>
    <Link
      to={user.username ? `/perfil/${user.username}` : `/perfil/${user.id}`}
      className="text-xs font-semibold text-sky-600 hover:text-sky-700"
    >
      Ver perfil
    </Link>
  </div>
);

const GroupResultItem = ({ group }) => (
  <div className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 transition">
    <p className="font-semibold text-sm text-slate-800">{group.nome}</p>
    {group.categoria && (
      <Badge variant="outline" className="mt-1 text-xs text-slate-500">
        {group.categoria}
      </Badge>
    )}
    {group.descricao && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{group.descricao}</p>}
    <p className="text-xs text-slate-500 mt-2">{group.membros} membros • Última atividade {formatTimeAgo(group.ultima_atividade)}</p>
  </div>
);

const HashtagResultItem = ({ hashtag }) => (
  <div className="rounded-2xl border border-slate-200 p-3 flex items-center justify-between">
    <div>
      <p className="font-medium text-sm text-slate-800">#{hashtag.tag}</p>
      <p className="text-xs text-slate-500">{hashtag.count} menções</p>
    </div>
    <Hash className="h-4 w-4 text-sky-400" />
  </div>
);

const TrendingPostsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((item) => (
      <Card key={`post-skeleton-${item}`} className="border-slate-100">
        <CardContent className="p-5 space-y-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-3 w-1/3 bg-slate-200 rounded" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const HashtagSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3, 4].map((item) => (
      <div key={`hashtag-skeleton-${item}`} className="h-10 w-full rounded-2xl bg-slate-200" />
    ))}
  </div>
);

const RecommendedSkeleton = ({ items = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: items }).map((_, index) => (
      <div key={`recommended-skeleton-${index}`} className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
          <div className="h-2.5 w-1/3 bg-slate-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default ExplorePage;
