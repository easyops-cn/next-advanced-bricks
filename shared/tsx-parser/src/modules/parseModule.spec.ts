/* eslint-disable no-console */
// import { codeFrameColumns } from "@babel/code-frame";
import { parseTsx } from "../parseTsx.js";

const code = `
import { useState, useResource, useQuery, pushQuery, callApi } from "next-tsx";

function MyCounter({
  x,
  y,
  onClick,
}) {
  const [z, setZ] = useState(1);
  const v = (x * y * z) as number;

  const [time] = useResource(() => callApi("getTime", { timezone: "+8" }));

  return (
    <Button onClick={() => {
      setZ(z + 1);
      onClick();
    }}>
      {v}
    </Button>
  );
}

export default function() {
  const [count, setCount] = useState(0);
  const query = useQuery();

  const [data] = useResource(() => callApi("getCount", { initial: query.start }));

  return (
    <View title="测试页面">
      <MyCounter x={2} y={3} onClick={() => {
        pushQuery({ start: 0 });
      }} />
      {(count as number).toFixed(1)}
    </View>
  );
}
`;

describe("parseModule", () => {
  test("should parse TSX code with defineContext", () => {
    const result = parseTsx(code, {
      // filename: "test.tsx",
    });
    console.warn(result?.errors);
    console.dir(result, { depth: null });
    // console.log(...result!.defaultExport!.bindingMap.entries());
    // console.log(...result!.internalComponents.map((c) => [...c.bindingMap.entries()]));
  });
});
