import type {
  MenuGroupData,
  MenuItemData,
  MenuItemDataApp,
  MenuItemDataCustom,
  MenuItemDataNormal,
  PlatformCategoryItem,
} from "./interfaces";

export function search(
  allMenuGroups: MenuGroupData[],
  q: string
): MenuGroupData[] {
  if (!q) {
    return allMenuGroups;
  }
  const lowerQ = q.toLowerCase();
  const groups: MenuGroupData[] = allMenuGroups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          switch (item.type) {
            case "app":
              return matchMenuItem<MenuItemDataApp>(item, lowerQ);
            case "custom":
              return matchMenuItem<MenuItemDataCustom>(item, lowerQ);
            case "dir": {
              const filteredSubItems = item.items
                .map((sub) =>
                  sub.type === "app"
                    ? matchMenuItem<MenuItemDataApp>(sub, lowerQ)
                    : sub.type === "custom"
                      ? matchMenuItem<MenuItemDataCustom>(sub, lowerQ)
                      : null
                )
                .filter(Boolean) as MenuItemData[];
              return filteredSubItems.length > 0
                ? {
                    ...item,
                    items: filteredSubItems,
                  }
                : null;
            }
          }
        })
        // Ignore not matched items
        .filter(Boolean) as MenuItemData[],
    }))
    // ignore empty desktops
    .filter((group) => group.items.length > 0);
  return groups;
}

export function searchCategories(
  categories: PlatformCategoryItem[],
  q: string
): PlatformCategoryItem[] {
  if (!q) {
    return categories;
  }

  const lowerQ = q.toLowerCase();
  const _categories = categories.map((category) => ({
    ...category,
    items: category.items
      .map((item) => {
        switch (item.type) {
          case "app":
            return matchMenuItem<MenuItemDataApp>(item, lowerQ);
          case "custom":
            return matchMenuItem<MenuItemDataCustom>(item, lowerQ);
        }
      })
      // Ignore not matched items
      .filter(Boolean) as MenuItemDataNormal[],
  }));
  return _categories;
}

type MenuItemBase = {
  id: string;
  name: string;
  localeName?: string;
  description?: string;
};

function matchMenuItem<T extends MenuItemBase>(
  item: T,
  lowerQ: string
): T | null {
  const { id, name, localeName, description } = item;
  return [id, name, localeName, description].some((field) =>
    field?.toLowerCase().includes(lowerQ)
  )
    ? item
    : null;
}
