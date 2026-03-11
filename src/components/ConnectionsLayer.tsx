import type { CanvasNode, CanvasConnection } from "@/hooks/useCanvas";

interface ConnectionsLayerProps {
  connections: CanvasConnection[];
  nodes: CanvasNode[];
  connectingFrom: string | null;
  connectingMouse: { x: number; y: number } | null;
  nodesMap: Map<string, CanvasNode>;
}

const ConnectionsLayer = ({
  connections,
  nodes,
  connectingFrom,
  connectingMouse,
  nodesMap,
}: ConnectionsLayerProps) => {
  const getNodeCenter = (id: string) => {
    const node = nodesMap.get(id);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + node.width / 2, y: node.y + 80 };
  };

  const makePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const cp = Math.abs(dx) * 0.4;
    return `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
      {connections.map((conn) => {
        const from = getNodeCenter(conn.from);
        const to = getNodeCenter(conn.to);
        return (
          <path
            key={conn.id}
            className="thread-connection animate-settle"
            d={makePath(from.x, from.y, to.x, to.y)}
            strokeDasharray="4 3"
          />
        );
      })}
      {connectingFrom && connectingMouse && (
        <path
          className="thread-connection active"
          d={makePath(
            getNodeCenter(connectingFrom).x,
            getNodeCenter(connectingFrom).y,
            connectingMouse.x,
            connectingMouse.y
          )}
          strokeDasharray="6 4"
          opacity={0.6}
        />
      )}
    </svg>
  );
};

export default ConnectionsLayer;
