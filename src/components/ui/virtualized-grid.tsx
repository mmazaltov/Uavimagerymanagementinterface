import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type GridItemSize = {
  width: number;
  height: number;
};

type VirtualizedGridProps<T> = {
  items: T[];
  renderItem: (item: T, index: number, size: GridItemSize) => ReactNode;
  itemKey?: (item: T, index: number) => string | number;
  className?: string;
  fallbackClassName?: string;
  gap?: number;
  overscan?: number;
  aspectRatio?: number;
  minItemsForVirtualization?: number;
};

const getScrollParent = (element: HTMLElement | null): HTMLElement | null => {
  if (!element || typeof window === "undefined") return null;
  let parent: HTMLElement | null = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY)) return parent;
    parent = parent.parentElement;
  }
  return document.scrollingElement as HTMLElement;
};

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemKey,
  className,
  fallbackClassName,
  gap = 16,
  overscan = 2,
  aspectRatio = 16 / 9,
  minItemsForVirtualization = 12,
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);
  const [isMd, setIsMd] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;
    const element = containerRef.current;
    const parent = getScrollParent(element);
    if (!parent) return;

    const updateMetrics = () => {
      const parentRect = parent.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      setOffsetTop(rect.top - parentRect.top + parent.scrollTop);
      setViewportHeight(parent.clientHeight);
      setContainerWidth(element.clientWidth);
    };

    const handleScroll = () => setScrollTop(parent.scrollTop);
    const handleResize = () => {
      setIsMd(window.innerWidth >= 768);
      updateMetrics();
    };

    updateMetrics();
    parent.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => updateMetrics());
    resizeObserver.observe(element);

    return () => {
      parent.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  const columns = isMd ? 3 : 1;
  const itemWidth =
    columns > 0
      ? Math.floor((containerWidth - gap * (columns - 1)) / columns)
      : 0;
  const itemHeight = itemWidth ? Math.round(itemWidth / aspectRatio) : 0;
  const rowHeight = itemHeight + gap;
  const totalRows = itemWidth ? Math.ceil(items.length / columns) : items.length;
  const totalHeight = totalRows > 0 ? totalRows * rowHeight - gap : 0;

  const shouldFallback = !itemWidth || items.length <= minItemsForVirtualization;

  const visibleRange = useMemo(() => {
    if (shouldFallback || rowHeight === 0) {
      return { startIndex: 0, endIndex: items.length };
    }

    const viewportTop = scrollTop - offsetTop;
    const startRow = Math.max(0, Math.floor(viewportTop / rowHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((viewportTop + viewportHeight) / rowHeight) + overscan,
    );

    const startIndex = startRow * columns;
    const endIndex = Math.min(items.length, (endRow + 1) * columns);
    return { startIndex, endIndex };
  }, [
    shouldFallback,
    rowHeight,
    scrollTop,
    offsetTop,
    viewportHeight,
    overscan,
    items.length,
    totalRows,
    columns,
  ]);

  if (shouldFallback) {
    return (
      <div ref={containerRef} className={fallbackClassName ?? className}>
        {items.map((item, index) => (
          <div key={itemKey ? itemKey(item, index) : index}>
            {renderItem(item, index, { width: 0, height: 0 })}
          </div>
        ))}
      </div>
    );
  }

  const visibleItems = items.slice(visibleRange.startIndex, visibleRange.endIndex);

  return (
    <div ref={containerRef} className={className}>
      <div style={{ position: "relative", height: totalHeight }}>
        {visibleItems.map((item, offset) => {
          const index = visibleRange.startIndex + offset;
          const row = Math.floor(index / columns);
          const col = index % columns;
          const top = row * rowHeight;
          const left = col * (itemWidth + gap);
          return (
            <div
              key={itemKey ? itemKey(item, index) : index}
              style={{
                position: "absolute",
                top,
                left,
                width: itemWidth,
                height: itemHeight,
              }}
            >
              {renderItem(item, index, { width: itemWidth, height: itemHeight })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
