import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import config from '../config/config';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import { formatTimeAgo } from '../utils';
import {
  normalizeNotificationType,
  getNotificationActorName,
  getNotificationMessage,
  getNotificationSubtitle,
  getNotificationTargetUrl,
} from '../utils/notificationUtils';

const formatLastUpdated = (isoString) => {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return null;
    return formatTimeAgo(isoString);
  } catch (error) {
    return null;
  }
};

const ICON_RENDERERS = {
  like: (className = 'h-4 w-4 text-red-500') => <Heart className={className} />,
  comment: (className = 'h-4 w-4 text-blue-500') => <MessageCircle className={className} />,
  follow: (className = 'h-4 w-4 text-green-500') => <UserPlus className={className} />,
  save: (className = 'h-4 w-4 text-purple-500') => <Bookmark className={className} />,
  message: (className = 'h-4 w-4 text-blue-500') => <MessageCircle className={className} />,
  group: (className = 'h-4 w-4 text-emerald-500') => <Users className={className} />,
  course: (className = 'h-4 w-4 text-amber-500') => <BookOpen className={className} />,
  system: (className = 'h-4 w-4 text-coral') => <Sparkles className={className} />,
  campaign: (className = 'h-4 w-4 text-orange-500') => <Megaphone className={className} />,
  default: (className = 'h-4 w-4 text-gray-500') => <Bell className={className} />,
};

const getNotificationIcon = (notification) => {
  const key = normalizeNotificationType(notification);
  const renderer = ICON_RENDERERS[key] || ICON_RENDERERS.default;
  return renderer();
};

const NotificationCenter = () => {
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      await refresh();
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (isOpen) {
      handleRefresh();
    }
  }, [isOpen, handleRefresh]);

  if (!user) {
    return null;
  }

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
    if (isMarkingAll || unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const showEmptyState = notifications.length === 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 rounded-full px-1 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label="Atualizar notificações"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                    <path
                      d="M21 12a9 9 0 10-3.51 7.11"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12v7h-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAll}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {isMarkingAll ? 'Carregando...' : 'Marcar todas como lidas'}
                  </Button>
                )}
              </div>
            </div>
            {lastUpdatedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Atualizado {formatLastUpdated(lastUpdatedAt)}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {error && (
                <div className="px-4 py-2 text-xs text-red-600 bg-red-50/80 border-b border-red-100">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral"></div>
                </div>
              ) : !showEmptyState ? (
                notifications.map((notification) => {
                  const actorName = getNotificationActorName(notification);
                  const subtitle = getNotificationSubtitle(notification);

                  const actorUsername = notification.from_user?.username;
                  
                  return (
                    <button
                      type="button"
                      key={notification.id}
                      className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${
                        notification.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {actorUsername ? (
                          <Link 
                            to={`/perfil/${actorUsername}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0"
                          >
                            <Avatar className="w-10 h-10 hover:opacity-80 transition-opacity">
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
                          <Avatar className="w-10 h-10">
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
                            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              {getNotificationIcon(notification)}
                              {!notification.is_read && <span className="text-blue-500">•</span>}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-sm mt-1 text-gray-700">
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
                            <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhuma notificação ainda</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/notificacoes'}
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              )}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-center text-coral hover:text-coral"
                    onClick={() => window.location.href = '/notificacoes'}
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
