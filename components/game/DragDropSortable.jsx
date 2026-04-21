"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export default function DragDropSortable({ children, onDragEnd, onDragStart }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd} onDragStart={onDragStart}>
      {children}
    </DndContext>
  );
}
