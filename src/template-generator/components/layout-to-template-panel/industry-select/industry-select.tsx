import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Industry } from "../../../types/industry";
import { getIndustriesOptionFromThree } from "../industry-utils";

import css from "./industry-select.module.scss";

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

const filterFilm: ItemPredicate<IndustryOptionType> = (
  query,
  industryOption,
  _index,
  exactMatch
) => {
  const normalizedTitle = industryOption.label.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderFilm: ItemRenderer<IndustryOptionType> = (
  film,
  { handleClick, handleFocus, modifiers, query }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
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

type IndustryOptionType = { label: string; value: string };

export const IndustrySelect = ({
  industriesOptions,
  value,
  onChange,
}: {
  industriesOptions: IndustryOptionType[];
  value: string | undefined;
  onChange: (value: string) => void;
}) => {
  const [selected, setSelected] = React.useState<
    IndustryOptionType | undefined
  >();

  const selectedOption = React.useMemo(() => {
    return industriesOptions.find((item) => item.value === value);
  }, [value, industriesOptions]);

  return (
    <Select<IndustryOptionType>
      items={industriesOptions}
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
        {selectedOption?.fullPath.split(" > ").map((item, idx) => {
          const isLast =
            idx === selectedOption?.fullPath.split(" > ").length - 1;

          const ret = isLast ? (
            <strong>{item}</strong>
          ) : (
            <span style={{ color: "#777777" }}>{item}</span>
          );
          return (
            <>
              {ret}
              <br />
            </>
          );
        })}
      </Button>
    </Select>
  );
};
