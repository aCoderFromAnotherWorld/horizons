'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskTimer from '@/components/game/TaskTimer.jsx';
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
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TIMEOUT_MS = 10000;

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

// ── tap_target ────────────────────────────────────────────────────────────────

function TapTarget({ task, onComplete }) {
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const [tapped, setTapped] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timerRef.current?.start();
    startRef.current = now();
    timeoutRef.current = setTimeout(() => {
      if (!tapped) {
        setTapped(true);
        onComplete(2, false, TIMEOUT_MS);
      }
    }, TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTap() {
    if (tapped) return;
    clearTimeout(timeoutRef.current);
    setTapped(true);
    const elapsed = now() - startRef.current;
    const pts = elapsed < 2000 ? 0 : elapsed < 5000 ? 1 : 2;
    await delayMs(300);
    onComplete(pts, pts === 0, elapsed);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <TaskTimer ref={timerRef} />
      <p className="text-white/80 text-base font-semibold text-center px-4">{task.prompt}</p>
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={handleTap}
        disabled={tapped}
        className="flex items-center justify-center rounded-3xl bg-white/20 border-2 border-white/35 min-w-[140px] min-h-[140px] select-none disabled:pointer-events-none hover:bg-white/30 transition-all"
      >
        <span className="text-8xl leading-none">{task.emoji}</span>
      </motion.button>
      <p className="text-white/60 text-sm">Tap it!</p>
    </div>
  );
}

// ── grid_select ───────────────────────────────────────────────────────────────

function GridSelect({ task, onComplete }) {
  const startRef = useRef(null);
  const timeoutRef = useRef(null);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    startRef.current = now();
    timeoutRef.current = setTimeout(() => {
      if (!tapped) {
        setTapped(true);
        onComplete(2, false, TIMEOUT_MS);
      }
    }, TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTap(opt) {
    if (tapped) return;
    clearTimeout(timeoutRef.current);
    setTapped(true);
    const elapsed = now() - startRef.current;
    await delayMs(300);
    onComplete(opt.correct ? 0 : opt.scorePoints, opt.correct, elapsed);
  }

  const cols = task.options.length <= 2 ? 'grid-cols-2' : task.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <p className="text-white/80 text-base font-semibold text-center">{task.prompt}</p>
      <motion.div
        className="flex items-center justify-center rounded-3xl bg-white/15 border border-white/25 p-6"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
      >
        <span className="text-8xl leading-none">{task.emoji}</span>
      </motion.div>
      <div className={`grid ${cols} gap-3 w-full`}>
        {task.options.map((opt, i) => (
          <motion.button
            key={opt.label + i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: i * 0.07, type: 'spring', stiffness: 320, damping: 22 } }}
            whileTap={{ scale: 0.88 }}
            onClick={() => handleTap(opt)}
            disabled={tapped}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/20 border-2 border-white/25 hover:bg-white/30 transition-all min-h-[80px] select-none disabled:pointer-events-none py-3"
          >
            <span className="text-4xl leading-none">{opt.emoji}</span>
            <span className="text-white/90 text-xs font-semibold">{opt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── scenario_choice ───────────────────────────────────────────────────────────

function ScenarioChoice({ task, onComplete }) {
  const startRef = useRef(null);
  const timeoutRef = useRef(null);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    startRef.current = now();
    timeoutRef.current = setTimeout(() => {
      if (!tapped) {
        setTapped(true);
        onComplete(2, false, TIMEOUT_MS);
      }
    }, TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTap(opt) {
    if (tapped) return;
    clearTimeout(timeoutRef.current);
    setTapped(true);
    const elapsed = now() - startRef.current;
    await delayMs(300);
    onComplete(opt.scorePoints, opt.scorePoints === 0, elapsed);
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <span className="text-6xl">{task.emoji}</span>
      <div className="bg-white/15 rounded-3xl px-6 py-5 border border-white/25 text-center">
        <p className="text-white font-semibold text-base leading-snug">{task.prompt}</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {task.options.map((opt, i) => (
          <motion.button
            key={opt.label + i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.09 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTap(opt)}
            disabled={tapped}
            className="flex items-center gap-3 bg-white/20 border-2 border-white/30 rounded-2xl px-5 py-4 text-white font-semibold text-base min-h-[64px] select-none hover:bg-white/30 transition-all disabled:pointer-events-none text-left"
          >
            {opt.emoji && <span className="text-3xl shrink-0">{opt.emoji}</span>}
            <span>{opt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── drag_sort ─────────────────────────────────────────────────────────────────

function SortableItem({ id, emoji, label }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 bg-white/20 border-2 border-white/30 rounded-2xl px-4 py-3 min-h-[64px] select-none touch-none cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-30' : ''}`}
    >
      <span className="text-4xl leading-none">{emoji}</span>
      <span className="text-white font-semibold text-base">{label}</span>
      <span className="ml-auto text-white/40 text-lg">⠿</span>
    </div>
  );
}

function DragSort({ task, onComplete }) {
  const correctOrder = task.options.slice().sort((a, b) => a.correctPos - b.correctPos).map(o => o.id);
  const [items, setItems] = useState(() => task.options.map(o => ({ ...o })));
  const [activeId, setActiveId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const startRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const activeItem = items.find(i => i.id === activeId);

  useEffect(() => {
    startRef.current = now();
  }, []);

  async function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const elapsed = now() - startRef.current;
    const currentOrder = items.map(i => i.id);
    let errors = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      if (currentOrder[i] !== correctOrder[i]) errors++;
    }
    const pts = Math.min(errors, 3);
    await delayMs(300);
    onComplete(pts, pts === 0, elapsed);
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <p className="text-white/80 text-base font-semibold text-center">{task.prompt}</p>
      <p className="text-white/60 text-sm">Drag to put them in the right order 👆</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={({ active, over }) => {
          setActiveId(null);
          if (over && active.id !== over.id) {
            setItems(prev => {
              const oldIdx = prev.findIndex(i => i.id === active.id);
              const newIdx = prev.findIndex(i => i.id === over.id);
              return arrayMove(prev, oldIdx, newIdx);
            });
          }
        }}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 w-full">
            {items.map(item => (
              <SortableItem key={item.id} id={item.id} emoji={item.emoji} label={item.label} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeItem && (
            <div className="flex items-center gap-3 bg-white/30 border-2 border-white/50 rounded-2xl px-4 py-3 shadow-2xl pointer-events-none">
              <span className="text-4xl leading-none">{activeItem.emoji}</span>
              <span className="text-white font-semibold">{activeItem.label}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={submitted}
        className="bg-white text-indigo-900 font-extrabold text-lg rounded-2xl px-10 py-4 min-h-[64px] shadow-xl select-none disabled:opacity-50 disabled:pointer-events-none w-full"
      >
        Done! ✅
      </motion.button>
    </div>
  );
}

// ── Main DynamicTask ──────────────────────────────────────────────────────────

/**
 * Renders the appropriate interactive UI for a Chapter 6 task.
 *
 * Props:
 *   task       — task descriptor from CHAPTER6_TASK_POOL
 *   onComplete — (scorePoints: number, isCorrect: boolean, responseTimeMs: number) => void
 */
export default function DynamicTask({ task, onComplete }) {
  if (!task) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={task.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center w-full"
      >
        {task.mechanic === 'tap_target' && (
          <TapTarget task={task} onComplete={onComplete} />
        )}
        {task.mechanic === 'grid_select' && (
          <GridSelect task={task} onComplete={onComplete} />
        )}
        {task.mechanic === 'scenario_choice' && (
          <ScenarioChoice task={task} onComplete={onComplete} />
        )}
        {task.mechanic === 'drag_sort' && (
          <DragSort task={task} onComplete={onComplete} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
