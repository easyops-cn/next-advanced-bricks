import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { getRuntime } from "@next-core/runtime";
import { useCurrentApp } from "@next-core/react-runtime";
import { auth } from "@next-core/easyops-runtime";
import "@next-core/theme";
import { JsonStorage } from "@next-shared/general/JsonStorage";
import moment from "moment";
import { initializeReactI18n, useTranslation } from "@next-core/i18n/react";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import styleText from "./styles.shadow.css";
import { K, NS, locales } from "./i18n.js";

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
export const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");

const { defineElement } = createDecorators();

initializeReactI18n(NS, locales);

/**
 * 导航栏告警提示组件，用于显示 License 到期提醒和页面性能问题警告。
 * @insider
 */
export
@defineElement("nav.easyops-navbar-alerts", {
  styleTexts: [styleText],
})
class EasyopsNavbarAlerts extends ReactNextElement {
  render() {
    return <EasyopsNavbarAlertsComponent />;
  }
}

interface SlowRenderInfo {
  renderTime: number;
  suggestTime: number;
  suggestUrl?: string;
}

const storage = new JsonStorage(localStorage);

export function EasyopsNavbarAlertsComponent() {
  const { t: translate } = useTranslation(NS);
  const [licenseHide, setLienceseHide] = useState<boolean>(false);
  const [slowRender, setSlowRender] = useState<SlowRenderInfo | null>(null);
  const currentApp = useCurrentApp();
  const licenseDismissedKey = useMemo(() => {
    const authInfo = auth.getAuth();
    return `license:${authInfo.org}`;
  }, []);

  const licenseDaysLeft = useMemo(() => {
    const authInfo = auth.getAuth();
    const validDaysLeft = authInfo.license?.validDaysLeft;
    let dismissExpireAt: number;
    if (licenseHide) {
      return null;
    }
    if (
      validDaysLeft &&
      validDaysLeft <= 15 &&
      authInfo.isAdmin &&
      ((dismissExpireAt = storage.getItem(licenseDismissedKey)),
      !dismissExpireAt || moment().unix() > dismissExpireAt)
    ) {
      return validDaysLeft;
    }
    return null;
  }, [licenseDismissedKey, licenseHide]);

  useEffect(() => {
    const handelRouteRender = (e: Event): void => {
      const renderTime = (e as CustomEvent<{ renderTime: number }>).detail
        .renderTime;
      const { loadTime, loadInfoPage } = getRuntime().getMiscSettings() as {
        loadTime: number;
        loadInfoPage?: string;
      };
      if (currentApp?.isBuildPush && loadTime > 0 && renderTime > loadTime) {
        setSlowRender({
          renderTime: millisecondToSecond(renderTime),
          suggestTime: millisecondToSecond(loadTime),
          suggestUrl: loadInfoPage,
        });
      }
    };
    window.addEventListener("route.render", handelRouteRender);
    return () => {
      window.removeEventListener("route.render", handelRouteRender);
    };
  }, [currentApp]);

  const handleLicenseAlertDismiss = useCallback(() => {
    // 一天内不再显示。
    storage.setItem(licenseDismissedKey, moment().unix() + 86400);
    setLienceseHide(true);
  }, [licenseDismissedKey]);

  return (
    <>
      {slowRender && (
        <Alert
          text={translate(K.PAGE_RENDER_SLOW_TIP, {
            renderTime: slowRender.renderTime,
            suggestTime: slowRender.suggestTime,
          })}
          type="warning"
          link={
            slowRender.suggestUrl
              ? {
                  label: translate(K.VIEW_SUGGESTION),
                  url: slowRender.suggestUrl,
                }
              : undefined
          }
        />
      )}
      {licenseDaysLeft !== null && (
        <Alert
          text={translate(K.LICENSE_EXPIRES_IN_DAY, { count: licenseDaysLeft })}
          type="info"
          closable
          onClose={handleLicenseAlertDismiss}
        />
      )}
    </>
  );
}

interface AlertProps {
  text: string;
  type: "info" | "warning";
  closable?: boolean;
  link?: {
    label: string;
    url: string;
  };
  onClose?: () => void;
}

function Alert({ text, type, closable, link, onClose }: AlertProps) {
  return (
    <div className={`alert ${type}`}>
      <span className="text">{text}</span>
      {link && (
        <WrappedLink className="link" href={link.url} target="_blank">
          {link.label}
        </WrappedLink>
      )}
      {closable && (
        <WrappedIcon
          lib="antd"
          icon="close"
          className="icon"
          role="button"
          onClick={onClose}
        />
      )}
    </div>
  );
}

function millisecondToSecond(millisecond: number) {
  return Math.floor(millisecond * 100) / 1e5;
}
