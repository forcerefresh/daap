import React, { useState, useEffect } from "react";
import { Button, Spinner } from "@blueprintjs/core";
import styles from "./templates-grid.module.scss";
import { usePublicTemplateSearch } from "../../hooks/usePublicTemplateSearch";
import { getMediaSrc } from "../../../integration/utils/local-media";

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

interface TemplatesGridProps {
  baseUrl?: string;
  searchQuery?: string;
  initialTemplates?: TemplateItem[];
}

const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  baseUrl = "",
  searchQuery = "",
  initialTemplates,
}) => {
  const { searchPublicTemplate } = usePublicTemplateSearch();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
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
          10
        );
        setTemplates(response.data);
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
        10
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
      <div className={styles.header}>
        {/* <h1>Social Media Templates</h1> */}
        <p>
          Discover professionally designed templates for your social media posts
        </p>
        {searchQuery && (
          <p className={styles.searchInfo}>
            Showing results for: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      {error && (
        <div className={styles.inlineError}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.grid}>
        {templates?.map((template) => (
          <div key={template.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img
                src={`/api/v1/media/${template.template.previewUid}.jpeg`}
                alt={template.promptStr}
                className={styles.image}
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

export default TemplatesGrid;
