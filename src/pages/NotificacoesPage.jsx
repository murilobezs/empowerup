import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/site-header';
import CommunityLeftSidebar from '../components/layout/CommunityLeftSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import config from '../config/config';
import { formatTimeAgo } from '../utils';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Bookmark,
  Users,
  Sparkles,
  BookOpen,
  Megaphone,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  normalizeNotificationType,
  getNotificationActorName,
  getNotificationMessage,
  getNotificationSubtitle,
  getNotificationTargetUrl,
} from '../utils/notificationUtils';

const ICON_RENDERERS = {
  like: (className = 'h-5 w-5 text-red-500') => <Heart className={className} />,
  comment: (className = 'h-5 w-5 text-blue-500') => <MessageCircle className={className} />,
  follow: (className = 'h-5 w-5 text-green-500') => <UserPlus className={className} />,
  save: (className = 'h-5 w-5 text-purple-500') => <Bookmark className={className} />,
  message: (className = 'h-5 w-5 text-blue-500') => <MessageCircle className={className} />,
  group: (className = 'h-5 w-5 text-emerald-500') => <Users className={className} />,
  course: (className = 'h-5 w-5 text-amber-500') => <BookOpen className={className} />,
  system: (className = 'h-5 w-5 text-coral') => <Sparkles className={className} />,
  campaign: (className = 'h-5 w-5 text-orange-500') => <Megaphone className={className} />,
  default: (className = 'h-5 w-5 text-gray-500') => <Bell className={className} />,
};

const getNotificationIcon = (notification) => {
  const key = normalizeNotificationType(notification);
  const renderer = ICON_RENDERERS[key] || ICON_RENDERERS.default;
  return renderer();
};

export default function NotificacoesPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    lastUpdatedAt,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    // Carregar notificações quando a página for aberta
    refresh();
  }, [refresh]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const targetUrl = getNotificationTargetUrl(notification);
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refresh();
  };

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-gray-500">Você precisa estar logado para ver suas notificações.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar esquerda */}
          <CommunityLeftSidebar active="notificacoes" className="lg:col-span-3" />

          {/* Conteúdo principal */}
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Notificações</CardTitle>
                    {lastUpdatedAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Última atualização: {formatTimeAgo(lastUpdatedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Marcar todas como lidas
                      </Button>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="destructive">
                      {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <div className="px-6 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
                    {error}
                  </div>
                )}
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
                    <span className="ml-3 text-gray-600">Carregando notificações...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => {
                      const actorName = getNotificationActorName(notification);
                      const subtitle = getNotificationSubtitle(notification);
                      const actorUsername = notification.from_user?.username;

                      return (
                        <button
                          type="button"
                          key={notification.id}
                          className={`w-full text-left p-6 transition-colors hover:bg-gray-50 ${
                            !notification.is_read ? 'bg-blue-50' : 'bg-white'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-4">
                            {actorUsername ? (
                              <Link 
                                to={`/perfil/${actorUsername}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0"
                              >
                                <Avatar className="w-12 h-12 hover:opacity-80 transition-opacity">
                                  <AvatarImage
                                    src={notification.from_user?.avatar_url ?
                                      config.getPublicUrl(notification.from_user.avatar_url) : ''
                                    }
                                  />
                                  <AvatarFallback className="bg-coral text-white">
                                    {actorName ? actorName.charAt(0).toUpperCase() : 'N'}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            ) : (
                              <Avatar className="w-12 h-12">
                                <AvatarImage
                                  src={notification.from_user?.avatar_url ?
                                    config.getPublicUrl(notification.from_user.avatar_url) : ''
                                  }
                                />
                                <AvatarFallback className="bg-coral text-white">
                                  {actorName ? actorName.charAt(0).toUpperCase() : 'N'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                  {getNotificationIcon(notification)}
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-base mt-2 text-gray-900">
                                {actorName && actorUsername ? (
                                  <>
                                    <Link 
                                      to={`/perfil/${actorUsername}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-medium hover:underline"
                                    >
                                      {actorName}
                                    </Link>{' '}
                                    {getNotificationMessage(notification)}
                                  </>
                                ) : actorName ? (
                                  <>
                                    <span className="font-medium">{actorName}</span>{' '}
                                    {getNotificationMessage(notification)}
                                  </>
                                ) : (
                                  getNotificationMessage(notification)
                                )}
                              </p>
                              {subtitle && (
                                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma notificação
                    </h3>
                    <p className="text-gray-500">
                      Suas notificações aparecerão aqui quando você receber curtidas, comentários e outras interações.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}