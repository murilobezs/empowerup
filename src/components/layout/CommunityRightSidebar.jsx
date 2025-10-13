import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Hash, Calendar, MapPin, Users, ChevronRight } from "lucide-react";
import SearchComponent from "../SearchComponent";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";

export default function CommunityRightSidebar({
  trending = [],
  events = [],
  groups = [],
  className,
  showSearch = true
}) {
  const topTrending = useMemo(() => trending.slice(0, 5), [trending]);
  const upcomingEvents = useMemo(() => events.slice(0, 3), [events]);
  const activeGroups = useMemo(() => groups.slice(0, 4), [groups]);

  return (
    <aside className={cn("hidden lg:block lg:col-span-3 space-y-4 lg:space-y-6", className)}>
      {showSearch && <SearchComponent />}

      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center font-bold">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-coral" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 sm:space-y-3">
            {topTrending.length > 0 ? (
              topTrending.map((trend, index) => (
                <div
                  key={trend.id ?? index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Hash className="h-3 w-3 sm:h-5 sm:w-5 text-coral" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs sm:text-sm truncate">#{trend.tag ?? trend.nome ?? "tendencia"}</div>
                      {trend.count && (
                        <div className="text-xs text-gray-500">{trend.count} posts</div>
                      )}
                    </div>
                  </div>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                <Hash className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">Nenhuma hashtag em alta ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center font-bold">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-coral" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border-l-4 border-coral pl-3 hover:bg-gray-50 rounded-r-lg transition-colors">
                <h4 className="font-semibold text-xs sm:text-sm">{event.titulo ?? event.nome}</h4>
                {event.data_evento && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(event.data_evento).toLocaleDateString("pt-BR")}
                  </div>
                )}
                {event.localizacao && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{event.localizacao}</span>
                  </div>
                )}
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
                Nenhum evento programado
              </p>
            )}
          </div>
          <div className="mt-3 text-right">
            <Link to="/eventos" className="text-xs font-semibold text-coral hover:underline">
              Abrir agenda completa
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center font-bold">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-olive" />
            Grupos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 sm:space-y-3">
            {activeGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-olive/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-3 w-3 sm:h-5 sm:w-5 text-olive" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs sm:text-sm truncate">{group.nome}</div>
                  <div className="text-xs text-gray-500">
                    {group.membros_count || 0} membros
                  </div>
                </div>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
              </div>
            ))}
            {activeGroups.length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
                Nenhum grupo ativo
              </p>
            )}
          </div>
          <div className="mt-3 text-right">
            <Link to="/grupos" className="text-xs font-semibold text-olive hover:underline">
              Ver todos os grupos
            </Link>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
