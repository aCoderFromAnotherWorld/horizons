'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils.js';

function DraggableCard({ id, emoji, label, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl p-3 min-w-[80px] min-h-[80px]',
        'bg-white/20 border-2 border-white/30 cursor-grab active:cursor-grabbing select-none',
        'touch-none transition-all duration-150',
        isDragging   && 'opacity-30 scale-95',
        disabled     && 'pointer-events-none opacity-30',
      )}
    >
      <span className="text-5xl leading-none">{emoji}</span>
      {label && (
        <p className="text-xs text-white/90 font-medium mt-1.5 text-center leading-tight max-w-[90px]">
          {label}
        </p>
      )}
    </div>
  );
}

function DroppableBucket({ id, emoji, label }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl px-3 py-4 min-w-[72px] min-h-[72px]',
        'border-2 transition-all duration-150 select-none',
        isOver
          ? 'bg-white/40 border-white scale-108 shadow-xl ring-4 ring-white/60'
          : 'bg-white/15 border-white/25',
      )}
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <p className="text-xs text-white font-semibold mt-1">{label}</p>
    </div>
  );
}

/**
 * Drag-and-drop component: draggable emoji cards → droppable emotion buckets.
 *
 * Props:
 *   items    — array of { id, emoji, label? } — the draggable cards
 *   targets  — array of { id, emoji, label }  — the drop zones
 *   onDrop   — (itemId: string, targetId: string) => void
 *   disabled — boolean (disable all interactions)
 */
export default function DragDropSortable({ items = [], targets = [], onDrop, disabled = false }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;
    if (targets.find(t => t.id === over.id)) {
      onDrop(active.id, over.id);
    }
  }

  const activeItem = items.find(i => i.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Draggable cards */}
      <div className="flex flex-wrap justify-center gap-4">
        {items.map(item => (
          <DraggableCard
            key={item.id}
            id={item.id}
            emoji={item.emoji}
            label={item.label}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Drop targets — rendered by parent below this component or inside via slot */}
      <div className="flex justify-center gap-3 flex-wrap mt-4">
        {targets.map(target => (
          <DroppableBucket key={target.id} id={target.id} emoji={target.emoji} label={target.label} />
        ))}
      </div>

      {/* Drag overlay — follows pointer/finger */}
      <DragOverlay dropAnimation={null}>
        {activeItem && (
          <div className="flex flex-col items-center bg-white/30 rounded-2xl p-4 shadow-2xl border border-white/40 scale-110 pointer-events-none">
            <span className="text-6xl leading-none">{activeItem.emoji}</span>
            {activeItem.label && (
              <p className="text-xs text-white font-medium mt-1 max-w-[100px] text-center leading-tight">
                {activeItem.label}
              </p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
