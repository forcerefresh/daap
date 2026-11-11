import {
  Button,
  FormGroup,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useRef, useState } from "react";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { getMediaSrc } from "../../integration/utils/local-media";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { IUpdateInput, IVideoInput } from "webslider-sdk/lib/inputs/i-inputs";
import { getButtonGroupField, getTextArea } from "../input-utils";
import css from "./video-input.module.scss";

export const VideoInputForm: React.FC<IVideoInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;
  const sourceType = value.video.sourceType || "local";

  const [libraryOpen, setLibraryOpen] = useState(false);

  const previewSrc = getMediaSrc(value.previewImage as unknown as SaaSMediaData);

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

  const onUrlChange = (url: string) => {
    const newValue = cloneDeep(value);
    newValue.video.url = url;
    onChange(newValue);
  };

  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      {getButtonGroupField(
        "",
        value.video.sourceType || "local",
        (sourceType: string) => {
          const valueClone = cloneDeep(value);
          valueClone.video.sourceType = sourceType;
          onChange(valueClone);
        },
        [
          { value: "local", label: "Local" },
          { value: "url", label: "Url" },
        ]
      )}
      {previewSrc ? (
        <>
          <div
            className={css.previewHolder}
            style={{ backgroundImage: `url(${previewSrc}` }}
          ></div>
          {value.video.size && (
            <div>
              {value.video.size?.width}px X {value.video.size?.height}px
            </div>
          )}
        </>
      ) : null}

      {sourceType === "url"
        ? getTextArea(
            "",
            value.video.url,
            (url) => {
              onUrlChange(url || "");
            },
            "",
            {
              disabledDebounce: true,
            }
          )
        : null}

      {sourceType === "local" ? (
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
                onSelect={(videoItem) => {
                  const newValue = cloneDeep(value);
                  const vItem = videoItem as unknown as { video: typeof value.video; previewImage: typeof value.previewImage };
                  newValue.video = vItem.video;
                  newValue.previewImage = vItem.previewImage;
                  newValue.filename = vItem.video.filename!;

                  onChange(newValue);
                  setLibraryOpen(false);
                }}
                panelsToShow={[Panels.MyVideos]}
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
  );
};
