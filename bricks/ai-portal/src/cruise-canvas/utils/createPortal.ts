export function createPortal(rootId: string) {
  const portal = document.createElement("div");
  portal.dataset.rootId = rootId;
  portal.style.position = "absolute";
  portal.style.width = portal.style.height = "0";
  document.body.append(portal);
  return portal;
}
