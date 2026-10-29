import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button/button';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation(['workspace', 'common']);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '2rem',
        gap: '1.25rem',
      }}
    >
      <div style={{ fontSize: '4rem' }}>🛰️</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>404</h1>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)', maxWidth: '480px' }}>
        {t('notFound.description', { ns: 'workspace' })}
      </h2>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <Button asChild variant="outline">
          <Link to="/">
            <Home size={15} style={{ marginRight: '6px' }} />
            <span>{t('nav.home', { ns: 'common' })}</span>
          </Link>
        </Button>
        <Button asChild>
          <Link to="/projetos">
            <Compass size={15} style={{ marginRight: '6px' }} />
            <span>{t('nav.catalog', { ns: 'common' })}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
