interface RadialMenuProps {
  x: number;
  y: number;
  onAddNode: () => void;
  onDelete?: () => void;
  onConnect?: () => void;
  onClose: () => void;
  hasSelection: boolean;
}

const RadialMenu = ({
  x,
  y,
  onAddNode,
  onDelete,
  onConnect,
  onClose,
  hasSelection,
}: RadialMenuProps) => {
  const items = [
    { label: "New thought", action: onAddNode },
    ...(hasSelection && onConnect ? [{ label: "Connect", action: onConnect }] : []),
    ...(hasSelection && onDelete ? [{ label: "Remove", action: onDelete }] : []),
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="radial-menu absolute z-50 animate-fade-in rounded-sm py-1.5 min-w-[160px]"
        style={{ left: x, top: y }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            className="w-full text-left px-4 py-2 font-body text-sm text-ink hover:bg-brass/10 hover:text-brass transition-colors"
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default RadialMenu;
