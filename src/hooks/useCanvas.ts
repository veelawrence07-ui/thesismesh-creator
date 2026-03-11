import { useState, useCallback, useRef } from "react";

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  width: number;
  height: number;
}

export interface CanvasConnection {
  id: string;
  from: string;
  to: string;
}

interface CanvasState {
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  offset: { x: number; y: number };
  zoom: number;
}

export function useCanvas() {
  const [state, setState] = useState<CanvasState>({
    nodes: [
      {
        id: "node-1",
        x: 0,
        y: 0,
        title: "",
        content: "",
        width: 280,
        height: 160,
      },
    ],
    connections: [],
    offset: { x: 0, y: 0 },
    zoom: 1,
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState<{ x: number; y: number } | null>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const addNode = useCallback((x: number, y: number) => {
    const id = `node-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      nodes: [
        ...prev.nodes,
        { id, x, y, title: "", content: "", width: 280, height: 160 },
      ],
    }));
    return id;
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<CanvasNode>) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== id),
      connections: prev.connections.filter((c) => c.from !== id && c.to !== id),
    }));
    setSelectedNode(null);
  }, []);

  const addConnection = useCallback((from: string, to: string) => {
    if (from === to) return;
    setState((prev) => {
      const exists = prev.connections.some(
        (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from)
      );
      if (exists) return prev;
      return {
        ...prev,
        connections: [
          ...prev.connections,
          { id: `conn-${Date.now()}`, from, to },
        ],
      };
    });
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== id),
    }));
  }, []);

  const setOffset = useCallback((offset: { x: number; y: number }) => {
    setState((prev) => ({ ...prev, offset }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.2, Math.min(2, zoom)) }));
  }, []);

  return {
    ...state,
    selectedNode,
    setSelectedNode,
    connectingFrom,
    setConnectingFrom,
    connectingMouse,
    setConnectingMouse,
    isPanning,
    panStart,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    setOffset,
    setZoom,
  };
}
