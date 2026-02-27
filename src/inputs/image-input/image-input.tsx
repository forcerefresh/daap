import {
  Button,
  FormGroup,
  InputGroup,
  Popover,
  PopoverInteractionKind,
  Portal,
  Position,
} from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useContext, useEffect, useRef, useState } from "react";
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
  ImageItem,
  SaaSMediaData,
} from "webslider-sdk/lib/common/i-media-types";
import {
  getButtonGroupField,
  getSelectField,
  getTextArea,
  getTextField,
} from "../input-utils";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { IntegrationContext } from "../../integration";

export const ImageInputForm: React.FC<IImageInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;
  const sourceType = value?.sourceType || "local";

  logger.app.log(value);
  const [libraryOpen, setLibraryOpen] = useState(false);
  // const [previewSrc, setPreviewSrc] = useState("");

  console.log("value---");
  console.log(value);
  const imageUrl = getMediaSrc(value);
  // const fileName = value?.mediaSizes.find(
  //   (size) => size.sizeType === "original"
  // )?.sourceFilename;
  // const imageUrl = `/api/v1/media/${fileName}`;

  // getMediaSrc("image", value || {})?.src;

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setLibraryOpen(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp5-overlay-scroll-container",
    "media-modal",
    // alert
  ]);

  // const onFileNameChange = (filename: string) => {
  //   const newValue = cloneDeep(value);
  //   newValue.filename = filename;
  //   onChange(newValue);
  // };

  // const onUrlChange = (url: string) => {
  //   const newValue = cloneDeep(value);
  //   newValue.image.url = url;
  //   onChange(newValue);
  // };

  // const filename =
  //   value.filename === undefined
  //     ? extractFileName(value.image.filename!)
  //     : value.filename;

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
        {/* {sourceType === "library" ? (
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
        ) : null} */}

        {/* {sourceType === "url"
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
          : null} */}

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
                    // className={css.mediaLibraryPanel}
                    addObject={false}
                    onSelect={(mediaItem: { media: SaaSMediaData }) => {
                      const newValue = cloneDeep(mediaItem.media);
                      newValue.sizeType = value?.sizeType || "original"; // keep existing size
                      onChange(newValue);
                      console.log("value---");
                      console.log(value);
                      console.log(newValue);
                      setLibraryOpen(false);
                    }}
                    panelsToShow={
                      isVector
                        ? [Panels.MyVectors, [Panels.Vectors]]
                        : [Panels.MyImages, [Panels.Images]]
                      // ...(sourceType === "local" ? [Panels.MyImages] : []),
                      // ...(sourceType === "library" ? [Panels.Images] : []),
                    }
                  />
                </div>
              )}
            </Portal>
          </div>
        ) : // <Popover
        //   interactionKind={PopoverInteractionKind.CLICK}
        //   position={Position.LEFT}
        //   modifiers={{ preventOverflow: { enabled: true } }}
        //   usePortal={true}
        //   minimal
        //   popoverClassName={css.mediaLibraryPanelPopup}
        //   isOpen={libraryOpen}
        //   content={
        //     <div ref={sharedRef}>
        //       <MediaLibraryPanel
        //         onRequestClose={() => {
        //           setLibraryOpen(false);
        //         }}
        //         className={css.mediaLibraryPanel}
        //         addObject={false}
        //         onSelect={(mediaItem: { media: SaaSMediaData }) => {
        //           const newValue = cloneDeep(mediaItem.media);
        //           newValue.sizeType = value?.sizeType; // keep existing size
        //           onChange(newValue);
        //           setLibraryOpen(false);
        //         }}
        //         panelsToShow={[
        //           ...(sourceType === "local" ? [Panels.MyImages] : []),
        //           ...(sourceType === "library" ? [Panels.Images] : []),
        //         ]}
        //       />
        //     </div>
        //   }
        // >
        //   <Button
        //     small
        //     minimal
        //     className={css.browseButton}
        //     icon={"folder-open"}
        //     onClick={() => {
        //       setLibraryOpen(true);
        //     }}
        //   >
        //     Browse images
        //   </Button>
        // </Popover>
        null}
      </FormGroup>

      {value &&
        value.mediaSizes &&
        value.format !== "svg" &&
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
