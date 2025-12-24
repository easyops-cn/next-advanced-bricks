import React, { useEffect, useState } from "react";
import { wrapBrick } from "@next-core/react-element";
import {
  ElevoSpaceApi_GenerateSpaceCapabilitiesResponseBody,
  ElevoSpaceApi_generateSpaceCapabilities,
} from "@next-api-sdk/llm-sdk";
import type { SpaceLogo, SpaceLogoProps } from "../space-logo/index.js";
import { SpaceDetail } from "../interfaces.js";
import MagicSvg from "../images/magic.svg";
import layerSvg from "../images/layer.svg?url";
import layerBg from "../images/layer-bg.png";
import lightningSvg from "../images/lightning.svg?url";
import lightningBg from "../images/lightning-bg.png";
import bookSvg from "../images/book.svg?url";
import bookBg from "../images/book-bg.png";
import { K, t } from "../i18n.js";
import { handleHttpError } from "@next-core/runtime";

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
  generateSpaceSummary?: boolean;
}

export function SpaceGuide(props: SpaceGuideProps) {
  const { spaceDetail, onCardClick, generateSpaceSummary } = props;
  const [spaceCapabilities, setSpaceCapabilities] =
    useState<ElevoSpaceApi_GenerateSpaceCapabilitiesResponseBody | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      try {
        const res = await ElevoSpaceApi_generateSpaceCapabilities(
          spaceDetail.instanceId,
          {
            forceRefresh: !!generateSpaceSummary,
          },
          {
            interceptorParams: {
              ignoreLoadingBar: true,
            },
          }
        );
        setSpaceCapabilities(res);
      } catch (error) {
        handleHttpError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceCapabilities();
  }, [spaceDetail.instanceId, generateSpaceSummary]);

  return (
    <div className="space-guide-container">
      <div className="guide-header">
        <div className="space-logo">
          <WrappedSpaceLogo size={48} />
        </div>
        <h1 className="guide-title">{spaceDetail.name}</h1>
        <p className="guide-description">{spaceDetail.description}</p>
      </div>

      <div className="guide-content">
        <div className="section-title">
          <MagicSvg className="section-icon" />
          <span>{t(K.SPACE_GUIDE_SECTION_TITLE)}</span>
        </div>

        <div className="cards-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className="guide-card"
              style={{ backgroundImage: `url(${card.background})` }}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-content">
                <div
                  className={`card-icon-container ${card.iconContainerColor}`}
                >
                  <img src={card.icon} alt={card.title} className="card-icon" />
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">
                  {loading ? (
                    <span className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  ) : (
                    spaceCapabilities?.[
                      card.key as keyof ElevoSpaceApi_GenerateSpaceCapabilitiesResponseBody
                    ]
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
