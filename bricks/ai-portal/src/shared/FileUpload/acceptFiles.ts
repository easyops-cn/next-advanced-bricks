export function acceptFiles(accept: string, files: File[]) {
  const acceptedTypes = accept.split(",").map((type) => type.trim());
  const allFilesAccepted = files.every((file) => {
    const mimeType = file.type;
    return acceptedTypes.some((type) => {
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
  });
  return allFilesAccepted;
}
