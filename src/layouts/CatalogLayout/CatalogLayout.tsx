import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cpu, Sun, Moon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { useTheme } from '@/hooks/useTheme';
import styles from './CatalogLayout.module.css';

export const CatalogLayout: React.FC = () => {
  const { t } = useTranslation(['common', 'catalog']);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.leftSection}>
            <Link to="/" className={styles.logoGroup}>
              <div className={styles.logoIcon}>
                <Cpu size={18} />
              </div>
              <span>{t('brand', { ns: 'common' })}</span>
            </Link>

            <Link to="/" className={styles.navLink}>
              <ArrowLeft size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {t('nav.home', { ns: 'common' })}
            </Link>
          </div>

          <div className={styles.rightSection}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={t('theme.toggle', { ns: 'common' })}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            <Button asChild variant="outline" size="sm">
              <a
                href="https://github.com/dorneles-laboratory/versiot"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon size={15} style={{ marginRight: '6px' }} />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <span>{t('footer.openSource', { ns: 'common' })} · {t('footer.license', { ns: 'common' })}</span>
      </footer>
    </div>
  );
};
