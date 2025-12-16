import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type { SpaceLogo, SpaceLogoProps } from "../../space-logo/index.jsx";
import { SpaceDetail } from "../../interfaces.js";
import MagicSvg from "../../images/magic.svg";
import layerSvg from "../../images/layer.svg?url";
import layerBg from "../../images/layer-bg.png";
import lightningSvg from "../../images/lightning.svg?url";
import lightningBg from "../../images/lightning-bg.png";
import bookSvg from "../../images/book.svg?url";
import bookBg from "../../images/book-bg.png";
import { K, t } from "../../i18n.js";

const WrappedSpaceLogo = wrapBrick<SpaceLogo, SpaceLogoProps>(
  "ai-portal.space-logo"
);

export interface GuideCard {
  icon: string;
  background: string;
  title: string;
  description?: string;
}

export interface SpaceGuideProps {
  onCardClick?: (cardIndex: number) => void;
  spaceDetail: SpaceDetail;
}

export function SpaceGuide(props: SpaceGuideProps) {
  const { spaceDetail, onCardClick } = props;

  const cards: GuideCard[] = [
    {
      icon: layerSvg,
      background: layerBg,
      title: t(K.SPACE_GUIDE_CARD_1_TITLE),
    },
    {
      icon: lightningSvg,
      background: lightningBg,
      title: t(K.SPACE_GUIDE_CARD_2_TITLE),
    },
    {
      icon: bookSvg,
      background: bookBg,
      title: t(K.SPACE_GUIDE_CARD_3_TITLE),
    },
  ];

  const handleCardClick = (index: number) => {
    onCardClick?.(index);
  };

  return (
    <div className="space-guide-container">
      <div className="guide-header">
        <WrappedSpaceLogo size={64} className="space-logo" />
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
                <img src={card.icon} alt={card.title} className="card-icon" />
                <h3 className="card-title">{card.title}</h3>
                {card.description && (
                  <p className="card-description">{card.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
