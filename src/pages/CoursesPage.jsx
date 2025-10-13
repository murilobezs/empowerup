import React, { useEffect, useMemo } from 'react';
import { PageLayout } from '../components/layout';
import { Button } from '../components/ui/button';
import config from '../config/config';
import { ExternalLink, Loader2 } from 'lucide-react';

const CoursesPage = () => {
  const redirectUrl = useMemo(() => config.getCoursesUrl(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!redirectUrl) return;
    window.location.assign(redirectUrl);
  }, [redirectUrl]);

  return (
    <PageLayout
      title="Redirecionando para EmpowerUp Academy"
      subtitle="Estamos te levando para o microsite dedicado de cursos com a mesma autenticação da plataforma."
      breadcrumbs={[
        { label: 'Início', href: '/' },
        { label: 'Cursos' },
      ]}
    >
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-coral" aria-hidden />
        <p className="text-base text-slate-600">
          Caso o redirecionamento não aconteça automaticamente, utilize o botão abaixo para acessar o EmpowerUp Academy.
        </p>
        <Button asChild className="inline-flex items-center gap-2 bg-coral hover:bg-coral/90">
          <a href={redirectUrl}>
            Abrir cursos agora
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </PageLayout>
  );
};

export default CoursesPage;
