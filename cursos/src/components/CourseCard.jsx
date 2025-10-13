import { Link } from 'react-router-dom';
import { BookOpen, Clock, Sparkles } from 'lucide-react';
import config from '@shared/config/config';
import clsx from 'clsx';

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath;
  }
  return config.getPublicUrl(imagePath);
};

const CourseCard = ({ course }) => {
  const thumbnail = buildImageUrl(course.imagem_capa);
  const enrollment = course.enrollment;

  const totalLessonsLabel = (() => {
    if (typeof course.totalLessons === 'number') {
      return `${course.totalLessons} aulas`;
    }
    if (typeof course.lessonsCount === 'number') {
      return `${course.lessonsCount} aulas`;
    }
    return 'Conteúdo organizado em módulos';
  })();

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <div
          className={clsx('absolute inset-0 bg-gradient-to-br from-coral-200/60 to-coral-400/60 transition group-hover:scale-105', thumbnail && 'opacity-0 group-hover:opacity-0')}
        />
        {thumbnail && (
          <img
            src={thumbnail}
            alt={course.titulo}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {course.destaque && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-coral">
            <Sparkles className="h-3.5 w-3.5" /> Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {course.categoria || 'Empreendedorismo'}
          </span>
          <h3 className="mt-4 text-xl font-semibold text-midnight">
            {course.titulo}
          </h3>
          <p className="mt-3 text-sm text-slate-600 line-clamp-3">{course.descricao}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <Clock className="h-4 w-4 text-coral" />
            {course.duracao_estimado ? `${course.duracao_estimado} min` : 'No seu ritmo'}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <BookOpen className="h-4 w-4 text-coral" />
            {totalLessonsLabel}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {enrollment ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-600">
              ✅ Inscrita • {Math.round(enrollment.progresso ?? 0)}%
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wide text-coral">Acesso Premium</span>
          )}

          <Link
            to={`/curso/${course.slug || course.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Ver curso
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
