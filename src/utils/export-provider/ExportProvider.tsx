import React, { useState } from "react";
import ExportStage from "./ExportStage";
import JSZip from "jszip";
import FileSaver from "file-saver";
import * as htmlToImage from "html-to-image";
import { AppToaster } from "../components/app-toaster/AppToaster";
import { logger } from "webslider-sdk/lib/utils/logger/logger";

export const ExportContext = React.createContext({
  requestExport: () => {},
});

export const ExportProvider = (
  props: { children?: React.ReactNode }
) => {
  const [request, setRequest] = useState(false);

  const requestExport = () => {
    setRequest(true);
  };

  const onSlideStarted = () => {
    const holderEl = document.getElementsByClassName("export-stage-div")[0] as
      | HTMLElement
      | undefined;

    htmlToImage
      .toBlob(holderEl!, { quality: 0.95 })
      .then(
        function (blobPng) {
          const zip = new JSZip();
          if (blobPng) {
            zip.file("slika-1.png", blobPng);
            zip.generateAsync({ type: "blob" }).then(function (content) {
              FileSaver.saveAs(content, "download.zip");
              setRequest(false);
            });

            return;
          }

          throw Error(
            "Something went wrong. Image creation has failed (1). Please try again."
          );
        },
        (reason) => {
          logger.app.warn("ExportProvider: image creation failed", reason);
          throw Error(
            "Something went wrong. Image creation has failed (2). Please try again."
          );
        }
      )
      .catch((err) => {
        logger.app.warn("ExportProvider: export failed", err);
        AppToaster.show({ message: err?.toString?.(), intent: "danger" });
      });
  };
  return (
    <ExportContext.Provider value={{ requestExport }}>
      {props.children}
      {request && (
        <ExportStage previewState={{} as any} onSlideStarted={onSlideStarted} />
      )}
    </ExportContext.Provider>
  );
};
