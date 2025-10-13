import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Button } from '../components/ui/button';
import config from '../config/config';
import { ExternalLink, Loader2 } from 'lucide-react';

const CourseDetailPage = () => {
  const { identifier = '' } = useParams();

  const redirectUrl = useMemo(() => {
    const cleanIdentifier = identifier ? identifier.trim() : '';
    const slug = cleanIdentifier ? encodeURIComponent(cleanIdentifier) : '';
    return config.getCoursesUrl(slug ? `/curso/${slug}` : undefined);
  }, [identifier]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!redirectUrl) return;
    window.location.assign(redirectUrl);
  }, [redirectUrl]);

  return (
    <PageLayout
      title="Redirecionando para o curso completo"
      subtitle="O conteúdo detalhado deste curso agora vive no EmpowerUp Academy."
      breadcrumbs={[
        { label: 'Início', href: '/' },
        { label: 'Cursos', href: '/cursos' },
        identifier ? { label: identifier } : undefined,
      ].filter(Boolean)}
    >
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-coral" aria-hidden />
        <p className="text-base text-slate-600">
          Abriremos o curso no microsite dedicado. Caso o redirecionamento automático não funcione, siga pelo botão abaixo.
        </p>
        <Button asChild className="inline-flex items-center gap-2 bg-coral hover:bg-coral/90">
          <a href={redirectUrl}>
            Ver curso no EmpowerUp Academy
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </PageLayout>
  );
};

export default CourseDetailPage;
