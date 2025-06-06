import React, { Suspense, useMemo } from "react";
import sharedStyles from "../shared.module.css";
import { AsyncWrappedTable } from "../table";

export interface DeploymentChangesProps {
  dataSource?: {
    list: {
      key: number;
      originContent: string;
      level: string;
      time: string;
      resource: string;
    }[];
  };
}

export function DeploymentChanges({
  dataSource,
}: DeploymentChangesProps): JSX.Element {
  const EventsTable = useMemo(() => {
    const data = dataSource ?? {
      list: [
        {
          key: 0,
          originContent: "【系统事件】easyops用户修改了故障自愈 simons",
          level: "提示",
          time: "05-30 16:03:00",
          resource: "auto_recovery_rule",
        },
      ],
    };

    const columns = [
      {
        dataIndex: "originContent",
        key: "originContent",
        title: "事件信息",
        // minWidth: 400,
      },
      {
        dataIndex: "level",
        key: "level",
        title: "等级",
        // minWidth: 100,
        useBrick: {
          brick: "eo-tag",
          properties: {
            color: "green",
            textContent: "<% DATA.cellData %>",
          },
        },
      },
      {
        dataIndex: "time",
        key: "time",
        title: "事件发生时间",
        // minWidth: 180,
      },
      {
        dataIndex: "resource",
        key: "resource",
        title: "事件对象",
        // minWidth: 250,
      },
    ];
    return (
      <Suspense>
        <AsyncWrappedTable
          size="small"
          rowKey="key"
          columns={columns}
          dataSource={data}
          pagination={false}
          scrollConfig={false}
        />
      </Suspense>
    );
  }, [dataSource]);
  return <div className={sharedStyles["table-container"]}>{EventsTable}</div>;
}
