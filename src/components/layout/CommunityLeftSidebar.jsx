import { Link } from "react-router-dom";
import { Home, Users, TrendingUp, Bell, Mail, Bookmark, User, BookOpen, Crown, Rocket, Calendar, ShoppingBag, UserCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useNotifications } from "../../contexts/NotificationsContext";
import { useMessages } from "../../contexts/MessagesContext";
import config from "../../config/config";

const coursesUrl = config.getCoursesUrl();

const NAV_ITEMS = [
  { to: "/", label: "Início", icon: Home, key: "inicio" },
  { to: "/comunidade", label: "Comunidade", icon: Users, key: "comunidade" },
  { to: "/grupos", label: "Grupos", icon: UserCircle2, key: "grupos" },
  { to: "/eventos", label: "Eventos", icon: Calendar, key: "eventos" },
  { to: "/marketplace", label: "Marketplace", icon: ShoppingBag, key: "marketplace" },
  { to: "/explorar", label: "Explorar", icon: TrendingUp, key: "explore" },
  { to: coursesUrl, label: "Cursos", icon: BookOpen, key: "cursos", external: true },
  { to: "/planos", label: "Planos", icon: Crown, key: "planos" },
  { to: "/campanhas", label: "Campanhas", icon: Rocket, key: "campanhas" },
  { to: "/notificacoes", label: "Notificações", icon: Bell, key: "notificacoes" },
  { to: "/mensagens", label: "Mensagens", icon: Mail, key: "mensagens" },
  { to: "/posts-salvos", label: "Salvos", icon: Bookmark, key: "salvos" },
  { to: "/perfil", label: "Perfil", icon: User, key: "perfil" }
];

export default function CommunityLeftSidebar({ active = "comunidade", className }) {
  const { unreadCount } = useNotifications();
  const { unreadTotal, conversationsWithNew } = useMessages();

  return (
    <aside className={cn("hidden lg:block lg:col-span-3 sticky top-20 self-start", className)}>
      <nav 
        aria-label="Navegação principal" 
        className="space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-olive"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(135, 151, 118) rgb(243, 244, 246)'
        }}
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, key, external }) => {
            const isActive = key === active;
            const linkProps = external
              ? {
                  as: "a",
                  href: to,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }
              : { to };
            
            const LinkComponent = external ? "a" : Link;
            
            return (
              <li key={key}>
                <LinkComponent
                  {...linkProps}
                  className={cn(
                    "flex items-center justify-between gap-3 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral transition-all duration-200 font-medium",
                    isActive
                      ? "bg-coral text-white shadow-md"
                      : "hover:bg-gray-100 text-gray-700 hover:text-coral"
                  )}
                  aria-current={isActive ? "true" : "false"}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{label}</span>
                  </span>
                  {key === "notificacoes" && unreadCount > 0 && (
                    <span className="min-w-[1.5rem] px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {key === "mensagens" && unreadTotal > 0 && (
                    <span className="min-w-[1.5rem] px-2 py-0.5 text-xs font-bold text-white bg-blue-500 rounded-full text-center">
                      {conversationsWithNew > 99 ? '99+' : conversationsWithNew || unreadTotal}
                    </span>
                  )}
                </LinkComponent>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
