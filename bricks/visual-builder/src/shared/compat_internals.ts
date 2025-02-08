// istanbul ignore file
import { __secret_internals as _internals } from "@next-core/runtime";
import type { BrickPackage } from "@next-core/types";

interface DLL {
  (moduleId: "tYg3"): {
    developHelper: {
      getBrickPackages?: () => BrickPackage[];
    };
  };
}

let __secret_internals = _internals;

// Make v3 bricks compatible with Brick Next v2.
try {
  const dll = (window as unknown as { dll?: DLL }).dll;
  if (
    dll &&
    window.BRICK_NEXT_VERSIONS?.["brick-container"]?.startsWith("2.")
  ) {
    const { developHelper: developHelperV2 } = dll("tYg3");
    __secret_internals = {
      getBrickPackagesById(id: string) {
        return developHelperV2
          .getBrickPackages?.()
          .find((pkg) => pkg.id === id);
      },
    } as any;
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.error("Try to use v2 runtime APIs failed:", e);
}

/**
 * The `__secret_internals` that is compatible in both v3 and v2.
 */
export const __compat_internals = __secret_internals;
