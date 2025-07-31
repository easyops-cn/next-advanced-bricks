// import { codeFrameColumns } from "@babel/code-frame";
import { parseJsx } from "./parseJsx.js";

const code = `// 调用 CMDB 实例搜索接口查询 IP 为 192.168.1.3 的主机的实例信息
defineDataSource("matchedHosts", {
  api: "easyops.api.cmdb.instance@PostSearchV3",
  objectId: "HOST",
  params: {
    objectId: "HOST",
    query: {
      ip: { $eq: "192.168.1.3" }
    },
    fields: ["instanceId", "hostname", "memo"],
    pageSize: 1
  },
  // 使用返回的列表数组作为结果
  transform: (DATA) => DATA.list
});

defineVariable("hostDetail", CTX.matchedHosts[0]);

export default (
  <eo-view title="修改主机 192.168.1.3 基本信息">
    <eo-form
      componentId="form-edit-host"
      values={CTX.hostDetail}
      events={{
        "validate.success": {
          action: "call_api",
          payload: {
            api: "easyops.api.cmdb.instance@UpdateInstance",
            params: {
              objectId: "HOST",
              instanceId: CTX.hostDetail.instanceId,
              ...EVENT.detail
            }
          },
          callback: {
            success: [
              {
                action: "show_message",
                payload: {
                  type: "success",
                  content: "已保存"
                }
              },
              {
                action: "refresh_data_source",
                payload: {
                  name: "matchedHosts"
                }
              }
            ]
          }
        }
      }}
    >
      <eo-input name="hostname" label="主机名" />
      <eo-textarea name="memo" label="备注" />
      <eo-button
        type="primary"
        events={{
          click: {
            action: "call_component",
            payload: {
              componentId: "form-edit-host",
              method: "validate"
            }
          }
        }}
      >
        保存
      </eo-button>
    </eo-form>
  </eo-view>
);
`;

describe("parseJsx", () => {
  test("should parse JSX code with defineContext", () => {
    const { errors, ...result } = parseJsx(code);
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
    expect(errors).toHaveLength(0);
    expect(result.components).toHaveLength(1);
  });
});
