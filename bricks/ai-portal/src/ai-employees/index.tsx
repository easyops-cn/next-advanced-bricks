import React, { useMemo, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import Avatar1 from "./images/avatar-1@2x.png";
import Avatar2 from "./images/avatar-2@2x.png";
import Avatar3 from "./images/avatar-3@2x.png";
import Avatar4 from "./images/avatar-4@2x.png";
import Avatar5 from "./images/avatar-5@2x.png";
import Avatar6 from "./images/avatar-6@2x.png";
import Avatar7 from "./images/avatar-7@2x.png";
import Avatar8 from "./images/avatar-8@2x.png";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const AVATARS = [
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar7,
  Avatar8,
];

const { defineElement, property } = createDecorators();

export interface AIEmployeesProps {
  list?: Employee[];
  industries?: string[];
  // roles?: string[];
}

export interface Employee {
  name: string;
  industry: string;
  role: string;
  description: string;
}

/**
 * 构件 `ai-portal.ai-employees`
 */
export
@defineElement("ai-portal.ai-employees", {
  styleTexts: [styleText],
})
class AIEmployees extends ReactNextElement implements AIEmployeesProps {
  @property({ attribute: false })
  accessor list: Employee[] | undefined;

  @property({ attribute: false })
  accessor industries: string[] | undefined;

  // @property({ attribute: false })
  // accessor roles: string[] | undefined;

  render() {
    return (
      <AIEmployeesComponent list={this.list} industries={this.industries} />
    );
  }
}

function AIEmployeesComponent({
  list,
  industries: _industries,
}: AIEmployeesProps) {
  const industries = useMemo(() => {
    return [
      ...new Set([
        ...(_industries ?? []),
        ...(list ?? []).map((item) => item.industry),
      ]),
    ];
  }, [_industries, list]);

  const [activeIndustry, setActiveIndustry] = useState(industries[0]);

  // Grouping the list by role
  const groups = useMemo(() => {
    const map = new Map<string, Employee[]>();
    list?.forEach((item) => {
      if (item.industry !== activeIndustry) {
        return;
      }
      let array = map.get(item.role);
      if (!array) {
        map.set(item.role, (array = []));
      }
      array.push(item);
    });
    return [...map.entries()];
  }, [activeIndustry, list]);

  const industryIndex = industries.indexOf(activeIndustry);

  return (
    <div className="container">
      <h1>{t(K.AI_EMPLOYEES)}</h1>
      <ul className="nav">
        {industries.map((industry) => (
          <li key={industry} className="item">
            <a
              className={classNames({ active: industry === activeIndustry })}
              onClick={() => setActiveIndustry(industry)}
            >
              {industry}
            </a>
          </li>
        ))}
      </ul>
      <ul className="groups">
        {groups.map(([groupName, items], groupIndex) => (
          <li key={groupName} className="group">
            <h2>{groupName}</h2>
            <ul className="list">
              {items.map((item, index) => (
                <li key={index} className="item">
                  <div className="heading">
                    <div className="avatar">
                      <img
                        src={
                          AVATARS[
                            (index + groupIndex + industryIndex) %
                              AVATARS.length
                          ]
                        }
                      />
                    </div>
                    <div className="title">{item.name}</div>
                  </div>
                  <div className="description">{item.description}</div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
