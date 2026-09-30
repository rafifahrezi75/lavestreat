export function parseFraming(framing) {
  if (!framing) {
    return { zoom: 1, x: 0, y: 0 };
  }
  return {
    zoom: typeof framing.zoom === 'number' ? Math.max(1, Math.min(4, framing.zoom)) : 1,
    x: typeof framing.x === 'number' ? Math.max(-100, Math.min(100, framing.x)) : 0,
    y: typeof framing.y === 'number' ? Math.max(-100, Math.min(100, framing.y)) : 0
  };
}

export function getImageFramingStyle(itemOrSlot, type = 'before') {
  if (!itemOrSlot) return {};

  const framingData = type === 'after'
    ? (itemOrSlot.framing_after || itemOrSlot.framing?.after)
    : (itemOrSlot.framing_before || itemOrSlot.framing?.before || itemOrSlot.framing);

  if (framingData && (framingData.zoom > 1 || framingData.x !== 0 || framingData.y !== 0)) {
    const parsed = parseFraming(framingData);
    return {
      transform: `translate(${parsed.x}%, ${parsed.y}%) scale(${parsed.zoom})`,
      transformOrigin: 'center center'
    };
  }

  const fallbackPos = itemOrSlot.object_position || (
    (itemOrSlot.pos_x != null && itemOrSlot.pos_y != null)
      ? `${itemOrSlot.pos_x}% ${itemOrSlot.pos_y}%`
      : '50% 50%'
  );

  return { objectPosition: fallbackPos };
}
