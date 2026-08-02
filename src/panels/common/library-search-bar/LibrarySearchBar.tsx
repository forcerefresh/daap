import React from "react";
import { Button, InputGroup } from "@blueprintjs/core";

type LibrarySearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  showSearchButton?: boolean;
  className?: string;
};

export const LibrarySearchBar = (props: LibrarySearchBarProps) => {
  const {
    value,
    onChange,
    onSearch,
    placeholder = "Search...",
    showSearchButton = true,
    className,
  } = props;

  return (
    <InputGroup
      large
      leftIcon="search"
      placeholder={placeholder}
      value={value}
      className={className}
      rightElement={
        showSearchButton ? (
          <Button large icon="arrow-right" onClick={onSearch} />
        ) : undefined
      }
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.currentTarget.value);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") onSearch();
      }}
    />
  );
};
