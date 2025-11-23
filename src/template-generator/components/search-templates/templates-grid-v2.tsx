import React, { useState, useEffect } from "react";
import { Button, Spinner } from "@blueprintjs/core";
import styles from "./templates-grid-v2.module.scss";
import { usePublicTemplateSearch } from "../../hooks/usePublicTemplateSearch";
import { getMediaSrc } from "../../../integration/utils/local-media";

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

  // Load initial templates when component mounts or search query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) return;

    const loadInitialTemplates = async () => {
      if (initialTemplates && initialTemplates.length > 0) {
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

      setTemplates((prev) => [...prev, ...response.data]);
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
    <div className={styles.container}>
      {/* {metadata?.language && (
        <div className={styles.languageIndicator}>
          Language: {languageMappings[metadata.language]?.name}
        </div>
      )} */}
      {/* <div className={styles.header}>

        {searchQuery && (
          <p className={styles.searchInfo}>
            Showing results for: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div> */}

      {error && (
        <div className={styles.inlineError}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.masonryGrid}>
        {templates?.map((template) => {
          const aspectRatioClass = getAspectRatioClass(
            template.template.documentType.widthPx,
            template.template.documentType.heightPx
          );

          return (
            <div
              key={template.id}
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

export default TemplatesGridV2;
