import React from 'react';
import { PageLayout } from '../components/layout';
import { EmptyState } from '../components/common';
import { FileX } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

/**
 * Página 404 - Não encontrado
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <PageLayout showHeader={false} showFooter={false}>
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<FileX className="w-16 h-16" />}
          title="Página não encontrada"
          description="A página que você está procurando não existe ou foi movida."
          action={
            <div className="space-x-3">
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Voltar
              </Button>
              <Button onClick={() => navigate(ROUTES.HOME)}>
                Ir para Home
              </Button>
            </div>
          }
        />
      </div>
    </PageLayout>
  );
};

export default NotFoundPage;
