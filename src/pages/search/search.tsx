import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
  H4,
  Icon,
  Spinner,
  TextArea,
  Text,
} from "@blueprintjs/core";
import cx from "classnames";
import styles from "./search.module.scss";
import HeadlineRandomizer from "./components/headline/HeadlineRandomizer";
import SearchSuggestions from "./components/search-suggest/SearchSuggestions";
import SelectBadge from "./components/select-badge/SelectBadge";
import TemplatesGridV2, {
  TemplateItem,
} from "../../template-generator/components/search-templates/templates-grid-v2";
import { connect } from "react-redux";
import {
  loadUserData,
  updateEditor,
} from "../../store/actions/actions";
import { IStore } from "../../store/store";
import DaapLogo from "../../integration/components/main-header/daap-logo.svg?react";
import { account, IAccount } from "../../store/reducers/account";
import { useNavigate } from "react-router";
import "../../global.scss";
import { getPendingTemplate } from "./utils/pending-template";
import SearchFooter from "./components/footer/SearchFooter";
import { Link } from "react-router-dom";
import { usePublicTemplateSearch } from "../../template-generator/hooks/usePublicTemplateSearch";
import { IntegrationContext } from "../../integration";
import { useFullscreen } from "../../integration/hooks/fullscreen-hook/fullscreen-hook";
import { platformFlags } from "@platform/platform-flags";

interface ISearchProps {
  onClose: () => void;
}

export type ISearchMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISearchProps;

