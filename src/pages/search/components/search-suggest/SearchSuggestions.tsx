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
  // const suggestions = [
  //   "Summer sale promotional posts",
  //   "Minimalist business templates",
  //   "Fitness workout inspiration",
  // ];

  const suggestions = [
    "Fitness workout plan template",
    "Gym challenge Instagram post",
    "Healthy recipe carousel design",
    "Meal prep infographic template",
    "Beauty product launch post",
    "Skincare routine Instagram reel",
    "Modern real estate listing",
    "Agent anniversary celebration template",
    "Coffee shop menu design",
    "Cafe special offer post",
    "Fashion lookbook grid layout",
    "Clothing sale announcement template",
    "Tech app launch graphics",
    "Software tutorial carousel design",
    "Wedding photography portfolio template",
    "Client booking promotion post",
    "Online course promotion carousel",
    "Webinar registration template",
    "Travel destination highlight reel",
    "Hotel booking offer template",
    "Corporate report infographic design",
    "Team introduction carousel template",
    "Artist portfolio showcase layout",
    "Digital art process reel",
    "Eco-friendly product promo post",
    "Sustainability tips carousel",
    "Podcast episode cover template",
    "Show notes graphic design",
    "Car dealership sale post",
    "New model launch template",
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
