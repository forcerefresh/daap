import { Button, FormGroup } from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useRef, useState } from "react";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import {
  ISvgMaskInput,
  ISvgMaskInputValue,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { Portal } from "@blueprintjs/core";
import css from "./svg-mask-input.module.scss";
import { Panel } from "@blueprintjs/icons/lib/esm/generated/16px/paths";

export const SvgMaskInputForm: React.FC<ISvgMaskInput & IUpdateInput> = (
  props,
) => {
  const { displayName, value, onChange = noop } = props;

  const [libraryOpen, setLibraryOpen] = useState(false);

  const sharedRef = useRef(null);
  useOnClickOutside(sharedRef, () => setLibraryOpen(false), [
    "image-preview-popover",
    "bp5-overlay-scroll-container",
    "media-modal",
  ]);

  return (
    <FormGroup
      label={displayName}
      labelFor="svg-mask-input"
      inline
      className={css.main}
    >
      {value?.inlineSvgPreview ? (
        <div
          className={css.previewHolder}
          dangerouslySetInnerHTML={{ __html: value.inlineSvgPreview }}
        />
      ) : null}

      <Button
        small
        minimal
        className={css.browseButton}
        icon="folder-open"
        onClick={() => setLibraryOpen(true)}
      >
        Browse SVG masks
      </Button>

      <Portal>
        {libraryOpen && (
          <div ref={sharedRef}>
            <MediaLibraryPanel
              onRequestClose={() => setLibraryOpen(false)}
              addObject={false}
              onSelect={(mediaItem: { media: SaaSMediaData }) => {
                const newValue = cloneDeep(
                  mediaItem.media,
                ) as unknown as ISvgMaskInputValue;
                onChange(newValue);
                setLibraryOpen(false);
              }}
              panelsToShow={[Panels.MySvgMask, Panels.SvgMask]}
            />
          </div>
        )}
      </Portal>
    </FormGroup>
  );
};
