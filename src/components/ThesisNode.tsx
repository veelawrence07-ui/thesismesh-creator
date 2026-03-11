import { useRef, useEffect, useState } from "react";
import type { CanvasNode } from "@/hooks/useCanvas";

interface ThesisNodeProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasNode>) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onConnectStart: () => void;
}

const ThesisNode = ({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDragStart,
  onConnectStart,
}: ThesisNodeProps) => {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSelected && !node.title && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isSelected, node.title]);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div
      className={`thesis-node absolute cursor-grab active:cursor-grabbing select-none ${
        isSelected ? "selected" : ""
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: 80,
      }}
      onMouseDown={(e) => {
        if (isEditing) return;
        e.stopPropagation();
        onSelect();
        onDragStart(e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        onSelect();
      }}
    >
      <div className="p-5">
        <textarea
          ref={titleRef}
          className="w-full bg-transparent font-display text-xl font-light text-ink resize-none outline-none placeholder:text-trace border-none overflow-hidden"
          placeholder="Untitled thought"
          value={node.title}
          rows={1}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          onChange={(e) => {
            onUpdate({ title: e.target.value });
            autoResize(e.target);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <textarea
          ref={contentRef}
          className="w-full bg-transparent font-body text-sm text-muted-foreground resize-none outline-none placeholder:text-trace border-none mt-2 overflow-hidden leading-relaxed"
          placeholder="Begin writing..."
          value={node.content}
          rows={2}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          onChange={(e) => {
            onUpdate({ content: e.target.value });
            autoResize(e.target);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* Connection handle */}
      <div
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-trace bg-canvas hover:border-brass hover:bg-brass/10 cursor-crosshair transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          onConnectStart();
        }}
        title="Drag to connect"
      />
    </div>
  );
};

export default ThesisNode;