const SearchPage = ({
  isAuthenticated,
  _updateEditor,
  _loadUserData,
  account,
  theme,
  fullScreen,
  appZoom: appZoomFromStore,
}: ISearchMergedProps) => {
  const {
    getFullscreenButtonComponent: FullscreenButtonComponent,
    AccountComponent,
    useSettingsHook,
    platform,
  } = useContext(IntegrationContext);

  const { scaleUI } = useSettingsHook();

  useFullscreen(fullScreen, scaleUI, appZoomFromStore);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedDocumentType, setSelectedDocumentType] = useState(
    "SocialMedia:Instagram:SquarePost",
  );

  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (platformFlags.hasPendingTemplateRedirect) {
      // Check for pending template
      const pendingTemplate = getPendingTemplate();

      if (account.userDataLoading && pendingTemplate) {
        setShowRedirectMessage(true);
      }

      if (!account.userDataLoading) {
        setShowRedirectMessage(false);
      }
    }
  }, [account, navigate]);

  const renderSpinner = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "white",
        }}
      >
        <Spinner size={50} />
        <H4 style={{ marginTop: 20 }}>
          {showRedirectMessage ? "Loading and redirecting..." : "Loading..."}
        </H4>
      </div>
    );
  };
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "pt", label: "Portuguese" },
    { value: "de", label: "German" },
    { value: "sr", label: "Serbian" },
    { value: "it", label: "Italian" },
  ];

  const documents = [
    { value: "SocialMedia:Instagram:SquarePost", label: "Square post" },
    { value: "SocialMedia:Instagram:StoryReel", label: "Story/Reel" },
  ];

  const handleSearch = () => {
    setIsExpanded(true);
    loadTemplates();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      // If Shift + Enter → allow new line (default behavior)
      if (e.shiftKey) {
        return; // Let the default new line happen
      }

      // If just Enter → prevent default and handle search
      e.preventDefault();
      handleSearch();
    }
  };

  const handleFocus = () => {
    setIsTextAreaFocused(true);
  };

  const handleBlur = () => {
    setIsTextAreaFocused(false);
  };

  // -________________-

  // State for templates grid
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [metadata, setMetadata] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { searchPublicTemplate } = usePublicTemplateSearch();

  // Load initial templates

  const stateRef = useRef({
    searchQuery: "",
    selectedLanguage: "en",
    selectedDocumentType: "SocialMedia:Instagram:SquarePost",
  });

  const loadTemplates = async () => {
    //{ documentType }: { documentType?: string }
    if (stateRef.current.searchQuery.length < 1) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchPublicTemplate(
        1,
        stateRef.current.searchQuery,
        stateRef.current.selectedLanguage,
        stateRef.current.selectedDocumentType, // documentType ??
      );

      setTemplates(response.data);
      setMetadata(response.metadata);
      setHasMore(response.pagination.hasNext);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  // Load more templates
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await searchPublicTemplate(
        nextPage,
        searchQuery,
        selectedLanguage,
        selectedDocumentType,
      );

      setTemplates((prev) => {
        const newTemplates = response.data.filter(
          (newItem: any) =>
            !prev.some((existingItem) => existingItem.id === newItem.id),
        );
        return [...prev, ...newTemplates];
      });

      setHasMore(response.pagination.hasNext);
      setCurrentPage(nextPage);
    } catch (err) {
      setError("Failed to load more templates");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLike = (_templateId: string) => {
    // Handle like
  };

  const handleDislike = (_templateId: string) => {
    // Handle dislike
  };

  const handleUseTemplate = (
    publicTemplateId: string,
    lang: string,
    previewUid: string,
    documentType: string,
  ) => {
    if (!isAuthenticated) {
      localStorage.setItem(
        "pendingTemplate",
        JSON.stringify({
          id: publicTemplateId,
          language: lang,
          previewUid,
          documentType,
        }),
      );
    } else {
      localStorage.removeItem("pendingTemplate");
    }

    navigate(`/editor?template=${publicTemplateId}&language=${lang}`);
  };

  useEffect(() => {
    _loadUserData();
  }, []);

  // probably some workaround. is needed?
  useLayoutEffect(() => {
    const root = document.getElementById("daap-forcerefresh-root");
    if (root) {
      root.classList.remove(`bp5-${theme}`);
      root.classList.add(`bp5-${theme}`);
    }
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      const template = getPendingTemplate();
      if (template) {
        localStorage.removeItem("pendingTemplate");
        navigate(
          `/editor?template=${template.id}&language=${template.language}`,
        );
      }
    }
  }, [isAuthenticated]);

  const searchPageContainerWP =
    platform.hasWpContainerClass && !fullScreen
      ? styles.searchPageContainerWP
      : "";

  return (
    <>
      <>
        <div
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            // height: "52px",
            overflow: "visible",
            padding: "8px 16px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            // gap: "40px",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flex: "1",
              minWidth: "0",
              height: "44px",
            }}
          >
            {platform.hasHomeLinkInSearch ? (
              <Link
                to={"/search"}
                style={{
                  outline: "none",
                  marginRight: "24px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DaapLogo className={styles.logo} />
              </Link>
            ) : (
              <DaapLogo className={styles.logo} />
            )}

            {platform.hasHomeLinkInSearch && (
              <>
                <Link
                  to={"https://daap.forcerefresh.io"}
                  className={cx(styles.headerLink, styles.headerLinkHome)}
                >
                  <Text style={{ display: "inline" }}>Home</Text>
                </Link>
                <Link
                  to={"https://learn.daap.forcerefresh.io/docs"}
                  className={styles.headerLink}
                >
                  <Text style={{ display: "inline" }}>Documentation</Text>
                </Link>
                <Link
                  to={"https://learn.daap.forcerefresh.io/wordpress"}
                  className={styles.headerLink}
                >
                  <Text style={{ display: "inline" }}>Wordpress</Text>
                </Link>
                <Link
                  to={"https://learn.daap.forcerefresh.io/contact"}
                  className={styles.headerLink}
                >
                  <Text style={{ display: "inline" }}>Contact</Text>
                </Link>
              </>
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Button
            // className={css.largeButton}
            // large
            style={{ color: "rgb(110 240 239)" }}
            minimal
            icon={
              <Icon
                style={{ color: "rgb(110 240 239)" }}
                icon="search"
                size={20}
              />
            }
            onClick={() => {
              localStorage.removeItem("pendingTemplate");
              navigate(`/editor`);
            }}
          >
            Go to Editor
          </Button>

          <AccountComponent placement="search-header" />

          <FullscreenButtonComponent
            toggle={() => {
              _updateEditor({ fullScreen: !fullScreen });
            }}
            isFullscreen={fullScreen}
            // className={css.fullscreenButton}
          />
        </div>
      </>

      <div
        className={`${styles.searchPageContainer} ${searchPageContainerWP}  ${
          isExpanded ? styles.expanded : ""
        }`}
      >
        {!showRedirectMessage && (
          <>
            <div className={styles.searchContent}>
              {!isExpanded && (
                <div className={styles.searchHeader}>
                  <HeadlineRandomizer />
                </div>
              )}

              {/* Sticky container wrapper */}
              <div className={styles.stickyContainer}>
                <div
                  className={`${styles.searchInputContainer} ${
                    isTextAreaFocused ? styles.focused : ""
                  } ${isExpanded ? styles.expanded : ""}`}
                >
                  <TextArea
                    inputRef={textAreaRef} // Pass the ref here
                    value={searchQuery}
                    onChange={(e) => {
                      stateRef.current.searchQuery = e.target.value;
                      setSearchQuery(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={styles.searchTextArea}
                    placeholder="Search for Instagram templates to customize..."
                    growVertically={false}
                    large
                  />

                  <div className={styles.inputBottomControls}>
                    <div className={styles.badgesContainer}>
                      <SelectBadge
                        label="Language"
                        options={languages}
                        value={selectedLanguage}
                        onChange={(value) => {
                          stateRef.current.selectedLanguage = value;
                          setSelectedLanguage(value);
                          loadTemplates();
                        }}
                        minimal={false}
                      />

                      <SelectBadge
                        label="Document"
                        options={documents} // Fixed: using documents array instead of languages
                        value={selectedDocumentType}
                        onChange={(value) => {
                          stateRef.current.selectedDocumentType = value;

                          setSelectedDocumentType(value);
                          loadTemplates();
                        }}
                        minimal={false}
                      />
                    </div>

                    <div className={styles.searchButtonContainer}>
                      <Button
                        intent="primary"
                        onClick={handleSearch}
                        className={styles.searchButton}
                        disabled={searchQuery.trim().length < 1}
                        rightIcon="arrow-right"
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {!isExpanded && (
                <SearchSuggestions
                  onSuggestionClick={(value) => {
                    stateRef.current.searchQuery = value;
                    setSearchQuery(value);
                    handleSearch();
                  }}
                />
              )}

              {isExpanded && (
                <TemplatesGridV2
                  templates={templates}
                  metadata={metadata}
                  isLoading={isLoading}
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  error={error}
                  onLoadMore={handleLoadMore}
                  onUseTemplate={handleUseTemplate}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  selectedLanguage={selectedLanguage}
                />
              )}
              <SearchFooter />
            </div>
          </>
        )}
      </div>
      {showRedirectMessage && renderSpinner()}
    </>
  );
};

const mapStateToProps = (state: IStore) => ({
  theme: state.globals.theme,
  isAuthenticated:
    !!state.account.userData?.displayName && !state.account.userDataLoading,
  account: state.account,
  fullScreen: state.editor.fullScreen,
  appZoom: state.globals.appZoom,
});

const mapDispatchToProps = {
  _updateEditor: updateEditor,
  _loadUserData: () => loadUserData(),
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);
