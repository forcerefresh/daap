import React, { useState, useEffect, useRef } from "react";
import { Button, Spinner } from "@blueprintjs/core";
import styles from "./templates-grid-v2.module.scss";
import { usePublicTemplateSearch } from "../../hooks/usePublicTemplateSearch";

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
}

export interface TemplateItem {
  id: number;
  template: Template;
  industryStr: string;
  documentTypeStr: string;
  promptStr: string;
  similarity: number;
}

interface TemplatesResponse {
  data: TemplateItem[];
  metadata: {
    searchTime: number;
    strategy: string;
    totalResults: number;
    language: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TemplatesGridV2Props {
  baseUrl?: string;
  searchQuery?: string;
  initialTemplates?: TemplateItem[];
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
  baseUrl = "",
  searchQuery = "",
  initialTemplates,
}) => {
  const { searchPublicTemplate } = usePublicTemplateSearch();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [metadata, setMetadata] = useState<TemplatesResponse["metadata"]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [columnCount, setColumnCount] = useState<number>(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef<number>(0);

  // Track which page each template belongs to
  const templatePagesRef = useRef<Map<number, number>>(new Map());

  // Calculate column count based on container width with more precise breakpoints
  const calculateColumnCount = (currentWidth: number) => {
    // Use window.innerWidth as fallback for more consistent measurement
    const containerWidth =
      currentWidth || (containerRef.current?.offsetWidth ?? 0);

    // More precise breakpoints with buffer to prevent flickering
    if (containerWidth >= 1580) return 6; // 1601 - buffer
    if (containerWidth >= 1380) return 5; // 1401 - buffer
    if (containerWidth >= 1180) return 4; // 1201 - buffer
    if (containerWidth >= 880) return 3; // 901 - buffer
    if (containerWidth >= 580) return 2; // 601 - buffer
    return 1;
  };

  // Update column count with proper width measurement
  const updateColumnCount = () => {
    const container = containerRef.current;
    if (!container) return;

    // Get the actual rendered width
    const currentWidth = container.offsetWidth;

    // Only update if width actually changed significantly (more than 10px)
    if (Math.abs(currentWidth - lastWidthRef.current) < 10) return;

    lastWidthRef.current = currentWidth;
    const newColumnCount = calculateColumnCount(currentWidth);

    // Force update even if count is the same to handle redistribution
    setColumnCount(newColumnCount);
  };

  // Update column count on resize and initial load
  useEffect(() => {
    // Initial calculation with multiple attempts to ensure accurate measurement
    const attemptInitialCalculation = (attempt = 0) => {
      updateColumnCount();

      // Try up to 3 times with increasing delays to ensure DOM is ready
      if (attempt < 3) {
        setTimeout(
          () => attemptInitialCalculation(attempt + 1),
          100 * (attempt + 1)
        );
      }
    };

    attemptInitialCalculation();

    // Set up resize listener with proper debouncing
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

  // Distribute templates into columns - this now handles redistribution properly
  const distributeTemplatesToColumns = (allTemplates: TemplateItem[]) => {
    const columns: TemplateItem[][] = Array.from(
      { length: columnCount },
      () => []
    );

    // Simple round-robin distribution that maintains order
    allTemplates.forEach((template, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(template);
    });

    return columns;
  };

  // Load initial templates when component mounts or search query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) return;

    const loadInitialTemplates = async () => {
      if (initialTemplates && initialTemplates.length > 0) {
        initialTemplates.forEach((template) => {
          templatePagesRef.current.set(template.id, 1);
        });
        setTemplates(initialTemplates);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response: TemplatesResponse = await searchPublicTemplate(
          1,
          searchQuery,
          12
        );

        // Track page for initial templates
        response.data.forEach((template) => {
          templatePagesRef.current.set(template.id, 1);
        });

        setTemplates(response.data);
        setMetadata(response.metadata);
        setHasMore(response.pagination.hasNext);
        setCurrentPage(1);
      } catch (err) {
        setError("Failed to load templates");
        console.error("Error loading templates:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialTemplates();
  }, [searchQuery]);

  const handleLoadMore = async (): Promise<void> => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response: TemplatesResponse = await searchPublicTemplate(
        nextPage,
        searchQuery,
        12
      );

      // Track page for new templates
      response.data.forEach((template) => {
        templatePagesRef.current.set(template.id, nextPage);
      });

      // Append new templates
      setTemplates((prev) => {
        const newTemplates = response.data.filter(
          (newItem) =>
            !prev.some((existingItem) => existingItem.id === newItem.id)
        );
        return [...prev, ...newTemplates];
      });
      setHasMore(response.pagination.hasNext);
      setCurrentPage(nextPage);
    } catch (err) {
      setError("Failed to load more templates");
      console.error("Error loading more templates:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

  if (isLoading) {
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

      <div className={styles.masonryContainer}>
        {columns.map((columnTemplates, columnIndex) => (
          <div
            key={`column-${columnIndex}-${columnCount}`}
            className={styles.masonryColumn}
          >
            {columnTemplates.map((template) => {
              const aspectRatioClass = getAspectRatioClass(
                template.template.documentType.widthPx,
                template.template.documentType.heightPx
              );

              return (
                <div
                  key={`template-${template.id}`}
                  className={`${styles.masonryItem} ${styles[aspectRatioClass]}`}
                >
                  <div className={styles.card}>
                    <div className={styles.imageContainer}>
                      <img
                        src={`/api/v1/media/${template.template.previewUid}.jpeg?language=${metadata?.language}`}
                        alt={template.promptStr}
                        className={styles.image}
                        loading="lazy"
                      />
                      <div className={styles.similarityBadge}>
                        <span
                          className={`${styles.similarity} ${getSimilarityColor(
                            template.similarity
                          )}`}
                        >
                          {formatSimilarity(template.similarity)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <p className={styles.prompt}>{template.promptStr}</p>

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

      {hasMore && templates && templates.length > 0 && (
        <div className={styles.loadMoreContainer}>
          <Button
            large
            intent="primary"
            onClick={handleLoadMore}
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

      {!hasMore && templates && templates.length > 0 && (
        <div className={styles.endMessage}>
          <p>All templates loaded • {templates.length} templates</p>
        </div>
      )}

      {searchQuery && templates && templates.length === 0 && !isLoading && (
        <div className={styles.emptyState}>
          <h3>No templates found</h3>
          <p>Try adjusting your search criteria or browse all templates</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(TemplatesGridV2);
