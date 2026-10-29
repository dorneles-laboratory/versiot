import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Heart,
  ArrowRight,
  Filter,
  RotateCcw,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { ALL_PROJECTS } from '@/data/projects';
import {
  ProjectCategoryKey,
  ProjectDifficultyKey,
  MicrocontrollerType,
} from '@/types/project';
import styles from './CatalogPage.module.css';

export const CatalogPage: React.FC = () => {
  const { t } = useTranslation(['catalog', 'common', 'projects']);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtros a partir da URL
  const searchQuery = searchParams.get('q') || '';
  const selectedDifficulty = (searchParams.get('dificuldade') || 'all') as
    | 'all'
    | ProjectDifficultyKey;
  const selectedMicro = (searchParams.get('micro') || 'all') as
    | 'all'
    | MicrocontrollerType;
  const selectedCategory = (searchParams.get('categoria') || 'all') as
    | 'all'
    | ProjectCategoryKey;

  // Favoritos salvos em localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('versiot_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      try {
        localStorage.setItem('versiot_favorites', JSON.stringify(next));
      } catch {
        /* ignora */
      }
      return next;
    });
  };

  // Atualiza search params preservando os outros
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true });
  };

  // Filtragem dos projetos
  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter((proj) => {
      // Busca textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = proj.name.toLowerCase().includes(query);
        const matchesTagline = proj.tagline.toLowerCase().includes(query);
        const matchesDesc = proj.description.toLowerCase().includes(query);
        const matchesSensor = proj.components.some((c) =>
          c.name.toLowerCase().includes(query)
        );
        const matchesMicro = proj.microcontrollers.some((m) =>
          m.toLowerCase().includes(query)
        );
        if (
          !matchesName &&
          !matchesTagline &&
          !matchesDesc &&
          !matchesSensor &&
          !matchesMicro
        ) {
          return false;
        }
      }

      // Dificuldade
      if (selectedDifficulty !== 'all' && proj.difficultyKey !== selectedDifficulty) {
        return false;
      }

      // Microcontrolador
      if (
        selectedMicro !== 'all' &&
        !proj.microcontrollers.includes(selectedMicro as MicrocontrollerType)
      ) {
        return false;
      }

      // Categoria
      if (selectedCategory !== 'all' && proj.categoryKey !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedDifficulty, selectedMicro, selectedCategory]);

  return (
    <div className={styles.container}>
      {/* Header do Catálogo */}
      <div className={styles.headerArea}>
        <h1 className={styles.title}>{t('header.title', { ns: 'catalog' })}</h1>
        <p className={styles.subtitle}>{t('header.subtitle', { ns: 'catalog' })}</p>
      </div>

      {/* Barra de Pesquisa */}
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('search.placeholder', { ns: 'catalog' })}
          value={searchQuery}
          onChange={(e) => updateParam('q', e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.clearSearchBtn}
            onClick={() => updateParam('q', '')}
            title={t('actions.close', { ns: 'common' })}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Layout de Conteúdo: Filtros + Grid */}
      <div className={styles.contentLayout}>
        {/* Sidebar de Filtros */}
        <aside className={styles.filterSidebar}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              <Filter size={16} />
              {t('filters.title', { ns: 'catalog' })}
            </span>
            {(searchQuery ||
              selectedDifficulty !== 'all' ||
              selectedMicro !== 'all' ||
              selectedCategory !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                style={{ height: '26px', fontSize: '0.75rem', padding: '0 6px' }}
              >
                <RotateCcw size={12} style={{ marginRight: '4px' }} />
                {t('filters.clear', { ns: 'catalog' })}
              </Button>
            )}
          </div>

          {/* Filtro: Dificuldade */}
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupTitle}>
              {t('filters.difficulty.title', { ns: 'catalog' })}
            </span>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterBtn} ${selectedDifficulty === 'all' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('dificuldade', 'all')}
              >
                <span>{t('filters.difficulty.all', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedDifficulty === 'beginner' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('dificuldade', 'beginner')}
              >
                <span>{t('filters.difficulty.beginner', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedDifficulty === 'intermediate' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('dificuldade', 'intermediate')}
              >
                <span>{t('filters.difficulty.intermediate', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedDifficulty === 'advanced' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('dificuldade', 'advanced')}
              >
                <span>{t('filters.difficulty.advanced', { ns: 'catalog' })}</span>
              </button>
            </div>
          </div>

          {/* Filtro: Microcontrolador */}
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupTitle}>
              {t('filters.microcontroller.title', { ns: 'catalog' })}
            </span>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterBtn} ${selectedMicro === 'all' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('micro', 'all')}
              >
                <span>{t('filters.microcontroller.all', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedMicro === 'ESP32' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('micro', 'ESP32')}
              >
                <span>ESP32</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedMicro === 'Arduino' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('micro', 'Arduino')}
              >
                <span>Arduino (Uno/Nano)</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedMicro === 'Raspberry Pi' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('micro', 'Raspberry Pi')}
              >
                <span>Raspberry Pi Pico</span>
              </button>
            </div>
          </div>

          {/* Filtro: Categoria */}
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupTitle}>
              {t('filters.category.title', { ns: 'catalog' })}
            </span>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterBtn} ${selectedCategory === 'all' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('categoria', 'all')}
              >
                <span>{t('filters.category.all', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedCategory === 'aerospace' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('categoria', 'aerospace')}
              >
                <span>{t('filters.category.aerospace', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedCategory === 'robotics' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('categoria', 'robotics')}
              >
                <span>{t('filters.category.robotics', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedCategory === 'climate' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('categoria', 'climate')}
              >
                <span>{t('filters.category.climate', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedCategory === 'automation' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('categoria', 'automation')}
              >
                <span>{t('filters.category.automation', { ns: 'catalog' })}</span>
              </button>
              <button
                className={`${styles.filterBtn} ${selectedCategory === 'health' ? styles.filterBtnActive : ''}`}
                onClick={() => updateParam('categoria', 'health')}
              >
                <span>{t('filters.category.health', { ns: 'catalog' })}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Grid de Projetos */}
        <section className={styles.projectsArea}>
          <div className={styles.resultsCount}>
            {filteredProjects.length === 1
              ? t('search.results', { ns: 'catalog', count: 1 })
              : t('search.results_plural', {
                  ns: 'catalog',
                  count: filteredProjects.length,
                })}
          </div>

          {filteredProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: '3rem' }}>🔍</div>
              <h3 className={styles.emptyTitle}>{t('empty.title', { ns: 'catalog' })}</h3>
              <p className={styles.emptyDesc}>{t('empty.description', { ns: 'catalog' })}</p>
              <Button variant="outline" onClick={clearAllFilters}>
                {t('empty.clearAction', { ns: 'catalog' })}
              </Button>
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {filteredProjects.map((project) => {
                const isFav = favorites.includes(project.slug);
                return (
                  <div key={project.slug} className={styles.projectCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardIconTitle}>
                        <span className={styles.projectIcon}>{project.icon}</span>
                        <div>
                          <h2 className={styles.projectName}>{project.shortName}</h2>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                            {project.category}
                          </div>
                        </div>
                      </div>

                      <button
                        className={`${styles.favBtn} ${isFav ? styles.favBtnActive : ''}`}
                        onClick={(e) => toggleFavorite(project.slug, e)}
                        title={isFav ? 'Remover dos favoritos' : 'Favoritar projeto'}
                      >
                        <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.projectDescription}>{project.description}</p>

                      <div className={styles.tagGroup}>
                        <span className={styles.tagPill}>{project.difficulty}</span>
                        <span className={styles.tagPill}>{project.badge}</span>
                      </div>

                      <div className={styles.tagGroup}>
                        {project.microcontrollers.map((micro) => (
                          <span key={micro} className={styles.microPill}>
                            <Cpu size={11} style={{ display: 'inline', marginRight: '3px' }} />
                            {micro}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.baudIndicator}>
                        {project.defaultBaud} bps
                      </span>

                      <Button asChild size="sm">
                        <Link to={`/projetos/${project.slug}`}>
                          <span>{t('card.openWorkspace', { ns: 'catalog' })}</span>
                          <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
