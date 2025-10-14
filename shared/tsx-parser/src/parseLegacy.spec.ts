// import { codeFrameColumns } from "@babel/code-frame";
import { parseView } from "./parseView.js";

const code = `
// 记录分页信息
let pagination = { page: 1, pageSize: 20 };

// 记录搜索关键词
let keyword: string | undefined;

const hosts = await Entity.list(
  "HOST",
  {
    query: keyword ? {
      $or: [
        { hostname: { $like: \`%\${keyword}%\` } },
        { ip: { $like: \`%\${keyword}%\` } }
      ]
    } : {},
    ...pagination
  }
);

export default (
  <View title="管理告警事件">
    <Toolbar>
      <Search
        placeholder="按主机名或 IP 搜索"
        onSearch={(e) => {
          keyword = e.detail;
        }}
      />
    </Toolbar>
    <Table
      dataSource={
        Object.entries(hosts).map(([key, value]: [string, object]) => ({
          label: key,
          desc: value.description,
          required: RESPONSE.outputSchema.required.includes(key)
        }))
      }
      columns={[
        { dataIndex: "hostname", key: "hostname", title: "主机名" },
        { dataIndex: "ip", key: "ip", title: "IP" },
        {
          dataIndex: "owners", key: "owners", title: "负责人",
          render: (value, record) => (
            <AvatarGroup size="small">
              {value.map((user) => (<Avatar name={user.username} src={user.avatar} />))}
            </AvatarGroup>
          )
        }
      ]}
      rowKey="instanceId"
      onPaginate={(e) => {
        pagination = e.detail;
      }}
    />
  </View>
);

`;

describe("parseLegacy", () => {
  test("should parse TSX code with defineContext", () => {
    const view = parseView(code);
    expect(view).toBeTruthy();
  });
});
