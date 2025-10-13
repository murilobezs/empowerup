import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessagesContext';
import { ROUTES } from '../../constants';
import { cn } from '../../lib/utils';

const useSafeMessages = () => {
  try {
    return useMessages();
  } catch (error) {
    if (import.meta?.env?.DEV) {
      console.warn('MobileBottomNav: MessagesProvider ausente.', error);
    }
    return { unreadTotal: 0 };
  }
};

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadTotal = 0 } = useSafeMessages();

  const navItems = useMemo(() => ([
    {
      key: 'home',
      label: 'Início',
      href: ROUTES.FEED,
      icon: Home,
    },
    {
      key: 'explore',
      label: 'Explorar',
      href: ROUTES.EXPLORE,
      icon: Search,
    },
    {
      key: 'create',
      label: 'Criar',
      icon: Plus,
      isCreate: true,
    },
    {
      key: 'marketplace',
      label: 'Marketplace',
      href: 'https://marketplace.empowerup.com.br',
      icon: ShoppingBag,
      external: true,
    },
    {
      key: 'messages',
      label: 'Mensagens',
      href: ROUTES.MENSAGENS,
      icon: MessageCircle,
      badge: unreadTotal,
    },
  ]), [unreadTotal]);

  if (!user) {
    return null;
  }

  const hiddenRoutes = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.ADMIN,
    ROUTES.ADMIN_LOGIN,
  ];

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  if (shouldHide) {
    return null;
  }

  const isActive = (href) => {
    if (!href) return false;
    if (href === ROUTES.FEED) {
      return location.pathname === ROUTES.FEED || location.pathname === '/feed';
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleCreateClick = (event) => {
    event.preventDefault();
    const isInFeed = location.pathname === ROUTES.FEED || location.pathname === '/feed';

    if (isInFeed) {
      window.dispatchEvent(new CustomEvent('openCreatePost'));
      return;
    }

    navigate(`${ROUTES.FEED}?compose=1`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-lg md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isCreate) {
            return (
              <button
                key={item.key}
                onClick={handleCreateClick}
                className="flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl p-2 text-xs font-medium text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
                aria-label="Criar novo post"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral shadow-md shadow-coral/30 transition-transform active:scale-95">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-gray-700">{item.label}</span>
              </button>
            );
          }

          if (item.external) {
            return (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl p-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    'text-gray-500'
                  )}
                />
                <span className="text-xs text-gray-500 transition-colors">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.href}
              className="relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl p-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
            >
              <Icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  active ? 'text-coral' : 'text-gray-500'
                )}
              />
              {item.badge > 0 && (
                <span className="absolute -top-1 right-2 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              <span
                className={cn(
                  'text-xs transition-colors',
                  active ? 'text-coral' : 'text-gray-500'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
