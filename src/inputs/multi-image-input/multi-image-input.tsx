import {
  Button,
  FormGroup,
  InputGroup,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useRef, useState } from "react";
import MediaLibraryPanel, {
  Panels,
  SelectionType,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { IImageInputValue, IMultiImageInput, IUpdateInput } from "../types";
import css from "./multi-image-input.module.scss";

export const MultiImageInputForm: React.FC<IMultiImageInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange = noop } = props;

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [multiSelectLibraryOpen, setMultiSelectLibraryOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(-1);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setLibraryOpen(false);
    setMultiSelectLibraryOpen(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp3-overlay-scroll-container", // alert
  ]);

  const renderAddBtn = () => {
    return (
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.LEFT}
        modifiers={{ preventOverflow: { enabled: true } }}
        boundary={"window"}
        usePortal={true}
        minimal
        popoverClassName={css.mediaLibraryPanelPopup}
        isOpen={multiSelectLibraryOpen}
      >
        <Button
          small
          minimal
          className={css.addImagesButton}
          icon={"folder-open"}
          onClick={() => {
            setMultiSelectLibraryOpen(true);
          }}
        >
          Add images
        </Button>
        <div ref={sharedRef}>
          <MediaLibraryPanel
            selectionType={SelectionType.Multiple}
            onRequestClose={() => {
              setMultiSelectLibraryOpen(false);
            }}
            className={css.mediaLibraryPanel}
            addObject={false}
            onSelect={(items) => {
              const newValue = [...value, ...items];
              onChange(newValue);
              setLibraryOpen(false);
            }}
            panelsToShow={[Panels.Images]}
          />
        </div>
      </Popover>
    );
  };

  const renderRow = (oneValue: IImageInputValue, idx: number) => (
    <div key={idx} className={css.row}>
      <InputGroup
        readOnly={true}
        placeholder="Placeholder text"
        value={oneValue.url}
        title={oneValue.url}
        //onClick={handleClick}
        //onChange={(event: any) => onChange(event.target.value)}
        //onInput={(event: any) => onInput(event.target.value)}
      />
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.RIGHT}
        modifiers={{ preventOverflow: { enabled: true } }}
        boundary={"window"}
        usePortal={true}
        minimal
        popoverClassName={css.mediaLibraryPanelPopup}
        isOpen={libraryOpen}
      >
        <Button
          small
          minimal
          className={css.browseButton}
          icon={"folder-open"}
          onClick={() => {
            console.log(idx);
            setCurrentIndex(idx);
            setLibraryOpen(true);
          }}
        ></Button>
        <div ref={sharedRef}>
          <MediaLibraryPanel
            onRequestClose={() => {
              setLibraryOpen(false);
            }}
            className={css.mediaLibraryPanel}
            addObject={false}
            onSelect={(item) => {
              console.log(idx);
              const newValue = cloneDeep(value);
              newValue[currentIndex].url = (item.initialValues as any).url;
              newValue[currentIndex].isPlaceholder = false;
              onChange(newValue);
              setLibraryOpen(false);
            }}
            panelsToShow={[Panels.Images]}
          />
        </div>
      </Popover>

      <Button
        className={css.deleteColorBtn}
        minimal
        onClick={() => {
          value.splice(idx, 1);
          onChange(value);
        }}
        small={true}
        icon="delete"
      ></Button>
    </div>
  );

  return (
    <FormGroup label={displayName} inline>
      {value.map(renderRow)}
      {renderAddBtn()}
    </FormGroup>
  );
};
