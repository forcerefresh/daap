import { Button } from "@blueprintjs/core";
import { stringify } from "querystring";
import React, { useEffect, useRef, useState } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { getSelectField, getTextField } from "../../../inputs/input-utils";
import { getImageTags } from "../../../utils/tags/tags";
import { formatBytes, getCroppedFileName } from "../../../utils/utils";
import css from "./my-image-select.module.scss";

interface UploadFileInfo {
  tag: string;
  title: string;
  filename: string;
}

interface MyImageSelectProps {
  onSelect: (data: any) => void;
}
export const ElectronMyImageSelect: React.FC<MyImageSelectProps> = (props) => {
  const { onSelect } = props;

  return (
    <div>
      <MyImageSelectDND />
    </div>
  );
};

function MyImageSelectDND() {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png, image/gif",
  });

  const [formData, setFormData] = useState<UploadFileInfo[]>([]);

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

  const files = acceptedFiles.map((file, idx) => (
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
  ));

  return (
    <section className="container">
      <div {...getRootProps({ className: css.dropzone })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
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
          <Button intent={"primary"} className={css.uploadButton}>
            Upload files
          </Button>
          <Button
            intent={"none"}
            className={css.uploadButton}
            onClick={() => {
              acceptedFiles.splice(0, 1000);
              setFormData([...formData]);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </section>
  );
}
