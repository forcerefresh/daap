import React, { useEffect, useRef, useState } from "react";
import ExportStage from "./ExportStage";
import JSZip from "jszip";
import FileSaver from "file-saver";
import * as htmlToImage from "html-to-image";
import { AppToaster } from "../components/app-toaster/AppToaster";

export interface IBounds2 {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const ExportContext = React.createContext({
  requestExport: () => {},
  //   requestExport: () =>
  //props: { size: ISize; crop: IBounds2 }
  //Promise<{ image: Blob; imageIdx: number }[]>,
  // Promise<any>,
});

export const ExportProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  const [request, setRequest] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const requestExport = () => {
    setRequest(true);
  };

  // useEffect(() => {

  //   if (!request) return;

  //   setTimeout(() => {

  //     //   if (!rootRef.current) return;

  //     const holderEl = document.getElementsByClassName(
  //       "export-stage-div"
  //     )[0] as HTMLElement | undefined;

  //     htmlToImage.toBlob(holderEl!, { quality: 0.95 }).then(function (blobPng) {
  //       const zip = new JSZip();

  //       // const base64 = dataUrl.split("data:image/jpeg;base64,").pop();

  //       zip.file("slika-1.png", blobPng);
  //       zip.generateAsync({ type: "blob" }).then(function (content) {
  //         FileSaver.saveAs(content, "download.zip");
  //         setRequest(false);
  //       });
  //     });
  //   }, 500);
  // }, [rootRef, request]);

  const onSlideStarted = () => {
    const holderEl = document.getElementsByClassName("export-stage-div")[0] as
      | HTMLElement
      | undefined;

    htmlToImage
      .toBlob(holderEl!, { quality: 0.95 })
      .then(
        function (blobPng) {
          const zip = new JSZip();

          // const base64 = dataUrl.split("data:image/jpeg;base64,").pop();
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
          console.error(reason);
          throw Error(
            "Something went wrong. Image creation has failed (2). Please try again."
          );
        }
      )
      .catch((err) => {
        console.error(err);
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
