import React, { useState } from "react";
import { Button, HTMLSelect, TextArea } from "@blueprintjs/core";
import styles from "./search.module.scss";
import HeadlineRandomizer from "./components/headline/HeadlineRandomizer";
import SearchSuggestions from "./components/search-suggest/SearchSuggestions";
import SelectBadge from "./components/select-badge/SelectBadge";
import TemplatesGridV2 from "../../template-generator/components/search-templates/templates-grid-v2";

const SearchPage = ({ onClose }: { onClose: () => void }) => {
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
          <TemplatesGridV2 searchQuery={searchQuery} baseUrl="/" />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
