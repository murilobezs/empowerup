import React, { useState, useEffect } from 'react';
import config from '../config/config';

const TrendingPage = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/trending/`);
        if (response.ok) {
          const data = await response.json();
          setTrending(data);
        }
      } catch (error) {
        console.error('Erro ao carregar trending:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Trending</h1>
      
      {trending.trending && trending.trending.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Hashtags em alta</h2>
          <div className="space-y-3">
            {trending.trending.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-semibold">#{trend.tag}</div>
                  <div className="text-sm text-gray-500">{trend.count} posts</div>
                </div>
                <div className="text-sm text-gray-400">
                  {trend.engagement} interações
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {trending.stats && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{trending.stats.total_posts}</div>
              <div className="text-sm text-gray-500">Posts hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{trending.stats.active_users}</div>
              <div className="text-sm text-gray-500">Usuários ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{trending.stats.total_likes}</div>
              <div className="text-sm text-gray-500">Total de likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{trending.stats.total_comments}</div>
              <div className="text-sm text-gray-500">Comentários</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingPage;
