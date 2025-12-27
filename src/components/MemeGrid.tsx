import { motion, AnimatePresence } from 'framer-motion';
import type { Meme } from '../types';
import MemeCard from './MemeCard';
import styles from './MemeGrid.module.css';

interface MemeGridProps {
  memes: Meme[];
  isLoading?: boolean;
  onMemeClick?: (meme: Meme) => void;
  emptyMessage?: string;
  searchQuery?: string;
  title?: string;
}

// Loading skeleton component
function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      className={styles.skeletonCard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={`${styles.skeletonImage} skeleton`} />
    </motion.div>
  );
}

export default function MemeGrid({
  memes,
  isLoading = false,
  onMemeClick,
  emptyMessage = '暂无表情包',
  searchQuery,
  title,
}: MemeGridProps) {
  // Show loading skeletons
  if (isLoading) {
    return (
      <section className={styles.container}>
        {title && (
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h2>
        )}
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      </section>
    );
  }

  // Empty state
  if (memes.length === 0) {
    return (
      <section className={styles.container}>
        <motion.div
          className={styles.empty}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.emptyIcon}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              🤔
            </motion.div>
          </div>
          <h3 className={styles.emptyTitle}>{emptyMessage}</h3>
          {searchQuery && (
            <p className={styles.emptyText}>
              找不到与「{searchQuery}」相关的表情包，试试其他关键词？
            </p>
          )}
        </motion.div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      {/* Section title (for recommended section) */}
      {title && (
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {title}
        </motion.h2>
      )}

      {/* Results count */}
      {searchQuery && (
        <motion.div
          className={styles.resultsInfo}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={styles.resultsQuery}>「{searchQuery}」</span>
          <span className={styles.resultsCount}>找到 {memes.length} 个表情包</span>
        </motion.div>
      )}

      {/* Grid */}
      <motion.div
        className={styles.grid}
        layout
      >
        <AnimatePresence mode="popLayout">
          {memes.map((meme, index) => (
            <MemeCard
              key={meme.id}
              meme={meme}
              index={index}
              onClick={onMemeClick}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load more indicator */}
      {memes.length > 0 && (
        <motion.div
          className={styles.endIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className={styles.endLine} />
          <span className={styles.endText}>已展示全部结果</span>
          <span className={styles.endLine} />
        </motion.div>
      )}
    </section>
  );
}
