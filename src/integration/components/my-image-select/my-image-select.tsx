import { Button, Dialog, Spinner, Text } from "@blueprintjs/core";
import { remove } from "lodash-es";
import { stringify } from "querystring";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { getSelectField, getTextField } from "../../../inputs/input-utils";
import {
  getMyUploadComponentProps,
  IntegrationContext,
} from "../../../integration";
import {
  MediaDataInfo,
  MediaType,
} from "../../../webslider-sdk/src/common/i-media-types";
import { AppToaster } from "../../../utils/components/app-toaster/AppToaster";
import { getImageTags } from "../../../utils/tags/tags";
import { formatBytes, getCroppedFileName } from "../../../utils/utils";
import {
  dzAcceptStyle,
  dzBaseStyle,
  dzFocusedStyle,
  dzRejectStyle,
} from "./common-styles";
import css from "./my-image-select.module.scss";
import { logger } from "../../../webslider-sdk/src/utils/logger/logger";

export interface UploadFileInfo {
  tag: string;
  title: string;
  filename: string;
  uploaded?: boolean;
}
/*
interface MyImageSelectProps {
  onComplete: () => void;
  onStop: () => void;
}
*/
export const MyImageSelect: React.FC<getMyUploadComponentProps> = (props) => {
  const { onStop, onComplete, type } = props;
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept:
      type === "image"
        ? "image/jpeg, image/png, image/gif"
        : type === "video"
        ? "video/mp4"
        : type === "vector"
        ? "image/svg+xml"
        : type === "extension"
        ? "application/zip"
        : undefined,
  });
  const [formData, setFormData] = useState<UploadFileInfo[]>([]);

  const style = useMemo(
    () => ({
      ...dzBaseStyle,
      ...(isFocused ? dzFocusedStyle : {}),
      ...(isDragAccept ? dzAcceptStyle : {}),
      ...(isDragReject ? dzRejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  useEffect(() => {
    const arr: UploadFileInfo[] = [];
    acceptedFiles.forEach((file) => {
      arr.push({ tag: "", title: "", filename: file.name });
    });
    setFormData(arr);
  }, [acceptedFiles]);

  const tagOptions = getImageTags().map((item) => ({
    label: item,
    value: item,
  }));
  tagOptions.unshift({ label: "Select tag", value: "" });

  const files = acceptedFiles.map((file, idx) => {
    if (formData[idx]?.uploaded) {
      return null;
    }
    return (
      <div key={file.name} className={css.uploadFileRow}>
        <div>
          {idx + 1}. {getCroppedFileName(file.name)}
        </div>
        <div>{formatBytes(file.size)}</div>
        {getTextField("", formData[idx]?.filename, (value: string) => {
          const newArr = [...formData];
          newArr[idx].filename = value;
          setFormData(newArr);
        })}
        {getTextField("", formData[idx]?.title, (value: string) => {
          const newArr = [...formData];
          newArr[idx].title = value;
          setFormData(newArr);
        })}
        {getSelectField("", formData[idx]?.tag, tagOptions, (value: string) => {
          const newArr = [...formData];
          newArr[idx].tag = value;
          setFormData(newArr);
        })}
      </div>
    );
  });
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const uploadFiles = () => {
    setUploadInProgress(true);
  };
  return (
    <>
      <section className="container">
        <div {...getRootProps({ style: style as any })}>
          <input {...getInputProps()} />
          {type === "image" ? (
            <p>
              Drag 'n' drop some Images here, or click to open select dialog.
            </p>
          ) : type === "video" ? (
            <p>
              Drag 'n' drop some Videos here, or click to open select dialog.
            </p>
          ) : type === "vector" ? (
            <p>
              Drag 'n' drop some SVG files here, or click to open select dialog.
            </p>
          ) : type === "extension" ? (
            <p>
              Drag 'n' drop Extension ZIP file here, or click to open select
              dialog.
            </p>
          ) : null}
        </div>
        {acceptedFiles.length > 0 && (
          <div className={css.uploadFileHolder}>
            <div className={css.uploadFileRow}>
              <div>File</div>
              <div>Size</div>
              <div>Filename</div>
              <div>Title</div>
              <div>Tag</div>
            </div>
            {files}
          </div>
        )}
        {acceptedFiles.length > 0 && (
          <div>
            <Button
              intent={"primary"}
              className={css.uploadButton}
              onClick={() => {
                uploadFiles();
              }}
            >
              Upload files
            </Button>
            <Button
              intent={"none"}
              className={css.uploadButton}
              onClick={() => {
                acceptedFiles.splice(0, 1000);
                setFormData([...formData]); //workaround to trigger render
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </section>

      {uploadInProgress && (
        <UploadDialog
          type={type}
          files={acceptedFiles}
          filesInfoArr={formData}
          onFile={(file: File) => {
            const newFormData = [...formData];
            const idx = acceptedFiles.indexOf(file);
            newFormData[idx].uploaded = true;
            setFormData([...formData]); //workaround to trigger render
          }}
          onCancel={() => {
            acceptedFiles.splice(0, 1000);
            setFormData([]);
            setUploadInProgress(false);
            AppToaster.show({
              intent: "warning",
              message: "File upload is stopped",
            });
            onStop();
          }}
          onAll={() => {
            acceptedFiles.splice(0, 1000);
            setFormData([]);
            setUploadInProgress(false);
            AppToaster.show({
              intent: "success",
              message: "File upload is done",
            });
            onComplete();
          }}
        />
      )}
    </>
  );
};

/** UPLOAD DIALOG */
interface UploadDialogProps {
  type: MediaType;
  files: File[];
  filesInfoArr: UploadFileInfo[];
  onFile: (file: File) => void;
  onAll: () => void;
  onCancel: () => void;
}
function UploadDialog(props: UploadDialogProps) {
  const { type, files, filesInfoArr, onFile, onAll, onCancel } = props;

  const totalFiles = files.length;

  const globalContext = useContext(IntegrationContext);
  const { upload } = globalContext.useMyMediaHook();

  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  // UNMOUNTED WORKAROUND
  const isUnMounted = useRef(false);
  useEffect(() => {
    return () => {
      isUnMounted.current = true;
    };
  }, []);

  useEffect(() => {
    const file = files[currentUploadIndex];
    const filesInfo = filesInfoArr[currentUploadIndex];
    //(file.name as any) = filesInfo.filename;
    logger.log(type);
    logger.log(filesInfo);
    upload(type, file, {
      tags: [filesInfo.tag],
      title: filesInfo.title,
      filename: filesInfo.filename,
    }).then((status) => {
      logger.log("uploaded");

      if (isUnMounted.current) return;

      onFile(file);

      if (currentUploadIndex + 1 === totalFiles) {
        onAll();
      } else {
        // THIS WILL START NEXT FILE UPLOAD
        setCurrentUploadIndex(currentUploadIndex + 1);
      }
    });
  }, [currentUploadIndex]);

  return (
    <Dialog isOpen={true} portalClassName={"bp3-dark"}>
      <div className={css.uploadFilesHolder}>
        <Text className={css.fileUploadTitle}>Upload files status</Text>

        <div>
          <Spinner size={18} className={css.inlineSpinner} />
          Currently uploading <strong>{currentUploadIndex + 1}</strong> of{" "}
          <strong>{totalFiles}</strong>
        </div>

        <div className="">
          Uploaded: <strong>{currentUploadIndex}</strong>
        </div>
        <div className={css.fileUploadActionHolder}>
          <Button
            intent="danger"
            onClick={() => {
              onCancel();
              //stop upload
            }}
          >
            Stop upload
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
