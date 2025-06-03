import React, { useMemo } from "react";
import classNames from "classnames";
import styles from "./AlertEvents.module.css";
import { WrappedTable } from "../bricks";

export interface AlertEventsProps {
  dataSource?: {
    list: {
      key: number;
      target: string;
      time: string;
      level: string;
      source: string;
      originContent: string;
    }[];
  };
}

export function AlertEvents({ dataSource }: AlertEventsProps): JSX.Element {
  const EventsTable = useMemo(() => {
    const data = dataSource ?? {
      list: [
        {
          key: 0,
          target: "http-172.27.0.3:80",
          time: "05-30 16:03:00",
          level: "严重",
          source: "system",
          originContent: "service_latency_avg: 3.04s大于10ms",
        },
      ],
    };
    const columns = [
      {
        dataIndex: "target",
        key: "target",
        title: "告警资源",
        minWidth: 200,
      },
      {
        dataIndex: "time",
        key: "time",
        title: "告警时间",
        minWidth: 180,
      },
      {
        dataIndex: "level",
        key: "level",
        title: "告警等级",
        minWidth: 120,
        useBrick: {
          brick: "eo-tag",
          properties: {
            color: "red",
            textContent: "<% DATA.cellData %>",
          },
        },
      },
      {
        dataIndex: "source",
        key: "source",
        title: "告警来源",
        minWidth: 200,
      },
      {
        dataIndex: "originContent",
        key: "originContent",
        title: "告警信息",
        minWidth: 320,
      },
    ];
    return (
      <WrappedTable
        size="small"
        rowKey="key"
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    );
  }, [dataSource]);
  return <div className={classNames(styles["events-list"])}>{EventsTable}</div>;
}
