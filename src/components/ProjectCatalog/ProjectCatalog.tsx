import React, { useState, useMemo } from 'react';
import { IoTProject, ProjectCategory } from '../../types/project';
import styles from './ProjectCatalog.module.css';

interface ProjectCatalogProps {
  projects: IoTProject[];
  onSelectProject: (projectId: string) => void;
}

const CATEGORIES: ('Todas' | ProjectCategory)[] = [
  'Todas',
  'Aeroespacial',
  'Robótica & Radar',
  'Ambiente & Estufa',
  'Domótica & Automação',
  'Saúde & Biometria',
];

export const ProjectCatalog: React.FC<ProjectCatalogProps> = ({
  projects,
  onSelectProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | ProjectCategory>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat =
        selectedCategory === 'Todas' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.components.some((c) => c.name.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <span>⚡</span> Laboratório Maker & IoT em Tempo Real
        </div>
        <h1 className={styles.heroTitle}>
          Central <span className={styles.heroGradientText}>VersIOT</span>
        </h1>
        <p className={styles.heroDesc}>
          Explore projetos interativos de Internet das Coisas com simulação gráfica viva (3D e 2D),
          esquemas de ligação de sensores detalhados, códigos de firmware prontos para Arduino e ESP32,
          e conectividade instantânea com a <strong>Web Serial API</strong>.
        </p>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className={styles.filterBar}>
        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${
                selectedCategory === cat ? styles.pillActive : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por sensor ou projeto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grade de Cards dos Projetos */}
      <div className={styles.grid}>
        {filteredProjects.map((project) => (
          <div key={project.id} className={styles.card}>
            <div>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>{project.icon}</div>
                <span
                  className={styles.badge}
                  style={{
                    color: project.accentColor,
                    borderColor: `${project.accentColor}55`,
                    background: `${project.accentColor}15`,
                  }}
                >
                  {project.badge}
                </span>
              </div>

              <div className={styles.cardInfo} style={{ marginTop: '16px' }}>
                <h3 className={styles.cardTitle}>{project.name}</h3>
                <p className={styles.cardTagline}>{project.tagline}</p>

                <div className={styles.componentsTags}>
                  {project.components.slice(0, 3).map((comp, idx) => (
                    <span key={idx} className={styles.compTag}>
                      {comp.name}
                    </span>
                  ))}
                  {project.components.length > 3 && (
                    <span className={styles.compTag}>
                      +{project.components.length - 3} itens
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.difficulty}>
                Dificuldade: {project.difficulty}
              </span>
              <button
                className={styles.btnOpen}
                onClick={() => onSelectProject(project.id)}
              >
                <span>Abrir Projeto</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
