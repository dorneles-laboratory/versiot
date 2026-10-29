import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cpu, Sun, Moon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { useTheme } from '@/hooks/useTheme';
import styles from './MarketingLayout.module.css';

export const MarketingLayout: React.FC = () => {
  const { t } = useTranslation(['common', 'landing']);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.navWrapper}>
          <Link to="/" className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <Cpu size={20} />
            </div>
            <span>{t('brand', { ns: 'common' })}</span>
          </Link>

          <nav className={styles.navLinks}>
            <Link to="/#como-funciona" className={styles.navLink}>
              {t('howItWorks.badge', { ns: 'landing' })}
            </Link>
            <Link to="/#destaques" className={styles.navLink}>
              {t('featured.badge', { ns: 'landing' })}
            </Link>
            <Link to="/projetos" className={styles.navLink}>
              {t('nav.catalog', { ns: 'common' })}
            </Link>
            <a
              href="https://github.com/dorneles-laboratory/versiot"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              {t('nav.github', { ns: 'common' })}
            </a>
          </nav>

          <div className={styles.headerActions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={t('theme.toggle', { ns: 'common' })}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            <Button asChild variant="default" size="sm">
              <Link to="/projetos">
                <span>{t('nav.catalog', { ns: 'common' })}</span>
                <ArrowRight size={15} style={{ marginLeft: '0.4rem' }} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.logoGroup}>
                <div className={styles.logoIcon}>
                  <Cpu size={18} />
                </div>
                <span className={styles.footerBrandTitle}>{t('brand', { ns: 'common' })}</span>
              </div>
              <p className={styles.footerBrandDesc}>
                {t('tagline', { ns: 'common' })}. {t('footer.openSource', { ns: 'common' })}
              </p>
            </div>

            <div className={styles.footerColGroup}>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>{t('nav.catalog', { ns: 'common' })}</span>
                <Link to="/projetos/flightscope" className={styles.footerLink}>FlightScope</Link>
                <Link to="/projetos/sonar" className={styles.footerLink}>SonarScope</Link>
                <Link to="/projetos/garden" className={styles.footerLink}>BioScope</Link>
                <Link to="/projetos/smarthome" className={styles.footerLink}>HomeScope</Link>
                <Link to="/projetos/pulse" className={styles.footerLink}>PulseScope</Link>
              </div>

              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Open Source</span>
                <a
                  href="https://github.com/dorneles-laboratory/versiot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  <GitHubIcon size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Repositório GitHub
                </a>
                <a
                  href="https://github.com/dorneles-laboratory/versiot/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  Licença Apache-2.0
                </a>
                <a
                  href="https://github.com/dorneles-laboratory/versiot/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  Como Contribuir
                </a>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>{t('footer.developedBy', { ns: 'common' })}</span>
            <span>{t('footer.license', { ns: 'common' })}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
