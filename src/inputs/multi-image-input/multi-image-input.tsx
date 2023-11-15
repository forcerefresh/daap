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
import { getMediaSrc } from "../../integration/utils/local-media";
import MediaLibraryPanel, {
  Panels,
  SelectionType,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import {
  IImageInputValue,
  IMultiImageInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { getImageField, getTextField } from "../input-utils";
import css from "./multi-image-input.module.scss";

export const MultiImageInputForm: React.FC<IMultiImageInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange = noop } = props;

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [multiSelectLibraryOpenLocal, setMultiSelectLibraryOpenLocal] =
    useState(false);
  const [multiSelectLibraryOpenLibrary, setMultiSelectLibraryOpenLibrary] =
    useState(false);

  const [currentIndex, setCurrentIndex] = useState(-1);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setLibraryOpen(false);
    setMultiSelectLibraryOpenLocal(false);
    setMultiSelectLibraryOpenLibrary(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp5-overlay-scroll-container", // alert
  ]);

  const renderAddLocalBtn = () => {
    return (
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.LEFT}
        modifiers={{ preventOverflow: { enabled: true } }}
        usePortal={true}
        minimal
        popoverClassName={css.mediaLibraryPanelPopup}
        isOpen={multiSelectLibraryOpenLocal}
        content={
          <div ref={sharedRef}>
            <MediaLibraryPanel
              selectionType={SelectionType.Multiple}
              onRequestClose={() => {
                setMultiSelectLibraryOpenLocal(false);
              }}
              className={css.mediaLibraryPanel}
              addObject={false}
              onSelect={(items) => {
                const newValue = [...value, ...items];
                onChange(newValue);
                setLibraryOpen(false);
              }}
              panelsToShow={[Panels.MyImages]}
            />
          </div>
        }
      >
        <Button
          small
          minimal
          className={css.addImagesButton}
          icon={"folder-open"}
          onClick={() => {
            setMultiSelectLibraryOpenLocal(true);
          }}
        >
          Select Local Images
        </Button>
      </Popover>
    );
  };

  const renderAddLibraryBtn = () => {
    return (
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.LEFT}
        modifiers={{ preventOverflow: { enabled: true } }}
        usePortal={true}
        minimal
        popoverClassName={css.mediaLibraryPanelPopup}
        isOpen={multiSelectLibraryOpenLibrary}
        content={
          <div ref={sharedRef}>
            <MediaLibraryPanel
              selectionType={SelectionType.Multiple}
              onRequestClose={() => {
                setMultiSelectLibraryOpenLibrary(false);
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
        }
      >
        <Button
          small
          minimal
          className={css.addImagesButton}
          icon={"folder-open"}
          onClick={() => {
            setMultiSelectLibraryOpenLibrary(true);
          }}
        >
          Select Library Images
        </Button>
      </Popover>
    );
  };

  const renderAddUrlBtn = () => {
    return (
      <Button
        small
        minimal
        className={css.addImagesButton}
        icon={"add"}
        onClick={() => {
          const newValue = [
            ...value,
            ...[{ image: { sourceType: "url", filename: "" } }],
          ];
          onChange(newValue);
          setLibraryOpen(false);
        }}
      >
        Add Url Image
      </Button>
    );
  };

  // TODO: IMPORTANT
  const renderRow = (oneImage: IImageInputValue, idx: number) => {
    return (
      <div className={css.row}>
        <div className={css.imageName}>Image {idx + 1}</div>
        {getImageField("", oneImage, (val) => {
          const newValue = cloneDeep(value);
          newValue[idx] = val;
          onChange(newValue);
        })}
        <Button
          className={css.deleteBtn}
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
  };

  return (
    <FormGroup label={displayName} inline className={css.main}>
      {value.map(renderRow)}
      {renderAddLocalBtn()}
      {renderAddLibraryBtn()}
      {renderAddUrlBtn()}
    </FormGroup>
  );
};
