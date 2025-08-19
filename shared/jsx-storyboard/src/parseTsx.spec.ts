// import { codeFrameColumns } from "@babel/code-frame";
import { parseTsx } from "./parseTsx.js";

const code = `let keyword: string | undefined;

let pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 };

let alerts = await callApi(
  "easyops.api.alert_service.monitor_event@SearchNotRecoverEvents",
  {
    page: pagination.page,
    page_size: pagination.pageSize,
    ...(keyword ? { keyword } : null),
    st: "-1h",
  },
  { objectId: "EVENT" }
).then((data) => data);

export default (
  <View title="未解决告警事件">
    <Toolbar>
      <Search
        componentId="search"
        placeholder="按告警内容搜索"
        onSearch={(event) => {
          keyword = event.detail;
        }}
      />
    </Toolbar>
    <Table
      dataSource={alerts}
      columns={[
        { dataIndex: "eventId", key: "eventId", title: "告警ID" },
        { dataIndex: "target", key: "target", title: "告警对象" },
        { dataIndex: "level", key: "level", title: "告警等级" },
        { dataIndex: "time", key: "time", title: "告警时间" },
        { dataIndex: "originContent", key: "originContent", title: "告警内容" },
      ]}
      rowKey="eventId"
      onPaginate={(event) => {
        showMessage({
          type: event.detail ? "success" : "error",
          content: String(event.detail)
        });
        refresh(alerts);
        getComponent("Search", "search").open();
      }}
    />
  </View>
);
`;

describe("parseJsx", () => {
  test("should parse TSX code with defineContext", () => {
    const { errors, componentsMap, source, ...result } = parseTsx(code);
    // if (errors.length > 0) {
    //   for (const error of errors) {
    //     if (!error.node) {
    //       console.error(error.message);
    //     } else if (error.message.includes("\n")) {
    //       console.error(error.message);
    //       const columns = codeFrameColumns(code, error.node.loc);
    //       console.error(columns);
    //     } else {
    //       const columns = codeFrameColumns(code, error.node.loc, {
    //         message: error.message,
    //       });
    //       console.error(columns);
    //     }
    //   }
    // }
    // console.dir(result, { depth: null, colors: true });
    // expect(errors).toHaveLength(1);
    expect(result.components).toHaveLength(2);
  });
});
