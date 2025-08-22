// import { codeFrameColumns } from "@babel/code-frame";
import { parseTsx } from "./parseTsx.js";

const code = `
// 构造表格组件需要的数据结构
const tableData = {
  list: RESPONSE.processes
};

export default (
  <View title="进程列表">
    <Table
      dataSource={tableData}
      columns={[
        { dataIndex: "cmdline", key: "cmdline", title: "命令行" },
        { dataIndex: "cpu_time", key: "cpu_time", title: "CPU 时间" },
        { dataIndex: "cpu_usage_percent", key: "cpu_usage_percent", title: "CPU 使用率" },
        { dataIndex: "cwd", key: "cwd", title: "当前工作目录" },
        { dataIndex: "memory_rss", key: "memory_rss", title: "内存使用量" },
        { dataIndex: "memory_swap", key: "memory_swap", title: "交换内存使用量" },
        { dataIndex: "memory_usage_percent", key: "memory_usage_percent", title: "内存使用率" },
        { dataIndex: "memory_vms", key: "memory_vms", title: "虚拟内存使用量" },
        { dataIndex: "open_fd_count", key: "open_fd_count", title: "打开的文件描述符数量" },
        { dataIndex: "pid", key: "pid", title: "进程 ID" },
        { dataIndex: "process_name", key: "process_name", title: "进程名称" },
        { dataIndex: "start_time", key: "start_time", title: "启动时间" },
        { dataIndex: "status", key: "status", title: "状态" }
      ]}
      rowKey="pid"
    />
  </View>
);

`;

describe("parseTsx", () => {
  test("should parse TSX code with defineContext", () => {
    const { errors, componentsMap, source, ...result } = parseTsx(code, {
      withContexts: ["RESPONSE"],
    });
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
    expect(result.components).toHaveLength(1);
  });
});
