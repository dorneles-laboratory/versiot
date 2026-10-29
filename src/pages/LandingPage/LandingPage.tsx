import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Usb,
  FileCode,
  Activity,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { ALL_PROJECTS } from '@/data/projects';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation(['landing', 'common', 'projects']);

  const featuredProjects = ALL_PROJECTS.filter((p) => p.featured).slice(0, 4);

  return (
    <div className={styles.container}>
      {/* ====================================================================
          Hero Section
          ==================================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTextGroup}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              <span>{t('hero.badge', { ns: 'landing' })}</span>
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleGradient}>
                {t('hero.title', { ns: 'landing' })}
              </span>
            </h1>

            <p className={styles.heroSubtitle}>
              {t('hero.subtitle', { ns: 'landing' })}
            </p>

            <div className={styles.heroCtaGroup}>
              <Button asChild size="lg">
                <Link to="/projetos">
                  <span>{t('hero.ctaPrimary', { ns: 'landing' })}</span>
                  <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <a
                  href="https://github.com/dorneles-laboratory/versiot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon size={18} style={{ marginRight: '0.5rem' }} />
                  <span>{t('hero.ctaSecondary', { ns: 'landing' })}</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Card Visual de Apresentação / Mockup */}
          <div className={styles.heroVisualCard}>
            <div className={styles.cardHeaderBar}>
              <div className={styles.windowDots}>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <span className={`${styles.dot} ${styles.dotGreen}`} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
                FlightScope Telemetry · 115200 bps
              </div>
            </div>

            <div className={styles.visualPreviewContent}>
              <div className={styles.flightPreviewModel}>✈️</div>
              <div className={styles.hudOverlay}>
                <div className={styles.hudTop}>
                  <span>ALT: 2,450 FT</span>
                  <span>SPD: 420 KTS</span>
                  <span>HDG: 045°</span>
                </div>
                <div className={styles.hudBottom}>
                  <span>PITCH: +12.4° | ROLL: -3.8°</span>
                  <span>RADAR: 85 CM [LIDAR OK]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Como Funciona (3 Passos)
          ==================================================================== */}
      <section id="como-funciona" className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>{t('howItWorks.badge', { ns: 'landing' })}</span>
          <h2 className={styles.sectionTitle}>{t('howItWorks.title', { ns: 'landing' })}</h2>
          <p className={styles.sectionSubtitle}>{t('howItWorks.subtitle', { ns: 'landing' })}</p>
        </div>

        <div className={styles.stepsGrid}>
          {/* Passo 1 */}
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>{t('howItWorks.step1.number', { ns: 'landing' })}</span>
            <div className={styles.stepIconWrapper}>
              <Usb size={28} />
            </div>
            <h3 className={styles.stepTitle}>{t('howItWorks.step1.title', { ns: 'landing' })}</h3>
            <p className={styles.stepDesc}>{t('howItWorks.step1.description', { ns: 'landing' })}</p>
          </div>

          {/* Passo 2 */}
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>{t('howItWorks.step2.number', { ns: 'landing' })}</span>
            <div className={styles.stepIconWrapper}>
              <FileCode size={28} />
            </div>
            <h3 className={styles.stepTitle}>{t('howItWorks.step2.title', { ns: 'landing' })}</h3>
            <p className={styles.stepDesc}>{t('howItWorks.step2.description', { ns: 'landing' })}</p>
          </div>

          {/* Passo 3 */}
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>{t('howItWorks.step3.number', { ns: 'landing' })}</span>
            <div className={styles.stepIconWrapper}>
              <Activity size={28} />
            </div>
            <h3 className={styles.stepTitle}>{t('howItWorks.step3.title', { ns: 'landing' })}</h3>
            <p className={styles.stepDesc}>{t('howItWorks.step3.description', { ns: 'landing' })}</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Projetos em Destaque
          ==================================================================== */}
      <section id="destaques" className={styles.featuredSection}>
        <div className={styles.featuredInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>{t('featured.badge', { ns: 'landing' })}</span>
            <h2 className={styles.sectionTitle}>{t('featured.title', { ns: 'landing' })}</h2>
            <p className={styles.sectionSubtitle}>{t('featured.subtitle', { ns: 'landing' })}</p>
          </div>

          <div className={styles.featuredGrid}>
            {featuredProjects.map((project) => (
              <Link
                key={project.slug}
                to={`/projetos/${project.slug}`}
                className={styles.projectCard}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardIconTitle}>
                    <span className={styles.projectIcon}>{project.icon}</span>
                    <span className={styles.projectName}>{project.shortName}</span>
                  </div>
                  <p className={styles.projectTagline}>{project.tagline}</p>
                </div>

                <div className={styles.badgesGroup}>
                  <span className={styles.badgePill}>{project.category}</span>
                  <span className={styles.badgePill}>{project.difficulty}</span>
                  <span className={styles.badgePill}>{project.badge}</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Button asChild variant="outline">
              <Link to="/projetos">
                <span>{t('featured.viewAll', { ns: 'landing' })}</span>
                <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Recursos Técnicos
          ==================================================================== */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>{t('features.badge', { ns: 'landing' })}</span>
          <h2 className={styles.sectionTitle}>{t('features.title', { ns: 'landing' })}</h2>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureBox}>
            <div className={styles.featureIcon}>
              <Radio size={22} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>{t('features.item1.title', { ns: 'landing' })}</h3>
              <p className={styles.featureDesc}>{t('features.item1.description', { ns: 'landing' })}</p>
            </div>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIcon}>
              <Layers size={22} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>{t('features.item2.title', { ns: 'landing' })}</h3>
              <p className={styles.featureDesc}>{t('features.item2.description', { ns: 'landing' })}</p>
            </div>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIcon}>
              <Zap size={22} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>{t('features.item3.title', { ns: 'landing' })}</h3>
              <p className={styles.featureDesc}>{t('features.item3.description', { ns: 'landing' })}</p>
            </div>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>{t('features.item4.title', { ns: 'landing' })}</h3>
              <p className={styles.featureDesc}>{t('features.item4.description', { ns: 'landing' })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          CTA Final
          ==================================================================== */}
      <section className={styles.ctaFinalSection}>
        <div className={styles.ctaFinalInner}>
          <h2 className={styles.sectionTitle}>{t('tech.ctaTitle', { ns: 'landing' })}</h2>
          <p className={styles.sectionSubtitle}>{t('tech.ctaSubtitle', { ns: 'landing' })}</p>
          <Button asChild size="lg">
            <Link to="/projetos">
              <span>{t('tech.ctaButton', { ns: 'landing' })}</span>
              <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
