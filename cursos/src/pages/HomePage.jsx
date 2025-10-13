import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '@shared/services/api';
import config from '@shared/config/config';
import CourseCard from '../components/CourseCard.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowRight, PlayCircle } from 'lucide-react';
import clsx from 'clsx';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiService.listCourses({ limit: 24 });
        if (response?.success && Array.isArray(response.courses)) {
          setCourses(response.courses);
        } else {
          throw new Error(response?.message || 'Não foi possível carregar os cursos.');
        }
      } catch (error) {
        console.error(error);
        push('Não conseguimos carregar os cursos agora. Tente novamente em instantes.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [push]);

  const introCourse = useMemo(
    () => courses.find((course) => course.slug === 'introducao-ao-empreendedorismo'),
    [courses]
  );

  const otherCourses = useMemo(
    () => courses.filter((course) => course.slug !== 'introducao-ao-empreendedorismo'),
    [courses]
  );

  const mainPortalUrl = config.BASE_URL || 'https://www.empowerup.com.br';

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-coral-500 via-coral-400 to-orange-300 px-6 py-16 text-white shadow-soft sm:px-10">
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/90">
              EmpowerUp Academy
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Cresça com o curso "Introdução ao Empreendedorismo Feminino"
            </h1>
            <p className="max-w-xl text-base text-white/90 sm:text-lg">
              Uma trilha completa para tirar sua ideia do papel com apoio da comunidade EmpowerUp. Acesse aulas introdutórias, materiais aplicáveis e marque seu progresso a cada etapa.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/curso/introducao-ao-empreendedorismo"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-coral-600 shadow-lg transition hover:-translate-y-0.5"
              >
                <PlayCircle className="h-5 w-5" />
                {isAuthenticated ? 'Continuar curso' : 'Ver detalhes do curso'}
              </Link>
              {!isAuthenticated && (
                <a
                  href={`${mainPortalUrl}/cadastro`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Quero fazer parte
                </a>
              )}
            </div>
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <div className="h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-60 w-60 flex-col justify-between rounded-3xl bg-white/10 p-6 backdrop-blur">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Primeiros passos</p>
                  <p className="mt-2 text-2xl font-semibold">Mentalidade empreendedora</p>
                </div>
                <div className="text-sm text-white/80">
                  <p>✔️ Aulas bite-size</p>
                  <p>✔️ Materiais aplicáveis</p>
                  <p>✔️ Checklists práticos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -top-10 right-10 hidden h-32 w-32 rotate-12 rounded-3xl border border-white/30 bg-white/10 lg:block" />
        <div className="pointer-events-none absolute -bottom-12 left-12 hidden h-36 w-36 -rotate-6 rounded-full border border-white/20 bg-white/10 lg:block" />
      </section>

      <section className="space-y-8">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-midnight">Cursos disponíveis</h2>
            <p className="mt-1 text-sm text-slate-500">Conteúdos curados pela equipe EmpowerUp para acelerar seu negócio.</p>
          </div>
          <a href={`${mainPortalUrl}/agenda`} className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600 transition hover:text-coral-500">
            Ver agenda completa
            <ArrowRight className="h-4 w-4" />
          </a>
        </header>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-[320px] animate-pulse rounded-3xl bg-white/70" />
            ))}
          </div>
        ) : (
          <div className={clsx('grid gap-6', introCourse ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2')}>
            {introCourse && <CourseCard key={introCourse.id} course={introCourse} />}
            {otherCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-10 shadow-soft">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-coral-600">
              Benefícios premium
            </span>
            <h2 className="text-2xl font-semibold text-midnight">Todo o ecossistema EmpowerUp em um só lugar</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>✔️ Acesso a cursos exclusivos com certificado de conclusão.</li>
              <li>✔️ Comunidade para trocar experiências com outras empreendedoras.</li>
              <li>✔️ Ferramentas e modelos prontos para aplicar no seu negócio.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
              <p className="text-sm font-semibold uppercase text-slate-500">Suporte</p>
              <p className="mt-3 text-lg font-semibold text-midnight">Fale com a equipe EmpowerUp</p>
              <p className="text-sm text-slate-500">contato@empowerup.com.br</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
              <p className="text-sm font-semibold uppercase text-slate-500">Plataforma principal</p>
              <a
                href={mainPortalUrl}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-coral-600 shadow transition hover:-translate-y-0.5"
              >
                Acessar EmpowerUp
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
