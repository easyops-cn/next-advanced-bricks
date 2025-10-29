import React, { forwardRef, useImperativeHandle, useRef } from "react";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { wrapBrick } from "@next-core/react-element";
import type { IconButton, IconButtonProps } from "../../icon-button";
import { K, t } from "./i18n";

const WrappedIconButton = wrapBrick<IconButton, IconButtonProps>(
  "ai-portal.icon-button"
);

const ICON_UPLOAD: GeneralIconProps = {
  lib: "lucide",
  icon: "paperclip",
};

export interface UploadButtonProps {
  accept?: string;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
}

export interface UploadButtonRef {
  requestUpload: () => void;
}

export const UploadButton = forwardRef(LegacyUploadButton);

function LegacyUploadButton(
  { accept, disabled, onChange }: UploadButtonProps,
  ref: React.Ref<UploadButtonRef>
) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onChange?.(Array.from(files));
    }
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
        accept={accept}
        multiple
        hidden
        ref={inputRef}
        onChange={handleInputChange}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
      <WrappedIconButton
        variant="light"
        className="btn-upload"
        icon={ICON_UPLOAD}
        tooltip={t(K.UPLOAD_FILES)}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      />
    </>
  );
}
