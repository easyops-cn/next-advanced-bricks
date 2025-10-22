构件 `vb-experiment.tsx-playground`

## Examples

### Basic

```yaml preview minHeight="600px"
- brick: vb-experiment.tsx-playground
  properties:
    style:
      display: block
      position: fixed
      inset: 0
    source: |
      import { useState } from "next-tsx";

      const RESPONSE = {
        "list": [
          {
            "inode_usage": [
              {
                "total_inodes": 21162000,
                "used_inodes": 1385716,
                "free_inodes": 19776284,
                "percent": "7%",
                "device": "/dev/mapper/centos-root",
                "mount_point": "/"
              },
              {
                "mount_point": "/boot",
                "total_inodes": 524288,
                "used_inodes": 333,
                "free_inodes": 523955,
                "percent": "1%",
                "device": "/dev/vda1"
              }
            ],
            "ip": "172.30.0.134",
            "disk_usage": [
              {
                "total": "95.00GB",
                "used": "85.00GB",
                "free": "9.00GB",
                "percent": "91%",
                "rw_status": "rw",
                "large_files": [
                  {
                    "size": "1.00GB",
                    "path": "/opt/maxkb/maxkb-pro-2.0.1.tgz"
                  },
                  {
                    "path": "/opt/maxkb/maxkb-pro-v2.0.1-x86_64-offline-installer/images/maxkb-pro.tar.gz",
                    "size": "1.00GB"
                  },
                  {
                    "path": "/data/easyops/kafka/data/aggregate.metric.message.json-0/00000000000044787540.log",
                    "size": "759.00MB"
                  },
                  {
                    "size": "739.00MB",
                    "path": "/data/easyops/kafka/data/monitor.metric.message.json-0/00000000000741056461.log"
                  },
                  {
                    "path": "/data/easyops/mysql/data/ib_logfile1",
                    "size": "512.00MB"
                  },
                  {
                    "size": "512.00MB",
                    "path": "/data/easyops/mysql/data/ib_logfile0"
                  },
                  {
                    "size": "452.00MB",
                    "path": "/usr/local/easyops/clickhouse/bin/clickhouse"
                  },
                  {
                    "path": "/data/easyops/seaweedfs/data/data/easyops_5.dat",
                    "size": "371.00MB"
                  },
                  {
                    "size": "369.00MB",
                    "path": "/data/easyops/seaweedfs/data/data/easyops_6.dat"
                  },
                  {
                    "size": "360.00MB",
                    "path": "/data/easyops/seaweedfs/data/data/easyops_1.dat"
                  }
                ],
                "device": "/dev/mapper/centos-root",
                "mount_point": "/"
              },
              {
                "rw_status": "rw",
                "device": "/dev/vda1",
                "mount_point": "/boot",
                "total": "1014.00MB",
                "used": "181.00MB",
                "free": "834.00MB",
                "percent": "18%"
              }
            ]
          }
        ]
      };

      export default (
        <View title="磁盘使用情况">
          {RESPONSE.list.map((item) => (
            <Card title={item.ip}>
              {/* 磁盘空间使用情况 */}
              <Plaintext>磁盘空间使用</Plaintext>
              <Table
                dataSource={{ list: item.disk_usage }}
                columns={[
                  { dataIndex: "device", key: "device", title: "设备" },
                  { dataIndex: "mount_point", key: "mount_point", title: "挂载点" },
                  { dataIndex: "total", key: "total", title: "总大小" },
                  { dataIndex: "used", key: "used", title: "已用空间" },
                  { dataIndex: "free", key: "free", title: "可用空间" },
                  { dataIndex: "percent", key: "percent", title: "使用率" },
                  { dataIndex: "rw_status", key: "rw_status", title: "读写状态" }
                ]}
                rowKey="device"
                pagination={false}
              />

              {/* Inode 使用情况 */}
              <Plaintext>Inode 使用情况</Plaintext>
              <Table
                dataSource={{ list: item.inode_usage }}
                columns={[
                  { dataIndex: "device", key: "device", title: "设备" },
                  { dataIndex: "mount_point", key: "mount_point", title: "挂载点" },
                  { dataIndex: "total_inodes", key: "total_inodes", title: "Inode 总数" },
                  { dataIndex: "used_inodes", key: "used_inodes", title: "已用 Inode" },
                  { dataIndex: "free_inodes", key: "free_inodes", title: "空闲 Inode" },
                  {
                    dataIndex: "percent", key: "percent", title: "使用率",
                    render: (cell, record) => (
                      // <Plaintext>{record.percent}%</Plaintext>
                      `~${record.percent}`
                    )
                  }
                ]}
                rowKey="device"
                pagination={false}
              />

              {/* 大文件列表（仅当存在 large_files 且有内容时） */}
              {item.disk_usage
                .filter(disk => disk.large_files && disk.large_files.length > 0)
                .map(disk =>
                  disk.large_files ? (
                    <Fragment key={disk.device}>
                      <Plaintext>{`大文件列表 (${disk.mount_point})`}</Plaintext>
                      <Table
                        dataSource={{ list: disk.large_files }}
                        columns={[
                          { dataIndex: "path", key: "path", title: "路径" },
                          { dataIndex: "size", key: "size", title: "大小" }
                        ]}
                        rowKey="path"
                        pagination={false}
                      />
                    </Fragment>
                  ) : null
                )}
            </Card>
          ))}
        </View>
      );
- brick: style
  properties:
    textContent: |
      .monaco-editor .overflow-guard {
        border-radius: 0!important;
        border: none!important;
      }
```

