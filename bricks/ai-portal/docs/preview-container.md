构件 `ai-portal.preview-container`

## Examples

### Basic

```yaml preview minHeight="600px"
brick: ai-portal.preview-container
properties:
  style:
    position: fixed
    inset: 0
    overflowY: auto
  source: |
    const RESPONSE = {
      "list": [
        {
          "inode_usage": [
            {
              "total_inodes": 21162000,
              "used_inodes": 1385716,
              "free_inodes": 19776284,
              "percent": "7%",
              "device": "/dev/sda1",
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
                  "path": "/temp/1"
                },
                {
                  "path": "/temp/2",
                  "size": "759.00MB"
                },
                {
                  "size": "360.00MB",
                  "path": "/temp/3"
                }
              ],
              "device": "/dev/sda1",
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
```
