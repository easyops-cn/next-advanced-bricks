import { parseView } from "./parseView.js";

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

describe("parseSolid", () => {
  test("should parse TSX code with defineContext", () => {
    const view = parseView(code);
    expect(view).toBeTruthy();
  });
});