```tsx
// /Components/CollaborationSpaceList.tsx
/**
 * 列出协作空间列表，可以：
 * 1. 指定预设参数自动查询我创建的或者我参与的协作空间列表；
 * 2. 直接传递查询好的空间列表数据。
 */
export default function CollaborationSpaceList({
  preset,
  spaces,
}: SpaceListProps) {
  const [fetchedSpaces] = useResource(
    () =>
      callApi("easyops.api.llm.elevo_space@ListElevoSpace", {
        page: 1,
        page_size: 3000,
      }).then((data) => data.list),
    {
      enabled: !!preset,
    }
  );

  const filteredSpaces = fetchedSpaces?.filter((space) =>
    filterSpace(space, preset, SYS.userInstanceId)
  );

  const fixedSpaces = filteredSpaces || spaces;

  if (fixedSpaces?.length) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {fixedSpaces?.map((space) => (
          <ai-portal--elevo-card
            cardTitle={space.name}
            description={space.description}
            avatar={space.icon}
          />
        ))}
      </div>
    );
  }

  return (
    <ai-portal--blank-state
      illustration="collaboration-spaces"
      description="No spaces."
    />
  );
}

function filterSpace(
  space: Space,
  preset: "owned" | "related",
  userInstanceId: string
) {
  console.log("space", space);
  console.log("userInstanceId", userInstanceId);
  const isOwned = space.owner?.[0]?.instanceId === userInstanceId;
  console.log("isOwned", isOwned);
  return preset === "related" ? !isOwned : isOwned;
}

export interface SpaceListProps {
  preset?: "owned" | "related";
  spaces?: Space[];
}

export interface Space {
  instanceId: string;
  name: string;
  description?: string;
  icon?: object;
}
```

```tsx
// /Components/ServiceFlow.tsx
interface ServiceFlowProps {
  spaceId?: string;
  flowId?: string;
  spec?: FlowStage[];
}

interface FlowStage {
  name: string;
  serviceFlowActivities?: FlowActivity[];
}

interface FlowActivity {
  name: string;
  description?: string;
  aiEmployeeId?: string;
  hilRules?: string;
  hilUser?: string;
}

export default function ServiceFlow({
  spaceId,
  flowId,
  spec,
}: ServiceFlowProps) {
  const [flow] = useResource(
    () =>
      callApi("easyops.api.llm.elevo_space@GetServiceFlow", {
        spaceId,
        instanceId: flowId,
      }),
    { enabled: !spec && spaceId && flowId }
  );

  const fixedSpec = spec || flow.spec;

  return (
    <div style={{ maxWidth: "100%", overflowX: "auto" }} data-scrollable="true">
      <ai-portal--stage-flow spec={fixedSpec} readOnly />
    </div>
  );
}
```

```ts
declare module "./Components/CollaborationSpaceList" {
  /**
   * 列出协作空间列表，可以：
   * 1. 指定预设参数自动查询我创建的或者我参与的协作空间列表；
   * 2. 直接传递查询好的空间列表数据。
   */
  export default function CollaborationSpaceList({
    preset,
    spaces,
  }: SpaceListProps): any;

  export interface SpaceListProps {
    preset?: "owned" | "related";
    spaces?: Space[];
  }

  export interface Space {
    instanceId: string;
    name: string;
    description?: string;
    icon?: object;
  }
}
```

```tsx
import SpaceList from "./Components/SpaceList";

export default function () {
  const spaces = [];
  return (
    <View title="demo">
      <ai-portal--page-container>
        <SpaceList spaces={spaces} />
      </ai-portal--page-container>
    </View>
  );
}
```

```tsx
import ServiceFlow from "./Components/ServiceFlow";

export default function () {
  return (
    <View title="demo">
      <ServiceFlow spaceId="6412dd7c6f0c5" flowId="64145411c9c11" />
    </View>
  );
}
```
