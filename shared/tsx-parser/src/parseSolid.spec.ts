// import { codeFrameColumns } from "@babel/code-frame";
import { parseTsx } from "./parseTsx.js";

const code = `

function MyCounter({
  x,
  y,
  onClick,
}) {
  const [z, setZ] = useState(1);
  const v = x * y * z;

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

  const [data] = useResource(() => callApi("getCount", { initial: 1 }));

  return (
    <View title="测试页面">
      <MyCounter x={2} y={3} />
      {count}
    </View>
  );
}
`;

describe("parseTsx", () => {
  test("should parse TSX code with defineContext", () => {
    const { errors, componentsMap, source, ...result } = parseTsx(code, {
      // withContexts: ["RESPONSE"],
    });
    if (errors.length > 0) {
      // console.warn(errors);
      //   for (const error of errors) {
      //     console.error(error.message);
      //     // if (!error.node) {
      //     //   console.error(error.message);
      //     // } else if (error.message.includes("\n")) {
      //     //   console.error(error.message);
      //     //   const columns = codeFrameColumns(code, error.node.loc);
      //     //   console.error(columns);
      //     // } else {
      //     //   const columns = codeFrameColumns(code, error.node.loc, {
      //     //     message: error.message,
      //     //   });
      //     //   console.error(columns);
      //     // }
      //   }
    }
    // console.dir(result, { depth: null, colors: true });
    // expect(errors).toHaveLength(1);
    expect(result.components).toHaveLength(2);
  });
});
