import {
  Button,
  FormGroup,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import { cloneDeep, debounce, noop, throttle, uniq } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RGBColor } from "react-color";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import {
  ISVGInput,
  IUpdateInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./svg-input.module.scss";

export const SVGInputForm: React.FC<ISVGInput & IUpdateInput> = (props) => {
  const { displayName, value, onInput = noop } = props;

  const [libraryOpen, setLibraryOpen] = useState(false);

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

  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customColors, setCustomColors] = useState<RGBColor[]>([]);

  return (
    <FormGroup label={displayName} labelFor="textarea-input">
      <div
        className={css.svgHolder}
        dangerouslySetInnerHTML={{ __html: value.source }}
      ></div>

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
            onSelect={(item) => {
              onInput({
                source: (item.initialValues as any).svg,
                colors: undefined,
                colorsType: "unique",
                disableCustomColors: false,
              });
              setLibraryOpen(false);
            }}
            panelsToShow={[Panels.MyVectors, Panels.Vectors]}
          />
        </div>
      </Popover>
    </FormGroup>
  );
};

function getColors(svgSource: string): RGBColor[] {
  let colors: string[] = [];
  svgSource.replace(/fill:(#[abcdef0-9]{6})/gi, function (v, c: string) {
    colors.push(c);
    return v;
  });
  svgSource.replace(/fill="(#[abcdef0-9]{6})/gi, function (v, c: string) {
    colors.push(c);
    return v;
  });

  colors = uniq(colors);

  return colors.map(hexToRGB);
}

function hexToRGB(hex: string, a?: number) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (a) {
    return { r, g, b, a };
  } else {
    return { r, g, b, a: 1 };
  }
}
