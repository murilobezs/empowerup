import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import config from '@shared/config/config';

const buildUrl = (base, path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedBase = (base || '').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const redirectMap = {
  comunidade: '/comunidade',
  explorar: '/explorar',
  grupos: '/grupos',
  eventos: '/eventos',
  planos: '/planos',
  campanhas: '/campanhas',
  cursos: '/cursos',
  notificacoes: '/notificacoes',
  mensagens: '/mensagens',
  'posts-salvos': '/posts-salvos',
  configuracoes: '/configuracoes',
  perfil: '/perfil',
  login: '/login',
  cadastro: '/cadastro',
  ajuda: '/ajuda',
  sobre: '/sobre',
  contato: '/contato',
  termos: '/termos',
  privacidade: '/privacidade',
  cookies: '/cookies',
};

const ExternalRedirect = () => {
  const navigate = useNavigate();
  const params = useParams();
  const target = params.target;
  const remainder = params['*'];
  const baseUrl = config.BASE_URL || 'https://www.empowerup.com.br';

  useEffect(() => {
    if (!target) {
      navigate('/', { replace: true });
      return;
    }

    const matched = redirectMap[target];

    if (!matched) {
      navigate('/', { replace: true });
      return;
    }

    const suffix = remainder ? `/${remainder.replace(/^\//, '')}` : '';
    const destination = buildUrl(baseUrl, `${matched}${suffix}`);
    window.location.href = destination;
  }, [target, navigate, baseUrl]);

  return null;
};

export default ExternalRedirect;
