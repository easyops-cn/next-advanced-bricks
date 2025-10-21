import React, { forwardRef, useImperativeHandle, useRef } from "react";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { WrappedIconButton } from "./bricks";
import type { FileItem } from "./interfaces";

const ICON_UPLOAD: GeneralIconProps = {
  lib: "lucide",
  icon: "paperclip",
};

let uid = 0;

export interface UploadButtonProps {
  onChange?: (files: FileItem[] | undefined) => void;
}

export interface UploadButtonRef {
  requestUpload: () => void;
}

export const UploadButton = forwardRef(LegacyUploadButton);

function LegacyUploadButton(
  { onChange }: UploadButtonProps,
  ref: React.Ref<UploadButtonRef>
) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    onChange?.(
      files
        ? Array.from(files).map((file) => ({
            uid: uid++,
            file,
            status: "ready",
          }))
        : undefined
    );
    e.target.value = "";
  };

  useImperativeHandle(ref, () => ({
    requestUpload: () => {
      inputRef.current?.click();
    },
  }));

  return (
    <>
      <input
        type="file"
        multiple
        hidden
        ref={inputRef}
        onChange={handleInputChange}
      />
      <WrappedIconButton
        variant="light"
        className="btn-upload"
        icon={ICON_UPLOAD}
        tooltip="Upload files"
        onClick={() => inputRef.current?.click()}
      />
    </>
  );
}
