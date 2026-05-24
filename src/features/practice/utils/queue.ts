export function moveCurrentItemToEnd<T>(orderIds: readonly T[], currentIndex: number): T[] {
  if (orderIds.length <= 1 || currentIndex < 0 || currentIndex >= orderIds.length) {
    return [...orderIds];
  }

  const nextOrder = [...orderIds];
  const [currentItem] = nextOrder.splice(currentIndex, 1);
  if (typeof currentItem === "undefined") {
    return [...orderIds];
  }
  nextOrder.push(currentItem);
  return nextOrder;
}

export function getNextIndexAfterSkip<T>(orderIds: readonly T[], currentIndex: number): number {
  if (orderIds.length <= 0) {
    return 0;
  }

  return Math.min(Math.max(currentIndex, 0), orderIds.length - 1);
}

export function preserveCompletedItems<T>(
  orderIds: readonly T[],
  completedIds: readonly T[],
): T[] {
  const completed = new Set(completedIds);
  const completedInOrder = orderIds.filter((id) => completed.has(id));
  const remainingInOrder = orderIds.filter((id) => !completed.has(id));
  return [...completedInOrder, ...remainingInOrder];
}
