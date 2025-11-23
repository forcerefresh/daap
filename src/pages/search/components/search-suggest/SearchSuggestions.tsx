// [
//   "Try it out:",
//   "Quick searches:",
//   "Popular searches:",
//   "Try searching:",
//   "Examples:",
//   "Search examples:",
//   "Get inspired:",
//   "Find inspiration:",
//   "Popular templates:",
//   "Trending searches:",
//   "Need ideas?",
//   "Not sure where to start?",
//   "Search suggestions:",
//   "Common searches:",
//   "Try:",
//   "Popular:"
// ]

//[
//   "Popular searches this week",
//   "Most popular searches",
//   "Popular right now",
//   "Currently trending searches",
//   "Top search terms",
//   "Most searched templates",
//   "Popular template searches",
//   "Frequently searched terms",
//   "Popular design searches",
//   "Trending template searches"
// ]
import React from "react";
import { Button } from "@blueprintjs/core";
import styles from "./SearchSuggestions.module.scss";

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  onSuggestionClick,
}) => {
  const suggestions = [
    "Summer sale promotional posts",
    "Minimalist business templates",
    "Fitness workout inspiration",
  ];

  return (
    <div className={styles.suggestionsContainer}>
      <p className={styles.suggestionsLabel}>Popular searches this week</p>
      <div className={styles.buttonsContainer}>
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            minimal
            small
            className={styles.suggestionButton}
            onClick={() => onSuggestionClick(suggestion)}
            text={suggestion}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchSuggestions;
