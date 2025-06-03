import React, { useMemo } from "react";
import classNames from "classnames";
import styles from "./TraceList.module.css";
import { WrappedTable } from "../bricks";

export interface ToolProgressLineProps {
  datSource?: {
    list: {
      key: number;
      spanName: string;
      duration: number;
      code: string;
      service: string;
      traceId: string;
    }[];
  };
}

export function TraceList({ datSource }: ToolProgressLineProps): JSX.Element {
  const EventsTable = useMemo(() => {
    const data = datSource ?? {
      list: [
        {
          key: 0,
          spanName: "GET:GET:/songs",
          duration: 3007,
          code: "成功",
          service: "songs",
          traceId: "a188d97b-2720-436c-98b0-dbd4df5e8d94",
        },
      ],
    };

    const columns = [
      {
        dataIndex: "spanName",
        key: "spanName",
        title: "接口",
        minWidth: 200,
      },
      {
        dataIndex: "duration",
        key: "duration",
        title: "耗时（ms）",
        minWidth: 120,
      },

      {
        dataIndex: "code",
        key: "code",
        title: "状态",
        minWidth: 100,
        useBrick: {
          brick: "eo-tag",
          properties: {
            color: "green",
            textContent: "<% DATA.cellData %>",
          },
        },
      },
      {
        dataIndex: "service",
        key: "service",
        title: "服务",
        minWidth: 200,
      },
      {
        dataIndex: "traceId",
        key: "traceId",
        title: "trace ID",
        minWidth: 250,
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
  }, [datSource]);
  return <div className={classNames(styles["trace-list"])}>{EventsTable}</div>;
}
