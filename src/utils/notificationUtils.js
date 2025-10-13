const TYPE_ALIASES = {
  like: 'like',
  curtida: 'like',
  curtidas: 'like',
  comment: 'comment',
  comentario: 'comment',
  comentarios: 'comment',
  reply: 'comment',
  follow: 'follow',
  seguidor: 'follow',
  seguidores: 'follow',
  save: 'save',
  favorito: 'save',
  favoritos: 'save',
  bookmark: 'save',
  message: 'message',
  mensagem: 'message',
  mensagens: 'message',
  direct: 'message',
  dm: 'message',
  group: 'group',
  grupos: 'group',
  comunidade: 'group',
  course: 'course',
  curso: 'course',
  cursos: 'course',
  lesson: 'course',
  system: 'system',
  sistema: 'system',
  announcement: 'system',
  campaign: 'campaign',
  campanha: 'campaign',
  ads: 'campaign',
  advertisement: 'campaign',
};

export const normalizeNotificationType = (notification) => {
  const rawType = (notification?.category || notification?.type || '').toString().toLowerCase();
  return TYPE_ALIASES[rawType] || 'default';
};

export const getNotificationActorName = (notification) => {
  return (
    notification?.from_user?.nome ||
    notification?.from_user?.name ||
    notification?.metadata?.actor_name ||
    notification?.actor_name ||
    null
  );
};

export const getNotificationMessage = (notification) => {
  const normalized = normalizeNotificationType(notification);
  const explicit = (notification?.message || notification?.title || '').trim();
  const fallback = explicit || 'Nova notificação';

  switch (normalized) {
    case 'like':
      return explicit || 'curtiu seu post';
    case 'comment':
      return explicit || 'comentou em seu post';
    case 'follow':
      return explicit || 'começou a seguir você';
    case 'save':
      return explicit || 'salvou seu post';
    case 'message':
      return explicit || 'enviou uma nova mensagem';
    case 'group':
      return notification?.message || 'Atualização em um dos seus grupos';
    case 'course':
      return notification?.message || 'Novo curso disponível para você';
    case 'system':
      return notification?.message || 'Atualização do sistema';
    case 'campaign':
      return notification?.message || 'Atualização na sua campanha';
    default:
      return fallback;
  }
};

export const getNotificationSubtitle = (notification) => {
  if (notification?.metadata?.subtitle) {
    return notification.metadata.subtitle;
  }

  if (notification?.post?.conteudo) {
    return `"${notification.post.conteudo}"`;
  }

  if (notification?.metadata?.context) {
    return notification.metadata.context;
  }

  return null;
};

export const getNotificationTargetUrl = (notification) => {
  return (
    notification?.metadata?.redirect_url ||
    notification?.metadata?.url ||
    notification?.url ||
    null
  );
};
