import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Meme } from '../types';
import styles from './MemeModal.module.css';

interface MemeModalProps {
  meme: Meme | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemeModal({ meme, isOpen, onClose }: MemeModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    if (!meme) return;
    try {
      await navigator.clipboard.writeText(meme.url || meme.original_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!meme) return;
    const a = document.createElement('a');
    a.href = meme.url || meme.original_url;
    a.download = `meme-${meme.id}.${meme.format || 'jpg'}`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleCopyImage = async () => {
    if (!meme) return;
    try {
      const response = await fetch(meme.url || meme.original_url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback to copying URL
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && meme && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              className={styles.closeBtn}
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Image section */}
            <div className={styles.imageSection}>
              <motion.img
                src={meme.url || meme.original_url}
                alt={meme.vlm_description || 'Meme'}
                className={styles.image}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              />

              {/* GIF badge */}
              {meme.is_animated && (
                <span className={styles.gifBadge}>GIF</span>
              )}

              {/* Score badge */}
              {meme.score && (
                <div className={styles.scoreBadge}>
                  匹配度 {Math.round(meme.score * 100)}%
                </div>
              )}
            </div>

            {/* Info section */}
            <div className={styles.infoSection}>
              {/* Actions */}
              <div className={styles.actions}>
                <motion.button
                  className={`${styles.actionBtn} ${styles.primary}`}
                  onClick={handleCopyImage}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      已复制
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      复制图片
                    </>
                  )}
                </motion.button>

                <motion.button
                  className={styles.actionBtn}
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {downloaded ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      已下载
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      下载
                    </>
                  )}
                </motion.button>

                <motion.button
                  className={styles.actionBtn}
                  onClick={handleCopyLink}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  复制链接
                </motion.button>
              </div>

              {/* Description */}
              {meme.vlm_description && (
                <div className={styles.descriptionBox}>
                  <h4 className={styles.descriptionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    AI 识别描述
                  </h4>
                  <p className={styles.description}>{meme.vlm_description}</p>
                </div>
              )}

              {/* Meta info */}
              <div className={styles.meta}>
                {meme.category && (
                  <span className={styles.metaItem}>
                    <span className={styles.metaLabel}>分类:</span>
                    <span className={styles.metaValue}>{meme.category}</span>
                  </span>
                )}
                {meme.format && (
                  <span className={styles.metaItem}>
                    <span className={styles.metaLabel}>格式:</span>
                    <span className={styles.metaValue}>{meme.format.toUpperCase()}</span>
                  </span>
                )}
                {meme.width && meme.height && (
                  <span className={styles.metaItem}>
                    <span className={styles.metaLabel}>尺寸:</span>
                    <span className={styles.metaValue}>{meme.width} × {meme.height}</span>
                  </span>
                )}
              </div>

              {/* Tags */}
              {meme.tags && meme.tags.length > 0 && (
                <div className={styles.tags}>
                  {meme.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
