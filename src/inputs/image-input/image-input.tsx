import {
  Button,
  FormGroup,
  Portal,
} from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useRef, useState } from "react";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import {
  IImageInput,
  IImageInputValue,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { getMediaSrc } from "../../integration/utils/local-media";
import css from "./image-input.module.scss";
import {
  SaaSMediaData,
} from "webslider-sdk/lib/common/i-media-types";
import { getSelectField } from "../input-utils";

export const ImageInputForm: React.FC<IImageInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;
  const sourceType = value?.sourceType || "local";

  const [libraryOpen, setLibraryOpen] = useState(false);

  const imageUrl = getMediaSrc(value as unknown as SaaSMediaData);

  const sharedRef = useRef(null);
  useOnClickOutside(sharedRef, () => setLibraryOpen(false), [
    "image-preview-popover",
    "color-picker-holder",
    "bp5-overlay-scroll-container",
    "media-modal",
  ]);

  const isVector =
    (value?.mediaSizes?.[0].sourceFilename ?? "").indexOf(".svg") !== -1;

  return (
    <>
      <FormGroup
        label={displayName}
        labelFor="text-input"
        inline
        className={css.main}
      >
        {imageUrl ? (
          <>
            <div
              className={css.previewHolder}
              style={{ backgroundImage: `url('${imageUrl}'` }}
            ></div>
            {value?.width && value?.height ? (
              <div>
                {value.width} x {value.height}
              </div>
            ) : null}
          </>
        ) : null}

        {sourceType === "local" || sourceType === "library" ? (
          <div>
            <Button
              small
              minimal
              className={css.browseButton}
              icon={"folder-open"}
              onClick={() => {
                setLibraryOpen(true);
              }}
            >
              Browse images
            </Button>
            <Portal>
              {libraryOpen && (
                <div ref={sharedRef}>
                  <MediaLibraryPanel
                    onRequestClose={() => {
                      setLibraryOpen(false);
                    }}
                    addObject={false}
                    onSelect={(mediaItem: { media: SaaSMediaData }) => {
                      const newValue = cloneDeep(mediaItem.media);
                      newValue.sizeType = value?.sizeType || "original";
                      onChange(newValue);
                      setLibraryOpen(false);
                    }}
                    panelsToShow={
                      (isVector
                        ? [Panels.MyVectors, [Panels.Vectors]]
                        : [Panels.MyImages, [Panels.Images]]) as Panels[]
                    }
                  />
                </div>
              )}
            </Portal>
          </div>
        ) : null}
      </FormGroup>

      {value &&
        value.mediaSizes &&
        (value.format as string) !== "svg" &&
        getSelectField(
          "Size",
          value?.sizeType ?? "original",
          getSizeOptions(value.mediaSizes),
          (size: string) => {
            const valueClone = cloneDeep(value);
            valueClone.sizeType = size;
            onChange(valueClone);
          },
        )}
    </>
  );
};

function getSizeOptions(mediaSizes: IImageInputValue["mediaSizes"]) {
  return mediaSizes.map((imageSize) => {
    let size = "";
    if (imageSize.width) {
      size = " - " + imageSize.width + "x" + imageSize.height;
    }
    return {
      label: imageSize.sizeType + size,
      value: imageSize.sizeType,
    };
  });
}
