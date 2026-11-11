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
import { IAudioInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { getButtonGroupField, getTextArea } from "../input-utils";
import css from "./audio-input.module.scss";

export const AudioInputForm: React.FC<IAudioInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;
  const sourceType = value.audio.sourceType || "local";

  const [libraryOpen, setLibraryOpen] = useState(false);

  const previewSrc = getMediaSrc(value.audio as unknown as SaaSMediaData);

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
    newValue.audio.url = url;
    onChange(newValue);
  };

  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      {getButtonGroupField(
        "",
        value.audio.sourceType || "local",
        (sourceType: string) => {
          const valueClone = cloneDeep(value);
          valueClone.audio.sourceType = sourceType;
          onChange(valueClone);
        },
        [
          { value: "local", label: "Local" },
          { value: "url", label: "Url" },
        ]
      )}

      {previewSrc ? <div>{previewSrc}</div> : null}

      {sourceType === "url"
        ? getTextArea(
            "",
            value.audio.url,
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
              onSelect={(audioItem) => {
                const newValue = cloneDeep(value);
                newValue.audio = audioItem.media as unknown as typeof value.audio;
                newValue.filename = audioItem.media.filename!;

                onChange(newValue);
                setLibraryOpen(false);
              }}
              panelsToShow={[Panels.MyAudios]}
            />
          </div>
        </Popover>
      ) : null}
    </FormGroup>
  );
};
