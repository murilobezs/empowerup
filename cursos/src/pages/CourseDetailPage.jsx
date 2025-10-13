import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '@shared/services/api';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, PlayCircle, Video } from 'lucide-react';
import clsx from 'clsx';

const buildEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;

  const youtubeRegex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  return url;
};

const CourseDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restriction, setRestriction] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [savingLesson, setSavingLesson] = useState(0);
  const [openModules, setOpenModules] = useState({});
  const [enrolling, setEnrolling] = useState(false);

  const courseIdentifier = course?.slug || identifier;

  const fetchCourse = useCallback(async () => {
    if (!identifier) return;
    setLoading(true);
    setError('');
    setRestriction(null);

    try {
      const response = await apiService.getCourse(identifier);
      if (response?.success && response.course) {
        const courseData = response.course;
        setCourse(courseData);
        const initialModules = {};
        (courseData.modules || []).forEach((module) => {
          initialModules[module.id] = true;
        });
        setOpenModules(initialModules);

        if (courseData.enrollment) {
          await loadProgress(identifier);
        }
      } else {
        throw new Error(response?.message || 'Curso não encontrado.');
      }
    } catch (err) {
      if (err?.status === 403) {
        setRestriction({
          message: err?.data?.message || 'Seu plano atual não possui acesso aos cursos completos.',
          subscription: err?.data?.subscription || null,
        });
      } else if (err?.status === 404) {
        setError('Curso não encontrado ou indisponível no momento.');
      } else {
        setError(err?.message || 'Não foi possível carregar o curso.');
      }
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  const loadProgress = useCallback(async (id) => {
    try {
      const response = await apiService.getCourseProgress(id || courseIdentifier);
      if (response?.success && response.progress) {
        const map = {};
        (response.progress.lessons || []).forEach((lesson) => {
          map[lesson.lesson_id] = lesson;
        });
        setLessonProgress(map);
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                enrollment: prev.enrollment
                  ? { ...prev.enrollment, progresso: response.progress.progress }
                  : prev.enrollment,
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Erro ao carregar progresso do curso', err);
    }
  }, [courseIdentifier]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEnroll = async () => {
    if (!courseIdentifier) return;
    setEnrolling(true);
    try {
      const response = await apiService.enrollCourse(courseIdentifier);
      if (response?.success) {
        push('Inscrição confirmada! Boas aulas. 😊', 'success');
        await fetchCourse();
      } else {
        push(response?.message || 'Não foi possível completar a inscrição.', 'error');
      }
    } catch (err) {
      if (err?.status === 403) {
        setRestriction({
          message: err?.data?.message || 'Seu plano atual não permite inscrição em cursos.',
          subscription: err?.data?.subscription || null,
        });
      }
      push(err?.message || 'Erro ao realizar inscrição.', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleLesson = async (lesson) => {
    if (!course?.enrollment) {
      push('Inscreva-se no curso para acompanhar seu progresso.', 'info');
      return;
    }

    setSavingLesson(lesson.id);
    try {
      const current = lessonProgress[lesson.id]?.watched || false;
      await apiService.updateLessonProgress(courseIdentifier, lesson.id, {
        watched: !current,
      });
      await loadProgress();
      push(!current ? 'Aula marcada como concluída. 🥳' : 'Progresso atualizado.', 'success');
    } catch (err) {
      push(err?.message || 'Não foi possível atualizar o progresso.', 'error');
    } finally {
      setSavingLesson(0);
    }
  };

  const toggleModule = (id) => {
    setOpenModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const progressPercent = Math.round(course?.enrollment?.progresso || 0);
  const totalModules = course?.modules?.length || 0;
  const totalLessons = course?.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-3xl bg-white" />
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-24 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="h-20 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-10 text-center text-red-600">
        <p className="text-lg font-semibold">{error}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>Voltar para cursos</Button>
      </div>
    );
  }

  if (restriction) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center">
        <h2 className="text-xl font-semibold text-amber-700">Conteúdo exclusivo para assinantes premium</h2>
        <p className="mt-2 text-amber-700">{restriction.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>Ver outros cursos</Button>
          <a
            className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-coral-600"
            href="https://www.empowerup.com.br/planos"
            target="_blank"
            rel="noreferrer"
          >
            Tornar-me premium
          </a>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="relative grid gap-10 px-8 py-10 lg:grid-cols-[1.6fr,1fr] lg:px-12">
          <div className="space-y-5">
            <button onClick={() => navigate(-1)} className="text-sm font-semibold text-coral-600 transition hover:text-coral-500">
              ← Voltar
            </button>
            <Badge>{course.categoria || 'Empreendedorismo'}</Badge>
            <h1 className="text-3xl font-semibold text-midnight sm:text-4xl">{course.titulo}</h1>
            <p className="text-base text-slate-600 sm:text-lg">{course.descricao || 'Conteúdo exclusivo para impulsionar sua jornada empreendedora.'}</p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <Clock className="h-4 w-4 text-coral" /> {course.duracao_estimado ? `${course.duracao_estimado} minutos` : 'No seu ritmo'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                📚 {totalModules} módulo{totalModules === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                🎬 {totalLessons} aula{totalLessons === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {course.enrollment ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Você está inscrita • {progressPercent}%
                </div>
              ) : (
                <Button onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Processando…' : 'Inscrever-se agora'}
                </Button>
              )}
              <span className="text-xs uppercase tracking-wide text-slate-400">Plano premium EmpowerUp</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center rounded-2xl bg-slate-100 p-6">
            <div className="flex flex-col items-center gap-3 text-center text-slate-600">
              <Video className="h-12 w-12 text-coral" />
              <p className="text-sm font-semibold">Vídeos hospedados via YouTube</p>
              <p className="text-xs text-slate-500">Os links das aulas podem ser atualizados a qualquer momento no painel administrativo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.8fr,1fr]">
        <div className="space-y-6">
          {course.modules?.map((module, moduleIndex) => {
            const isOpen = openModules[module.id] ?? true;
            const completedLessons = module.lessons?.filter((lesson) => lessonProgress[lesson.id]?.watched)?.length || 0;
            const totalModuleLessons = module.lessons?.length || 0;

            return (
              <div key={module.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
                <header
                  className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 px-6 py-5"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-coral">Módulo {moduleIndex + 1}</p>
                    <p className="text-lg font-semibold text-midnight">{module.titulo}</p>
                    {module.descricao && <p className="text-sm text-slate-500">{module.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>
                      {completedLessons}/{totalModuleLessons} aulas
                    </span>
                    <button type="button" className="rounded-full border border-slate-200 p-2">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </header>

                {isOpen && (
                  <div className="divide-y divide-slate-100">
                    {module.lessons?.map((lesson) => {
                      const watched = Boolean(lessonProgress[lesson.id]?.watched);
                      const embedUrl = buildEmbedUrl(lesson.conteudo_url);

                      return (
                        <div key={lesson.id} className={clsx('grid gap-6 px-6 py-6 lg:grid-cols-[auto,1fr] lg:items-start', watched && 'bg-emerald-50/50')}>
                          <button
                            type="button"
                            className={clsx('mt-1 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition', watched ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-coral/60 hover:text-coral')}
                            onClick={() => handleToggleLesson(lesson)}
                            disabled={savingLesson === lesson.id}
                          >
                            {savingLesson === lesson.id ? '…' : watched ? '✓' : '▶'}
                          </button>

                          <div className="space-y-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-base font-semibold text-midnight">{lesson.titulo}</h3>
                                {lesson.duracao_min && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                    <Clock className="h-3.5 w-3.5" /> {lesson.duracao_min} min
                                  </span>
                                )}
                              </div>
                              {lesson.descricao && <p className="mt-2 text-sm text-slate-500">{lesson.descricao}</p>}
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                              {embedUrl ? (
                                <iframe
                                  src={embedUrl}
                                  title={lesson.titulo}
                                  className="h-64 w-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-slate-500">
                                  <Video className="h-8 w-8 text-coral/70" />
                                  <p>Adicione o link do vídeo desta aula no painel administrativo.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-midnight">Resumo do curso</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Progresso atual: {progressPercent}%</li>
              <li>• Aulas concluídas: {Object.values(lessonProgress).filter((lesson) => lesson.watched).length}</li>
              <li>• Próxima ação: marque a aula após assistir para liberar o certificado.</li>
            </ul>
          </div>

          {course.resources?.length ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-midnight">Materiais complementares</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {course.resources.map((resource) => (
                  <li key={resource.id} className="flex items-center justify-between gap-3">
                    <span>{resource.titulo}</span>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-coral-600 transition hover:text-coral-500"
                      >
                        Abrir
                      </a>
                    ) : (
                      <span className="text-xs uppercase tracking-wide text-slate-400">Adicionar link</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
              Adicione materiais extras do curso no painel para aparecerem aqui.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default CourseDetailPage;
