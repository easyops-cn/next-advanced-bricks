import { handleHttpError } from "@next-core/runtime";
import type { UploadOptions } from "../interfaces";
import { K, t } from "./i18n";

export function validateFiles(files: File[], options: UploadOptions) {
  const acceptedTypes = options.accept
    ? options.accept.split(",").map((type) => type.trim())
    : null;

  for (const file of files) {
    if (acceptedTypes) {
      const mimeType = file.type;
      const accepted = acceptedTypes.some((type) => {
        if (type === "*/*" || type === "*") {
          return true;
        }
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith("/*")) {
          const baseType = type.split("/")[0];
          return mimeType.startsWith(`${baseType}/`);
        }
        return mimeType === type;
      });
      if (!accepted) {
        handleHttpError(
          options.readableAccept
            ? t(K.SUPPORTED_FILE_TYPES, { types: options.readableAccept })
            : t(K.UNSUPPORTED_FILE_TYPE)
        );
        return false;
      }
    }

    if (options.maxSize && file.size > options.maxSize) {
      handleHttpError(
        options.readableMaxSize
          ? t(K.MAX_SIZE_EXCEEDED, { size: options.readableMaxSize })
          : t(K.MAX_SIZE_EXCEEDED_UNKNOWN)
      );
      return false;
    }
  }

  return true;
}
