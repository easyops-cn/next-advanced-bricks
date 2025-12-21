import React, { useEffect, useState } from "react";
import { wrapBrick } from "@next-core/react-element";
import {
  ElevoSpaceApi_GenerateSpaceCapabilitiesResponseBody,
  ElevoSpaceApi_generateSpaceCapabilities,
} from "@next-api-sdk/llm-sdk";
import type { SpaceLogo, SpaceLogoProps } from "../space-logo/index.js";
import styles from "./SpaceGuide.module.css";
import { SpaceDetail } from "../interfaces.js";
import MagicSvg from "../images/magic.svg";
import layerSvg from "../images/layer.svg?url";
import layerBg from "../images/layer-bg.png";
import lightningSvg from "../images/lightning.svg?url";
import lightningBg from "../images/lightning-bg.png";
import bookSvg from "../images/book.svg?url";
import bookBg from "../images/book-bg.png";
import { K, t } from "../i18n.js";

const WrappedSpaceLogo = wrapBrick<SpaceLogo, SpaceLogoProps>(
  "ai-portal.space-logo"
);

export interface GuideCard {
  key: string;
  icon: string;
  background: string;
  title: string;
  description?: string;
  iconContainerColor: "blue" | "orange" | "green";
}

export interface SpaceGuideProps {
  onCardClick?: (cardIndex: number) => void;
  spaceDetail: SpaceDetail;
}

export function SpaceGuide(props: SpaceGuideProps) {
  const { spaceDetail, onCardClick } = props;
  const [spaceCapabilities, setSpaceCapabilities] =
    useState<ElevoSpaceApi_GenerateSpaceCapabilitiesResponseBody | null>(null);

  const cards: GuideCard[] = [
    {
      key: "manageInstancesCapability",
      icon: layerSvg,
      background: layerBg,
      title: t(K.SPACE_GUIDE_CARD_1_TITLE),
      iconContainerColor: "blue",
    },
    {
      key: "initiateFlowCapability",
      icon: lightningSvg,
      background: lightningBg,
      title: t(K.SPACE_GUIDE_CARD_2_TITLE),
      iconContainerColor: "orange",
    },
    {
      key: "searchKnowledgeCapability",
      icon: bookSvg,
      background: bookBg,
      title: t(K.SPACE_GUIDE_CARD_3_TITLE),
      iconContainerColor: "green",
    },
  ];

  const handleCardClick = (index: number) => {
    onCardClick?.(index);
  };

  useEffect(() => {
    const fetchSpaceCapabilities = async () => {
      const res = await ElevoSpaceApi_generateSpaceCapabilities(
        spaceDetail.instanceId,
        {
          forceRefresh: true,
        }
      );
      setSpaceCapabilities(res);
    };

    fetchSpaceCapabilities();
  }, [spaceDetail.instanceId]);

  return (
    <div className={styles.spaceGuideContainer}>
      <div className={styles.guideHeader}>
        <div className={styles.spaceLogo}>
          <WrappedSpaceLogo size={48} />
        </div>
        <h1 className={styles.guideTitle}>{spaceDetail.name}</h1>
        <p className={styles.guideDescription}>{spaceDetail.description}</p>
      </div>

      <div className={styles.guideContent}>
        <div className={styles.sectionTitle}>
          <MagicSvg className={styles.sectionIcon} />
          <span>{t(K.SPACE_GUIDE_SECTION_TITLE)}</span>
        </div>

        <div className={styles.cardsGrid}>
          {cards.map((card, index) => (
            <div
              key={index}
              className={styles.guideCard}
              style={{ backgroundImage: `url(${card.background})` }}
              onClick={() => handleCardClick(index)}
            >
              <div className={styles.cardContent}>
                <div
                  className={`${styles.cardIconContainer} ${styles[card.iconContainerColor]}`}
                >
                  <img
                    src={card.icon}
                    alt={card.title}
                    className={styles.cardIcon}
                  />
                </div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDescription}>
                  {
                    spaceCapabilities?.[
                      card.key as keyof ElevoSpaceApi_GenerateSpaceCapabilitiesResponseBody
                    ]
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
