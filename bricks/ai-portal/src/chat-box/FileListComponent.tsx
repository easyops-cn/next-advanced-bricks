import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { WrappedIcon } from "./bricks";
import type { FileItem } from "./interfaces";
import {
  formatFileSize,
  getFileTypeAndIcon,
} from "../cruise-canvas/utils/file";

export interface FileListComponentProps {
  files: FileItem[];
  onRemove: (uid: number, abortController: AbortController | undefined) => void;
  onAdd: () => void;
}

export function FileListComponent({
  files,
  onRemove,
  onAdd,
}: FileListComponentProps) {
  const showAsImage = files.every((file) =>
    file.file.type.startsWith("image/")
  );

  return (
    <ul className="files">
      {files.map((file) => (
        <FileComponent
          {...file}
          key={file.uid}
          showAsImage={showAsImage}
          onRemove={onRemove}
        />
      ))}
      <li>
        <button className="btn-add-file" onClick={onAdd}>
          <WrappedIcon lib="antd" icon="plus" />
        </button>
      </li>
    </ul>
  );
}

interface FileComponentProps extends FileItem {
  showAsImage?: boolean;
  onRemove: (uid: number, abortController: AbortController | undefined) => void;
}

function FileComponent({
  uid,
  file,
  status,
  abortController,
  showAsImage,
  onRemove,
}: FileComponentProps) {
  const [type, icon] = getFileTypeAndIcon(file.type, file.name);
  const size = formatFileSize(file.size);
  const isImage = file.type.startsWith("image/");
  const [image, setImage] = useState<string | undefined>();

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setImage(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImage(undefined);
    }
  }, [file, isImage]);

  const buttonRemove = (
    <button
      className="file-remove"
      onClick={() => {
        onRemove(uid, abortController);
      }}
    >
      <WrappedIcon lib="antd" theme="filled" icon="close-circle" />
    </button>
  );

  if (showAsImage) {
    return (
      <li
        className={classNames("file as-image", { failed: status === "failed" })}
      >
        <img className="file-image" src={image} />
        {status === "uploading" && (
          <div className="file-overlay">
            <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
          </div>
        )}
        {status === "failed" && (
          <div className="file-overlay">Upload failed</div>
        )}
        {buttonRemove}
      </li>
    );
  }

  return (
    <li className={classNames("file", { failed: status === "failed" })}>
      {isImage ? (
        <img className="file-image" src={image} width={44} height={44} />
      ) : (
        <img className="file-icon" src={icon} width={26} height={32} />
      )}
      <div className="file-content">
        <div className="file-name">{file.name}</div>
        <div className="file-metadata">
          <span className="file-status">
            {`${status === "uploading" ? "Uploading..." : status === "failed" ? "Upload failed" : type}`}
          </span>
          {` · ${size}`}
        </div>
      </div>
      {buttonRemove}
    </li>
  );
}
