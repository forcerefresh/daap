import React, { useState, useEffect, useRef } from "react";
import { Button, Spinner } from "@blueprintjs/core";
import styles from "./templates-grid-v2.module.scss";

interface TemplatesGridV2Props {
  templates: TemplateItem[];
  metadata?: {
    searchTime: number;
    strategy: string;
    totalResults: number;
    language: string;
  };
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore?: () => Promise<void> | void; // Optional if you handle loading in parent
  onLike: (templateId: string) => void;
  onDislike: (templateId: string) => void;
  onUseTemplate: (
    templateId: string,
    lang: string,
    previewUid: string,
    documentType: string,
  ) => void;
  selectedLanguage?: string; // Optional for image URLs
}

interface Industry {
  id: string;
  name: string;
  semantic: string;
  parentId: string | null;
  level: number;
}

interface DocumentType {
  id: string;
  name: string;
  parentId: string;
  level: number;
  widthPx: number;
  heightPx: number;
  margin: {
    common: {
      px: number;
    };
  };
}

interface Template {
  id: number;
  industryStr: string;
  documentTypeStr: string;
  promptStr: string;
  previewUid: string;
  createdAt: string;
  industryId: string;
  documentTypeId: string;
  aiPromptId: string;
  industry: Industry;
  documentType: DocumentType;
  language?: string; // Add this
}

export interface TemplateItem {
  id: string;
  template: Template;
  industryStr: string;
  documentTypeStr: string;
  promptStr: string;
  similarity: number;
}

interface TemplatesGridV2Props {
  templates: TemplateItem[];
  metadata?: {
    searchTime: number;
    strategy: string;
    totalResults: number;
    language: string;
  };
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore?: () => Promise<void> | void;
  onLike: (templateId: string) => void;
  onDislike: (templateId: string) => void;
  onUseTemplate: (
    templateId: string,
    lang: string,
    previewUid: string,
    documentType: string,
  ) => void;
  selectedLanguage?: string;
}

// Helper function to determine aspect ratio class
const getAspectRatioClass = (width: number, height: number): string => {
  const aspectRatio = width / height;

  const TOLERANCE = 0.1;

  if (Math.abs(aspectRatio - 16 / 9) < TOLERANCE) {
    return "landscape";
  } else if (Math.abs(aspectRatio - 9 / 16) < TOLERANCE) {
    return "portrait";
  } else if (Math.abs(aspectRatio - 1) < TOLERANCE) {
    return "square";
  }

  return "square";
};

const calculateColumnCount = (width: number): number => {
  if (width >= 1580) return 6;
  if (width >= 1380) return 5;
  if (width >= 1180) return 4;
  if (width >= 880) return 3;
  if (width >= 580) return 2;
  return 1;
};

const TemplatesGridV2: React.FC<TemplatesGridV2Props> = ({
  templates,
  metadata,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  onUseTemplate,
  selectedLanguage = "en",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      setColumnCount(calculateColumnCount(container.offsetWidth));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const columns: TemplateItem[][] = Array.from({ length: columnCount }, () => []);
  templates.forEach((template, i) => columns[i % columnCount].push(template));

  const getSimilarityColor = (similarity: number): string => {
    if (similarity > 0.7) return styles.highSimilarity;
    if (similarity > 0.65) return styles.mediumSimilarity;
    return styles.lowSimilarity;
  };

  const formatSimilarity = (similarity: number): string => {
    return `${(similarity * 100).toFixed(1)}%`;
  };

  const renderCard = (template: TemplateItem) => {
    const aspectRatioClass = getAspectRatioClass(
      template.template.documentType.widthPx,
      template.template.documentType.heightPx,
    );
    return (
      <div
        key={`template-${template.id}`}
        className={`${styles.masonryItem} ${styles[aspectRatioClass]}`}
      >
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img
              src={`${import.meta.env.VITE_SAAS_API_URL}/public/public-media/${
                template.template.previewUid
              }.jpeg?language=${metadata?.language || selectedLanguage}`}
              alt={template.promptStr}
              className={styles.image}
              loading="lazy"
            />
            <div className={styles.similarityBadge}>
              <span
                className={`${styles.similarity} ${getSimilarityColor(template.similarity)}`}
              >
                {formatSimilarity(template.similarity)}
              </span>
            </div>

            <div className={styles.templateActionsHolder}>
              <div className={styles.buttonContainer}>
                <div>{/* Like/Dislike buttons if needed */}</div>
                <div style={{ flexGrow: "1" }}>
                  <Button
                    style={{ width: "100%" }}
                    intent="primary"
                    className={`${styles.templateButton} ${styles.useTemplateButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUseTemplate(
                        template.id,
                        template.template.language || selectedLanguage,
                        template.template.previewUid,
                        template.template.documentTypeStr,
                      );
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardContent}>
            <p className={styles.prompt}>
              {template.promptStr ?? template.template?.promptStr}
            </p>

            <div className={styles.tags}>
              <span className={styles.tag}>
                <span className={styles.tagLabel}>Industry:</span>
                {template.industryStr}
              </span>
              <span className={styles.tag}>
                <span className={styles.tagLabel}>Format:</span>
                {template.documentTypeStr}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={styles.container}>
      {isLoading && templates.length === 0 && (
        <div className={styles.loadingContainer}>
          <Spinner size={50} />
          <p>Loading templates...</p>
        </div>
      )}

      {error && templates.length === 0 && (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <Button intent="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {error && templates.length > 0 && (
        <div className={styles.inlineError}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.masonryContainer}>
        {columns.map((columnTemplates, columnIndex) => (
          <div key={`col-${columnIndex}`} className={styles.masonryColumn}>
            {columnTemplates.map(renderCard)}
          </div>
        ))}
      </div>

      {hasMore && templates.length > 0 && onLoadMore && (
        <div className={styles.loadMoreContainer}>
          <Button
            large
            intent="primary"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className={styles.loadMoreButton}
          >
            {isLoadingMore ? (
              <>
                <Spinner size={20} />
                <span style={{ marginLeft: "8px" }}>Loading More...</span>
              </>
            ) : (
              "Load More Templates"
            )}
          </Button>
        </div>
      )}

      {!hasMore && templates.length > 0 && (
        <div className={styles.endMessage}>
          <p>All templates loaded • {templates.length} templates</p>
        </div>
      )}

      {!isLoading && templates.length === 0 && (
        <div className={styles.emptyState}>
          <h3>No templates found</h3>
          <p>Try adjusting your search criteria or browse all templates</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(TemplatesGridV2);
