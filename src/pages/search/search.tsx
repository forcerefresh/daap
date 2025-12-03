import React, { useState } from "react";
import { Alert, Button, HTMLSelect, TextArea } from "@blueprintjs/core";
import styles from "./search.module.scss";
import HeadlineRandomizer from "./components/headline/HeadlineRandomizer";
import SearchSuggestions from "./components/search-suggest/SearchSuggestions";
import SelectBadge from "./components/select-badge/SelectBadge";
import TemplatesGridV2 from "../../template-generator/components/search-templates/templates-grid-v2";
import { usePublicTemplate } from "../../template-generator/hooks/usePublicTemplate";
import { IDocument } from "../../store/reducers/document";
import { IMeta } from "../../store/reducers/meta";
import { connect } from "react-redux";
import {
  activateSlide,
  addNewObject,
  doClearHistory,
  openProject,
  selectForProperties,
  selectForPropertiesProps,
  selectSlides,
  setDevice,
  updateEditor,
  updateProjectMeta,
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

interface ISearchProps {
  onClose: () => void;
}

export type ISearchMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISearchProps;

const SearchPage = ({
  onClose,
  _updateProjectMeta,
  _openProject,
  _setDevice,
  _updateEditor,
  _doClearHistory,
  _activateSlide,
  _selectSlides,
  _selectForProperties,
}: ISearchMergedProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english-auto");
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const languages = [
    { value: "auto", label: "English (auto)" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "chinese", label: "Chinese" },
    { value: "japanese", label: "Japanese" },
  ];

  const documents = [
    { value: "auto", label: "Square post (auto)" },
    { value: "SocialMedia:Instagram:SquarePost", label: "Square post" },
    { value: "SocialMedia:Instagram:StoryReel", label: "Story/Reel" },
  ];

  const handleSearch = () => {
    setIsExpanded(true);
    console.log(
      "Searching for:",
      searchQuery,
      "in language:",
      selectedLanguage
    );
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

  const applyTemplate = (templateProject: any) => {
    debugger;

    const meta: IMeta = {
      id: undefined, //response.project.id,
      name: "pr+" + Math.random(),
      description: "",
      // modified: response.template.modified,
      // created: response.template.created,
      saveRevision: 0,
      //publishRevision: response.project.publishRevision,
    };
    _updateProjectMeta(meta);

    const project: {
      // NOTE: there are other props. We need only settings from project
      settings: ISettings;
      slides: IPages;
    } = templateProject;

    // const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

    const updatedProject = templateProject;

    _openProject(updatedProject);

    _setDevice(
      [...updatedProject.settings.breakpoints.breakpointsConfiguration]
        .reverse()
        .find((bc) => bc.enabled)?.type || "device-independent"
    );

    // missing extensions >>>
    const missingExtensions = getMissingExtensionsFromProject(
      templateProject.extensions
    );
    _updateEditor({ missingExtensions });
    if (missingExtensions.length > 0) {
      AppToaster.show({
        intent: "warning",
        message:
          "Missing Extension found! Go to Library > Extensions to install missing extensions.",
      });
    }
    // missing extensions <<<

    _doClearHistory();

    const slideIdToSelect = updatedProject.pages.pages[0];
    if (slideIdToSelect) {
      _activateSlide(slideIdToSelect);
      _selectSlides([slideIdToSelect]);
      _selectForProperties({ id: slideIdToSelect, type: "slide" });
    }

    _updateEditor({ sliderChanged: true, isExistingProject: false });

    _doClearHistory();

    preloadFonts(templateProject?.fonts ?? []);

    onClose();

    // _createNewProject();
    // _doClearHistory();
    // _initializeSlideAndLayer();
    // _updateEditor({ isExistingProject: false, sliderChanged: false });
    // if (isDiscartConfirmOpen) {
    //   setIsDiscartConfirmOpen(false);
    // }
  };

  const { getPublicTemplate } = usePublicTemplate();
  const handleUseTemplate = (publicTemplateId: string, lang: string) => {
    getPublicTemplate(publicTemplateId, lang).then((response) => {
      if (response?.data?.template) {
        applyTemplate(JSON.parse(response?.data?.template));
      } else {
        console.warn("Something went wrong!");
      }
    });
  };

  return (
    <div
      className={`${styles.searchPageContainer}  ${
        isExpanded ? styles.expanded : ""
      }`}
    >
      <Button
        minimal
        icon="cross"
        style={{ position: "absolute", right: "10px", top: "10px" }}
        onClick={onClose}
      ></Button>
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
              placeholder="Describe what you want to search for..."
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
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
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
            searchQuery={searchQuery}
            baseUrl="/"
            onUseTemplate={handleUseTemplate}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  // activeLayerId: state.project.selection.activeLayerId,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
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
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);
