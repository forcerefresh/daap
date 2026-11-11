import { useState, useLayoutEffect } from "react";
import { Text } from "@blueprintjs/core";
import css from "./HeadlineRandomizer.module.scss";
const HeadlineRandomizer = () => {
  const [currentCombination, setCurrentCombination] = useState({
    headline: "",
    subheadline: "",
  });

  const headlineCombinations = [
    {
      headline: "Stop Designing From Scratch.",
      subheadline:
        "Search thousands of instantly editable templates, then export directly as a JPG.",
    },
    {
      headline: "Instantly Editable Instagram Templates.",
      subheadline:
        "Find your perfect layout, customize it in seconds, and export as a ready-to-post JPG.",
    },
    {
      headline: "Search. Customize. Post.",
      subheadline:
        "Your library of thousands of Instagram templates, all editable and ready to export as a JPG.",
    },
  ];

  const getRandomCombination = () => {
    const randomIndex = Math.floor(Math.random() * headlineCombinations.length);
    return headlineCombinations[randomIndex];
  };

  useLayoutEffect(() => {
    setCurrentCombination(getRandomCombination());
  }, []);

  return (
    <div>
      <Text tagName="h2" className={css.searchTitle}>
        {currentCombination.headline}
      </Text>
      <Text tagName="p" className={css.searchSubtitle}>
        {currentCombination.subheadline}
      </Text>
    </div>
  );
};

export default HeadlineRandomizer;
