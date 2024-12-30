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
import { IImageInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { getMediaSrc } from "../../integration/utils/local-media";
import css from "./image-input.module.scss";
import { ImageItem } from "webslider-sdk/lib/common/i-media-types";
import { getButtonGroupField, getTextArea, getTextField } from "../input-utils";
import { logger } from "webslider-sdk/lib/utils/logger/logger";

export const ImageInputForm: React.FC<IImageInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;
  const sourceType = value.image.sourceType || "local";

  logger.app.log(value);
  const [libraryOpen, setLibraryOpen] = useState(false);
  // const [previewSrc, setPreviewSrc] = useState("");

  const previewSrc = getMediaSrc("image", value.image || {})?.src;

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setLibraryOpen(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp5-overlay-scroll-container", // alert
  ]);

  const onFileNameChange = (filename: string) => {
    const newValue = cloneDeep(value);
    newValue.filename = filename;
    onChange(newValue);
  };

  const onUrlChange = (url: string) => {
    const newValue = cloneDeep(value);
    newValue.image.url = url;
    onChange(newValue);
  };

  const filename =
    value.filename === undefined
      ? extractFileName(value.image.filename!)
      : value.filename;

  return (
    <>
      <FormGroup
        label={displayName}
        labelFor="text-input"
        inline
        className={css.main}
      >
        {/* {getButtonGroupField(
          "",
          sourceType,
          (sourceType: string) => {
            const valueClone = cloneDeep(value);
            valueClone.image.sourceType = sourceType;
            onChange(valueClone);
          },
          [
            { value: "local", label: "Images" },
            { value: "library", label: "Library" },
            { value: "url", label: "Url" },
          ]
        )} */}
        {previewSrc ? (
          <>
            <div
              className={css.previewHolder}
              style={{ backgroundImage: `url('${previewSrc}'` }}
            ></div>
            {value.image.size && (
              <div>
                {value.image.size?.width}px X {value.image.size?.height}px
              </div>
            )}
          </>
        ) : null}
        {sourceType === "library" ? (
          <div
            className="bp5-text-small"
            style={{ maxWidth: "250px", wordBreak: "break-all" }}
          >
            {value.image.url ? (
              <a target="_blank" href={value.image.url}>
                {value.image.url}
              </a>
            ) : null}
          </div>
        ) : null}

        {sourceType === "url"
          ? getTextArea(
              "",
              value.image.url,
              (url) => {
                onUrlChange(url || "");
              },
              "",
              {
                disabledDebounce: true,
              }
            )
          : null}

        {sourceType === "local" || sourceType === "library" ? (
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            position={Position.LEFT}
            modifiers={{ preventOverflow: { enabled: true } }}
            usePortal={true}
            minimal
            popoverClassName={css.mediaLibraryPanelPopup}
            isOpen={libraryOpen}
            content={
              <div ref={sharedRef}>
                <MediaLibraryPanel
                  onRequestClose={() => {
                    setLibraryOpen(false);
                  }}
                  className={css.mediaLibraryPanel}
                  addObject={false}
                  onSelect={(imageItem: { image: ImageItem }) => {
                    const newValue = cloneDeep(value);
                    newValue.image = { ...imageItem.image };
                    newValue.filename = extractFileName(
                      imageItem.image.filename!
                    );
                    onChange(newValue);
                    setLibraryOpen(false);
                  }}
                  panelsToShow={[
                    ...(sourceType === "local" ? [Panels.MyImages] : []),
                    ...(sourceType === "library" ? [Panels.Images] : []),
                  ]}
                />
              </div>
            }
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
          </Popover>
        ) : null}
      </FormGroup>

      {/* {sourceType === "local" || sourceType === "library" ? (
        <div className={css.fileNameHolder}>
          {getTextField("Filename", filename, onFileNameChange, "", {
            disabled:
              (sourceType === "local" && !value.image.id) ||
              (sourceType === "library" && !value.image.url),
          })}
        </div>
      ) : null} */}
    </>
  );
};

function extractFileName(filename: string) {
  return filename;

  try {
    const idx = filename.lastIndexOf(".");
    if (idx === -1) return filename;
    return filename.substr(0, idx);
  } catch (ex: any) {
    return "";
  }
}
