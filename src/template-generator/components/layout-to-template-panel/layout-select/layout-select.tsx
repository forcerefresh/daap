import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Industry } from "../../../types/industry";
import { getIndustriesOptionFromThree } from "../industry-utils";

import css from "./layout-select.module.scss";
import { color } from "html2canvas/dist/types/css/types/color";
import { LayoutReviewStatus } from "../../../types/layout";

// export interface Film {
//     title: string;
//     year: number;
//     rank: number;
// }

// const TOP_100_FILMS: Film[] = [
//     { title: "The Shawshank Redemption", year: 1994 },
//     { title: "The Godfather", year: 1972 },
//     // ...
// ].map((f, index) => ({ ...f, rank: index + 1 }));

const filterFilm: ItemPredicate<LayoutOptionType> = (
  query,
  industryOption,
  _index,
  exactMatch,
) => {
  const normalizedTitle = industryOption.label.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderFilm: ItemRenderer<LayoutOptionType> = (
  film,
  { handleClick, handleFocus, modifiers, query },
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  let color = "";

  if (film.disabled) {
    color = "gray";
  } else if (film.reviewState === LayoutReviewStatus.REJECTED) {
    color = "#e86d0d";
  } else if (film.reviewState === LayoutReviewStatus.ACCEPTED_GOOD) {
    color = "#00a400";
  } else if (film.reviewState === LayoutReviewStatus.ACCEPTED_EXCELLENT) {
    color = "lightgreen";
  }

  return (
    <MenuItem
      style={{
        color,
        marginLeft: film.disabled ? "opx" : "20px",
      }}
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={film.value}
      label={film.label.toString()}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={`${film.label}`}
    />
  );
};

type LayoutOptionType = {
  label: string;
  value: string;
  disabled?: boolean;
  reviewState: LayoutReviewStatus;
};

export const LayoutSelect = ({
  layoutOptions,
  value,
  onChange,
}: {
  layoutOptions: LayoutOptionType[];
  value: string | undefined;
  onChange: (value: string) => void;
  randomButton?: boolean;
}) => {
  const [selected, setSelected] = React.useState<
    LayoutOptionType | undefined
  >();

  const selectedOption = React.useMemo(() => {
    return layoutOptions.find((item) => item.value === value);
  }, [value, layoutOptions]);

  let color = "";

  if (selectedOption?.disabled) {
    color = "gray";
  } else if (selectedOption?.reviewState === LayoutReviewStatus.REJECTED) {
    color = "#e86d0d";
  } else if (selectedOption?.reviewState === LayoutReviewStatus.ACCEPTED_GOOD) {
    color = "#00a400";
  } else if (
    selectedOption?.reviewState === LayoutReviewStatus.ACCEPTED_EXCELLENT
  ) {
    color = "lightgreen";
  }

  return (
    <>
      <Select<LayoutOptionType>
        items={layoutOptions}
        itemPredicate={filterFilm}
        itemRenderer={renderFilm}
        noResults={
          <MenuItem
            disabled={true}
            text="No results."
            roleStructure="listoption"
          />
        }
        onItemSelect={(item) => {
          onChange(item.value);
        }}
        popoverProps={{
          popoverClassName: css.selectPopover,
          minimal: true,
          modifiers: {
            preventOverflow: { enabled: true },
            flip: { enabled: true },
          },
        }}
      >
        <Button
          style={{ marginTop: "10px", marginBottom: "10px" }}
          // text={ ?? "Select a industry"}
          rightIcon="double-caret-vertical"
        >
          {selectedOption?.disabled ? (
            <span style={{ color: "gray" }}>{selectedOption?.label}</span>
          ) : (
            <span style={{ color }}>{selectedOption?.label} </span>
          )}
        </Button>
      </Select>
      <Button
        onClick={() => {
          const options = layoutOptions.filter((item) => !item.disabled);
          const idx = randomBetween(1, options.length - 1);
          onChange(options[idx].value);
        }}
      >
        Random
      </Button>
    </>
  );
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
