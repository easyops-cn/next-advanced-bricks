import React, { useRef, useState } from "react";
import classNames from "classnames";
import { getHistory } from "@next-core/runtime";
import { SectionTitle } from "./SectionTitle.js";
import { K, t } from "./i18n.js";
import { WrappedIcon, WrappedIconButton, WrappedLink } from "./bricks.js";
import { NavLink } from "./NavLink.js";
import type { SidebarLink } from "./interfaces.js";
import { ADD_ICON, MODEL_ICON } from "./constants.js";
import { useNavLinkActive } from "./useNavLinkActive.js";

export interface SpaceNavProps {
  returnUrl: string;
  introUrl: string;
  spaceDetail: {
    instanceId: string;
    name: string;
  };
  spaceObjects?: SidebarLink[];
  spaceServiceflows?: SidebarLink[];
  spaceLinks?: SidebarLink[];
}

export interface SpaceNavComponentProps extends SpaceNavProps {
  onAddServiceflow?: () => void;
}

export function SpaceNav({
  returnUrl,
  introUrl,
  spaceDetail,
  spaceObjects,
  spaceServiceflows,
  spaceLinks,
  onAddServiceflow,
}: SpaceNavComponentProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [objectsCollapsed, setObjectsCollapsed] = useState(false);
  const [serviceflowsCollapsed, setServiceflowsCollapsed] = useState(false);
  const introActive = useNavLinkActive(introUrl);

  return (
    <>
      <WrappedLink url={returnUrl} className="return-link">
        <div className="heading">
          <div className="title">{spaceDetail?.name}</div>
          <div className="sub-title">{t(K.COLLABORATION_SPACES)}</div>
        </div>
        <WrappedIcon className="icon" lib="lucide" icon="arrow-left" />
      </WrappedLink>
      <div className="divider" />
      <div className="history" ref={rootRef}>
        {spaceObjects ? (
          <div
            className={classNames("section", { collapsed: objectsCollapsed })}
          >
            <SectionTitle
              rootRef={rootRef}
              title={t(K.BUSINESS_OBJECTS)}
              collapsed={objectsCollapsed}
              onToggle={() => setObjectsCollapsed((prev) => !prev)}
            >
              <WrappedIconButton
                icon={MODEL_ICON}
                variant="mini-light"
                tooltip={t(K.BUSINESS_OBJECT_MODELS)}
                tooltipHoist={true}
                className="button"
                active={introActive}
                onClick={() => getHistory().push(introUrl)}
              />
            </SectionTitle>
            <ul className="items">
              {spaceObjects.map((obj, index) => (
                <li key={index}>
                  <NavLink
                    url={obj.url}
                    activeIncludes={obj.activeIncludes}
                    render={({ active }) => (
                      <WrappedLink
                        className={classNames("item", { active })}
                        url={obj.url}
                      >
                        <div className="item-title">{obj.title}</div>
                      </WrappedLink>
                    )}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {spaceServiceflows ? (
          <div
            className={classNames("section", {
              collapsed: serviceflowsCollapsed,
            })}
          >
            <SectionTitle
              rootRef={rootRef}
              title={t(K.SERVICEFLOWS)}
              collapsed={serviceflowsCollapsed}
              onToggle={() => setServiceflowsCollapsed((prev) => !prev)}
            >
              <WrappedIconButton
                icon={ADD_ICON}
                variant="mini-light"
                tooltip={t(K.CREATE_SERVICEFLOW)}
                tooltipHoist={true}
                className="button"
                onClick={onAddServiceflow}
              />
            </SectionTitle>
            <ul className="items">
              {spaceServiceflows.map((obj, index) => (
                <li key={index}>
                  <NavLink
                    url={obj.url}
                    activeIncludes={obj.activeIncludes}
                    render={({ active }) => (
                      <WrappedLink
                        className={classNames("item", { active })}
                        url={obj.url}
                      >
                        <div className="item-title">{obj.title}</div>
                      </WrappedLink>
                    )}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {spaceLinks?.length ? (
          <div className="space-links">
            {spaceLinks.map((link, index) => (
              <NavLink
                key={index}
                url={link.url}
                activeIncludes={link.activeIncludes}
                render={({ active }) => (
                  <WrappedLink
                    key={index}
                    className={classNames("link", { active })}
                    url={link.url}
                  >
                    <WrappedIcon className="icon" {...link.icon} />
                    <span className="title">{link.title}</span>
                  </WrappedLink>
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
