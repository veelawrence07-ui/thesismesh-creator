import { useCallback, useRef, useMemo } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import ThesisNode from "@/components/ThesisNode";
import ConnectionsLayer from "@/components/ConnectionsLayer";
import RadialMenu from "@/components/RadialMenu";
import { useState } from "react";

const Canvas = () => {
  const canvas = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ nodeId: string; startX: number; startY: number; nodeStartX: number; nodeStartY: number } | null>(null);

  const nodesMap = useMemo(
    () => new Map(canvas.nodes.map((n) => [n.id, n])),
    [canvas.nodes]
  );

  const screenToCanvas = useCallback(
    (sx: number, sy: number) => {
      return {
        x: (sx - canvas.offset.x) / canvas.zoom,
        y: (sy - canvas.offset.y) / canvas.zoom,
      };
    },
    [canvas.offset, canvas.zoom]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        canvas.setZoom(canvas.zoom * delta);
      } else {
        canvas.setOffset({
          x: canvas.offset.x - e.deltaX * 0.8,
          y: canvas.offset.y - e.deltaY * 0.8,
        });
      }
    },
    [canvas]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        canvas.isPanning.current = true;
        canvas.panStart.current = { x: e.clientX - canvas.offset.x, y: e.clientY - canvas.offset.y };
        canvas.setSelectedNode(null);
      }
    },
    [canvas]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (canvas.isPanning.current) {
        canvas.setOffset({
          x: e.clientX - canvas.panStart.current.x,
          y: e.clientY - canvas.panStart.current.y,
        });
      }
      if (dragRef.current) {
        const dx = (e.clientX - dragRef.current.startX) / canvas.zoom;
        const dy = (e.clientY - dragRef.current.startY) / canvas.zoom;
        canvas.updateNode(dragRef.current.nodeId, {
          x: dragRef.current.nodeStartX + dx,
          y: dragRef.current.nodeStartY + dy,
        });
      }
      if (canvas.connectingFrom) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          canvas.setConnectingMouse(
            screenToCanvas(e.clientX - rect.left, e.clientY - rect.top)
          );
        }
      }
    },
    [canvas, screenToCanvas]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      canvas.isPanning.current = false;
      dragRef.current = null;

      if (canvas.connectingFrom) {
        // Check if mouse is over a node
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const cp = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
          for (const node of canvas.nodes) {
            if (
              node.id !== canvas.connectingFrom &&
              cp.x >= node.x &&
              cp.x <= node.x + node.width &&
              cp.y >= node.y &&
              cp.y <= node.y + 160
            ) {
              canvas.addConnection(canvas.connectingFrom, node.id);
              break;
            }
          }
        }
        canvas.setConnectingFrom(null);
        canvas.setConnectingMouse(null);
      }
    },
    [canvas, screenToCanvas]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setContextMenu({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    },
    []
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
        const id = canvas.addNode(pos.x - 140, pos.y - 40);
        canvas.setSelectedNode(id);
      }
    },
    [canvas, screenToCanvas]
  );

  return (
    <div
      ref={containerRef}
      className="canvas-container w-full h-screen overflow-hidden relative cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {/* Title watermark */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none select-none">
        <h1 className="font-display text-2xl font-light text-trace tracking-wide">
          ThesisMesh
        </h1>
      </div>

      {/* Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none">
        <p className="font-body text-xs text-trace tracking-wider">
          Double-click to create a thought · Right-click for options · Drag the circle to connect
        </p>
      </div>

      {/* Transform layer */}
      <div
        className="absolute"
        style={{
          transform: `translate(${canvas.offset.x}px, ${canvas.offset.y}px) scale(${canvas.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <ConnectionsLayer
          connections={canvas.connections}
          nodes={canvas.nodes}
          connectingFrom={canvas.connectingFrom}
          connectingMouse={canvas.connectingMouse}
          nodesMap={nodesMap}
        />

        {canvas.nodes.map((node) => (
          <ThesisNode
            key={node.id}
            node={node}
            isSelected={canvas.selectedNode === node.id}
            onSelect={() => canvas.setSelectedNode(node.id)}
            onUpdate={(updates) => canvas.updateNode(node.id, updates)}
            onDragStart={(e) => {
              dragRef.current = {
                nodeId: node.id,
                startX: e.clientX,
                startY: e.clientY,
                nodeStartX: node.x,
                nodeStartY: node.y,
              };
            }}
            onConnectStart={() => canvas.setConnectingFrom(node.id)}
          />
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <RadialMenu
          x={contextMenu.x}
          y={contextMenu.y}
          hasSelection={!!canvas.selectedNode}
          onAddNode={() => {
            const pos = screenToCanvas(contextMenu.x, contextMenu.y);
            const id = canvas.addNode(pos.x - 140, pos.y - 40);
            canvas.setSelectedNode(id);
          }}
          onDelete={
            canvas.selectedNode
              ? () => canvas.deleteNode(canvas.selectedNode!)
              : undefined
          }
          onConnect={
            canvas.selectedNode
              ? () => canvas.setConnectingFrom(canvas.selectedNode)
              : undefined
          }
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Canvas;
