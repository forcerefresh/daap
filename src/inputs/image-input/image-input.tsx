import {
  Button,
  FormGroup,
  InputGroup,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import {
  IImageInput,
  IUpdateInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { getMediaSrc } from "../../integration/utils/local-media";
import css from "./image-input.module.scss";
import { ImageItem } from "../../webslider-sdk/src/common/i-media-types";

export const ImageInputForm: React.FC<IImageInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  useEffect(() => {
    const imageItem = getMediaSrc("image", value.image);
    setPreviewSrc(imageItem.src!);
  }, [value]);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setLibraryOpen(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp3-overlay-scroll-container", // alert
  ]);

  const onFileNameChange = (filename: string) => {
    const newValue = cloneDeep(value);
    newValue.filename = filename;
    onChange(newValue);
  };

  const filename =
    value.filename === undefined
      ? extractFileName(value.image.filename!)
      : value.filename;

  return (
    <>
      <FormGroup label={displayName} labelFor="text-input" inline>
        {previewSrc ? (
          <>
            <div
              className={css.previewHolder}
              style={{ backgroundImage: `url(${previewSrc}` }}
            ></div>
            {value.image.size && (
              <div>
                {value.image.size?.width}px X {value.image.size?.height}px
              </div>
            )}
          </>
        ) : null}
        {value.image?.url ? (
          <div
            className="bp3-text-small"
            style={{ maxWidth: "250px", wordBreak: "break-all" }}
          >
            {value.image.url ? (
              <a target="_blank" href={value.image.url}>
                {value.image.url}
              </a>
            ) : null}
          </div>
        ) : null}

        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.LEFT}
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
              setLibraryOpen(true);
            }}
          >
            Browse
          </Button>
          <div ref={sharedRef}>
            <MediaLibraryPanel
              onRequestClose={() => {
                setLibraryOpen(false);
              }}
              className={css.mediaLibraryPanel}
              addObject={false}
              onSelect={(imageItem: { image: ImageItem }) => {
                const newValue = cloneDeep(value);
                newValue.image = imageItem.image;
                newValue.filename = extractFileName(imageItem.image.filename!);
                onChange(newValue);
                setLibraryOpen(false);
              }}
              panelsToShow={[Panels.MyImages, Panels.Images]}
            />
          </div>
        </Popover>
      </FormGroup>
      <FormGroup label={"File name"} labelFor="filename" inline>
        <InputGroup
          id="filename"
          placeholder=""
          value={filename}
          onChange={(event: any) => onFileNameChange(event.target.value)}
          onInput={(event: any) => onFileNameChange(event.target.value)}
        />
      </FormGroup>
    </>
  );
};

function extractFileName(url: string) {
  try {
    const parts = url.split("/");
    return parts[parts.length - 1].split(".")[0];
  } catch (ex: any) {
    return "";
  }
}
