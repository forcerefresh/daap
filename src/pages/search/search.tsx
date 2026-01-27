import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Button,
  H4,
  HTMLSelect,
  Icon,
  Spinner,
  TextArea,
  Text,
} from "@blueprintjs/core";
import styles from "./search.module.scss";
import HeadlineRandomizer from "./components/headline/HeadlineRandomizer";
import SearchSuggestions from "./components/search-suggest/SearchSuggestions";
import SelectBadge from "./components/select-badge/SelectBadge";
import TemplatesGridV2 from "../../template-generator/components/search-templates/templates-grid-v2";
import { IDocument } from "../../store/reducers/document";
import { IMeta } from "../../store/reducers/meta";
import { connect } from "react-redux";
import {
  activateSlide,
  addNewObject,
  doClearHistory,
  loadUserData,
  openProject,
  selectForProperties,
  selectForPropertiesProps,
  selectSlides,
  setDevice,
  updateEditor,
  updateProjectMeta,
  updateUserData,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { IStore } from "../../store/store";
import { ISettings } from "../../store/reducers/i-settings";
import { IPages } from "../../store/reducers/i-pages";

import {
  preloadFonts,
  updateProjectWithNewIds,
} from "../../utils/project/project-utils";
import { getMissingExtensionsFromProject } from "../../utils/extensions/extensions-utils";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import AccountButton from "../../integration/components/main-header/AccountButton";
import DaapLogo from "../../integration/components/main-header/daap-logo.svg?react";
import { account, IAccount } from "../../store/reducers/account";
import { useNavigate } from "react-router";
import { userInfo } from "os";
import "../../AppNew.scss";
import { identity } from "lodash-es";
import { getPendingTemplate } from "./utils/pending-template";
import SearchFooter from "./components/footer/SearchFooter";
import { Link } from "react-router-dom";

interface ISearchProps {
  onClose: () => void;
}

export type ISearchMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISearchProps;

const SearchPage = ({
  isAuthenticated,
  onClose,
  _updateProjectMeta,
  _openProject,
  _setDevice,
  _updateEditor,
  _doClearHistory,
  _activateSlide,
  _selectSlides,
  _selectForProperties,
  // _updateUserData,
  _loadUserData,
  account,
  theme,
}: ISearchMergedProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedDocumentType, setSelectedDocumentType] = useState(
    "SocialMedia:Instagram:SquarePost",
  );

  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  useEffect(() => {
    // Check for pending template
    const pendingTemplate = getPendingTemplate();

    if (account.userDataLoading && pendingTemplate) {
      setShowRedirectMessage(true);
    }

    if (!account.userDataLoading) {
      setShowRedirectMessage(false);
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

  // const [autoOpenLogin, setAutoOpenLogin] = useState(false);

  const handleSearch = () => {
    setIsExpanded(true);
    // Add your search logic here
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFocus = () => {
    setIsTextAreaFocused(true);
  };

  const handleBlur = () => {
    setIsTextAreaFocused(false);
  };

  // const applyTemplate = (templateProject: any) => {
  //   // debugger;

  //   const meta: IMeta = {
  //     id: undefined, //response.project.id,
  //     name: "pr+" + Math.random(),
  //     description: "",
  //     // modified: response.template.modified,
  //     // created: response.template.created,
  //     saveRevision: 0,
  //     //publishRevision: response.project.publishRevision,
  //   };
  //   _updateProjectMeta(meta);

  //   const project: {
  //     // NOTE: there are other props. We need only settings from project
  //     settings: ISettings;
  //     slides: IPages;
  //   } = templateProject;

  //   // const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

  //   const updatedProject = templateProject;

  //   _openProject(updatedProject);

  //   _setDevice(
  //     [...updatedProject.settings.breakpoints.breakpointsConfiguration]
  //       .reverse()
  //       .find((bc) => bc.enabled)?.type || "device-independent"
  //   );

  //   // missing extensions >>>
  //   const missingExtensions = getMissingExtensionsFromProject(
  //     templateProject.extensions
  //   );
  //   _updateEditor({ missingExtensions });
  //   if (missingExtensions.length > 0) {
  //     AppToaster.show({
  //       intent: "warning",
  //       message:
  //         "Missing Extension found! Go to Library > Extensions to install missing extensions.",
  //     });
  //   }
  //   // missing extensions <<<

  //   _doClearHistory();

  //   const slideIdToSelect = updatedProject.pages.pages[0];
  //   if (slideIdToSelect) {
  //     _activateSlide(slideIdToSelect);
  //     _selectSlides([slideIdToSelect]);
  //     _selectForProperties({ id: slideIdToSelect, type: "slide" });
  //   }

  //   _updateEditor({ sliderChanged: true, isExistingProject: false });

  //   _doClearHistory();

  //   preloadFonts(templateProject?.fonts ?? []);

  //   onClose();

  //   // _createNewProject();
  //   // _doClearHistory();
  //   // _initializeSlideAndLayer();
  //   // _updateEditor({ isExistingProject: false, sliderChanged: false });
  //   // if (isDiscartConfirmOpen) {
  //   //   setIsDiscartConfirmOpen(false);
  //   // }
  // };

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

  useLayoutEffect(() => {
    const root = document.getElementById("daap-forcerefresh-root");
    if (root) {
      root.className = `bp5-${theme}`;
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

  return (
    <>
      <>
        <div
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            height: "52px",
            padding: "6px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "40px",
          }}
        >
          {import.meta.env.VITE_APP_INTEGRATION === "saas" ? (
            <Link to={"/search"} style={{ outline: "none" }}>
              <DaapLogo className={styles.logo} />
            </Link>
          ) : (
            <DaapLogo className={styles.logo} />
          )}

          {/* <Link
            to={"https://learn.daap.forcerefresh.io/docs"}
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              // textDecoration: "none",
              // color: "inherit",
              gap: "6px",
            }}
          >
            <Text style={{ display: "inline" }}>Documentation</Text>
            <Icon
              icon="share"
              size={14}
              style={{
                opacity: 0,
                transition: "opacity 0.2s ease",
              }}
              className={styles.showOnHover}
            />
          </Link> */}
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
              // _updateUserData(undefined, { autoShowLoginPrompt: true });
              // // setAutoOpenLogin(true);
              // onClose();
            }}
          >
            Go to Editor
          </Button>

          {import.meta.env.VITE_APP_INTEGRATION === "saas" && (
            <AccountButton logoutOnly={true} />
          )}
        </div>
      </>

      <div
        className={`${styles.searchPageContainer}  ${
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                        onChange={setSelectedLanguage}
                        minimal={false}
                      />

                      <SelectBadge
                        label="Document"
                        options={documents} // Fixed: using documents array instead of languages
                        value={selectedDocumentType}
                        onChange={setSelectedDocumentType}
                        minimal={false}
                      />
                    </div>

                    <div className={styles.searchButtonContainer}>
                      <Button
                        intent="primary"
                        onClick={handleSearch}
                        className={styles.searchButton}
                        disabled={!searchQuery.trim()}
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
                    setSearchQuery(value);
                    setIsExpanded(true);
                  }}
                />
              )}

              {isExpanded && (
                <TemplatesGridV2
                  language={selectedLanguage}
                  searchQuery={searchQuery}
                  baseUrl="/"
                  onUseTemplate={handleUseTemplate}
                />
              )}
            </div>
          </>
        )}
        {!isExpanded && <SearchFooter />}
      </div>
      {showRedirectMessage && renderSpinner()}
    </>
  );
};

const mapStateToProps = (state: IStore) => ({
  // activeLayerId: state.project.selection.activeLayerId,
  theme: state.globals.theme,
  isAuthenticated:
    !!state.account.userData?.displayName && !state.account.userDataLoading,
  account: state.account,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any },
  ) => addNewObject(layerId, type, objectProps, values),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _openProject: (project: any) => openProject(project),
  _doClearHistory: () => doClearHistory(),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setDevice: setDevice,
  _updateEditor: updateEditor,
  _loadUserData: () => loadUserData(),

  // _updateUserData: (data: any, other: any) => updateUserData(data, other),
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);
