// istanbul ignore file: nothing logical except calling modern-screenshot.
import { http } from "@next-core/http";
import { domToCanvas } from "modern-screenshot";
import { getBasePath } from "@next-core/runtime";

export type UploadStatus = "uploading" | "done" | "error";

function deepQuerySelector(
  selector: string,
  root: Document | ShadowRoot = document
): HTMLElement | null {
  const result = root.querySelector<HTMLElement>(selector);
  if (result) return result;

  const hosts = root.querySelectorAll("*");
  for (const host of hosts) {
    if (host.shadowRoot) {
      const found = deepQuerySelector(selector, host.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

export function capture(
  selector?: string,
  backgroundColor?: string
): Promise<HTMLCanvasElement> {
  const target: HTMLElement | null = selector
    ? deepQuerySelector(selector)
    : document.body;
  if (!target) {
    throw new Error(`target not found: ${selector}`);
  }

  const scale = window.devicePixelRatio < 3 ? window.devicePixelRatio : 2;

  return domToCanvas(target, {
    backgroundColor: backgroundColor || undefined,
    scale,
    filter: (node: Node) => {
      if (node instanceof Element && node.tagName?.toLowerCase() === "use") {
        const href =
          node.getAttribute("href") ?? node.getAttribute("xlink:href");
        if (href) {
          const id = href.split("#")[1];
          if (id && /^\d/.test(id)) return false;
        }
      }
      return true;
    },
  });
}

export function downloadImage(
  canvas: HTMLCanvasElement,
  name = "image"
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const url = canvas.toDataURL("image/png");
      const image = new Image();
      image.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(image, 0, 0, image.width, image.height);

        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        const event = new MouseEvent("click");
        a.dispatchEvent(event);
      };
      image.src = url;
      resolve("succeed");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      reject("failed");
    }
  });
}

export function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise(function (resolve, reject) {
    canvas.toBlob(function (blob: Blob | null) {
      if (blob) {
        resolve(blob);
      } else {
        reject();
      }
    });
  });
}

export function uploadFile(
  file: File,
  bucketName: string
): Promise<{ data: { objectName: string } }> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const url = `${getBasePath()}api/gateway/object_store.object_store.PutObject/api/v1/objectStore/bucket/${bucketName}/object`;

  return http.request(url, {
    method: "PUT",
    body: formData,
  });
}
export function buildImageUrl(bucketName: string, objectName: string) {
  return `${getBasePath()}api/gateway/logic.object_store_service/api/v1/objectStore/bucket/${bucketName}/object/${objectName}`;
}
