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

const languageMappings = {
  en: { name: "English", iso3: "eng" },
  es: { name: "Spanish", iso3: "spa" },
  fr: { name: "French", iso3: "fra" },
  pt: { name: "Portuguese", iso3: "por" },
  de: { name: "German", iso3: "deu" },
  sr: { name: "Serbian", iso3: "srp" },
  it: { name: "Italian", iso3: "ita" },
};

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

const TemplatesGridV2: React.FC<TemplatesGridV2Props> = ({
  templates,
  metadata,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  onLike,
  onDislike,
  onUseTemplate,
  selectedLanguage = "en",
}) => {
  const [columnCount, setColumnCount] = useState<number>(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Calculate column count based on container width with more precise breakpoints
  const calculateColumnCount = (currentWidth: number) => {
    const containerWidth =
      currentWidth || (containerRef.current?.offsetWidth ?? 0);

    if (containerWidth >= 1580) return 6;
    if (containerWidth >= 1380) return 5;
    if (containerWidth >= 1180) return 4;
    if (containerWidth >= 880) return 3;
    if (containerWidth >= 580) return 2;
    return 1;
  };

  // Update column count with proper width measurement
  const updateColumnCount = () => {
    const container = containerRef.current;
    if (!container) return;

    const currentWidth = container.offsetWidth;

    if (Math.abs(currentWidth - lastWidthRef.current) < 10) return;

    lastWidthRef.current = currentWidth;
    const newColumnCount = calculateColumnCount(currentWidth);
    setColumnCount(newColumnCount);
  };

  // Update column count on resize and initial load
  useEffect(() => {
    const attemptInitialCalculation = (attempt = 0) => {
      updateColumnCount();

      if (attempt < 3) {
        setTimeout(
          () => attemptInitialCalculation(attempt + 1),
          100 * (attempt + 1),
        );
      }
    };

    attemptInitialCalculation();

    let resizeTimeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(updateColumnCount, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update when templates change (container might have resized)
  useEffect(() => {
    const timeoutId = setTimeout(updateColumnCount, 50);
    return () => clearTimeout(timeoutId);
  }, [templates.length]);

  // Distribute templates into columns
  const distributeTemplatesToColumns = (allTemplates: TemplateItem[]) => {
    const columns: TemplateItem[][] = Array.from(
      { length: columnCount },
      () => [],
    );

    allTemplates.forEach((template, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(template);
    });

    return columns;
  };

  // Handle item click
  const handleItemClick = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Selection logic if needed
  };

  // Add click handler to container to deselect when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedId !== null) {
        setSelectedId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [selectedId]);

  const getSimilarityColor = (similarity: number): string => {
    if (similarity > 0.7) return styles.highSimilarity;
    if (similarity > 0.65) return styles.mediumSimilarity;
    return styles.lowSimilarity;
  };

  const formatSimilarity = (similarity: number): string => {
    return `${(similarity * 100).toFixed(1)}%`;
  };

  // Distribute current templates to columns
  const columns = distributeTemplatesToColumns(templates);

  if (isLoading && templates.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={50} />
        <p>Loading templates...</p>
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <Button intent="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      {error && (
        <div className={styles.inlineError}>
          <p>{error}</p>
        </div>
      )}

      <div
        className={`${styles.masonryContainer} ${
          selectedId ? styles.hasSelected : ""
        }`}
      >
        {columns.map((columnTemplates, columnIndex) => (
          <div
            key={`column-${columnIndex}-${columnCount}`}
            className={styles.masonryColumn}
          >
            {columnTemplates.map((template) => {
              const aspectRatioClass = getAspectRatioClass(
                template.template.documentType.widthPx,
                template.template.documentType.heightPx,
              );

              return (
                <div
                  key={`template-${template.id}`}
                  className={`${styles.masonryItem} ${
                    styles[aspectRatioClass]
                  } ${selectedId === template.id ? styles.selected : ""}`}
                  onClick={(e) => handleItemClick(template.id, e)}
                >
                  <div className={styles.card}>
                    <div className={styles.imageContainer}>
                      <img
                        src={`${
                          import.meta.env.VITE_SAAS_API_URL
                        }/public/public-media/${
                          template.template.previewUid
                        }.jpeg?language=${metadata?.language || selectedLanguage}`}
                        alt={template.promptStr}
                        className={styles.image}
                        loading="lazy"
                      />
                      <div className={styles.similarityBadge}>
                        <span
                          className={`${styles.similarity} ${getSimilarityColor(
                            template.similarity,
                          )}`}
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
                                  template.template.language ||
                                    selectedLanguage,
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
            })}
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
