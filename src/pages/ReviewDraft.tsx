import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowLeft, CheckCircle, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useStore, useActiveWorkspace } from '../store';
import type { Task } from '../types';
import StepBar from '../components/StepBar';
import TaskCard from '../components/TaskCard';
import FairnessProgressBar from '../components/FairnessProgressBar';
import Confetti from '../components/Confetti';

function DraggableTaskWrapper({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={{
          id: task.id,
          name: task.name,
          effortScore: task.effortScore,
          dueDate: task.dueDate,
          recurring: task.recurring,
          done: task.done,
        }}
        hideCheckbox
        rightSlot={
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none transition"
            style={{ color: 'rgba(var(--fg),0.3)' }}
            aria-label="ลากเพื่อย้าย"
          >
            <GripVertical size={16} />
          </button>
        }
      />
    </div>
  );
}

function DragOverlayCard({ task }: { task: Task }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl select-none"
      style={{
        backgroundColor: 'rgba(20,20,40,0.95)',
        border: '1px solid rgba(99,102,241,0.5)',
        boxShadow: '0 16px 48px rgba(99,102,241,0.4)',
        transform: 'rotate(2deg)',
      }}
    >
      <GripVertical size={16} style={{ color: '#a5b4fc' }} />
      <p className="text-sm font-medium" style={{ color: 'rgba(var(--fg),0.9)' }}>
        {task.name}
      </p>
    </div>
  );
}

export default function ReviewDraft() {
  const workspace = useActiveWorkspace();
  const { setStep, reassignTask } = useStore();

  if (!workspace) return null;
  const tasks = workspace.tasks;
  const members = workspace.members;
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const memberTasks = (memberId: string) =>
    tasks.filter((t) => t.assignedTo === memberId);

  const scores: Record<string, number> = {};
  members.forEach((m) => (scores[m.id] = 0));
  tasks.forEach((t) => {
    if (t.assignedTo) scores[t.assignedTo] = (scores[t.assignedTo] ?? 0) + t.effortScore;
  });

  const scoreValues = Object.values(scores);
  const maxScore = Math.max(...scoreValues, 1);
  const groupAvg = scoreValues.length > 0
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    : 0;
  const isBalanced = Math.max(...scoreValues) - Math.min(...scoreValues) <= 2;

  // Fire confetti once on initial balanced state
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (isBalanced) {
      const t = setTimeout(() => setCelebrate(true), 600);
      return () => clearTimeout(t);
    }
  }, [isBalanced]);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  function onDragStart({ active }: DragStartEvent) {
    setActiveTaskId(active.id as string);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTaskId(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetMember = members.find((m) => m.id === overId);
    if (targetMember) {
      reassignTask(taskId, targetMember.id);
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (overTask?.assignedTo) {
      reassignTask(taskId, overTask.assignedTo);
    }
  }

  const cardStyle = {
    backgroundColor: 'rgba(var(--fg),0.03)',
    border: '1px solid rgba(var(--fg),0.08)',
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-8">
      <Confetti trigger={celebrate} />
      <div className="w-full max-w-md">
        {/* Nav */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setStep('tasks')}
            className="flex items-center gap-1 transition text-sm"
            style={{ color: 'rgba(var(--fg),0.45)' }}
          >
            <ArrowLeft size={16} />
            แก้ไขงาน
          </button>
        </div>

        <StepBar current="review" />

        <div className="rounded-2xl p-5 mb-4 backdrop-blur-sm" style={cardStyle}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'rgba(var(--fg),0.9)' }}>
                ตรวจสอบการแบ่งงาน
              </h2>
              <p className="text-sm mt-0.5 font-light" style={{ color: 'rgba(var(--fg),0.4)' }}>
                ลากงานข้ามคอลัมน์เพื่อสลับผู้รับผิดชอบ
              </p>
            </div>
            {isBalanced ? (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  color: 'rgba(16,185,129,0.95)',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <CheckCircle2 size={12} strokeWidth={2.5} />
                สมดุล
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  color: 'rgba(245,158,11,0.95)',
                  backgroundColor: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <AlertTriangle size={12} strokeWidth={2.5} />
                ไม่สมดุล
              </span>
            )}
          </div>

          <div className="space-y-4 mt-4">
            {members.map((m) => (
              <FairnessProgressBar
                key={m.id}
                name={m.name}
                score={scores[m.id] ?? 0}
                color={m.color}
                groupMax={maxScore}
                groupAverage={groupAvg}
              />
            ))}
          </div>
        </div>

        {/* Drag-and-drop columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="space-y-4">
            {members.map((member) => {
              const mTasks = memberTasks(member.id);
              return (
                <div
                  key={member.id}
                  className="rounded-2xl overflow-hidden backdrop-blur-sm"
                  style={cardStyle}
                  id={member.id}
                >
                  <div
                    className="px-5 py-3 flex items-center gap-2"
                    style={{
                      background: `linear-gradient(90deg, ${member.color}25, ${member.color}10)`,
                      borderBottom: '1px solid rgba(var(--fg),0.06)',
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: member.color,
                        boxShadow: `0 0 8px ${member.color}80`,
                      }}
                    />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: 'rgba(var(--fg),0.95)' }}
                    >
                      {member.name}
                    </span>
                    <span className="ml-auto text-xs font-light" style={{ color: 'rgba(var(--fg),0.4)' }}>
                      {scores[member.id]} pts · {mTasks.length} งาน
                    </span>
                  </div>

                  <SortableContext
                    items={mTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="p-3 space-y-2 min-h-14">
                      {mTasks.length === 0 ? (
                        <p
                          className="text-xs text-center py-4 font-light"
                          style={{ color: 'rgba(var(--fg),0.3)' }}
                        >
                          ลากงานมาวางที่นี่
                        </p>
                      ) : (
                        mTasks.map((task) => (
                          <DraggableTaskWrapper key={task.id} task={task} />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? <DragOverlayCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Confirm */}
        <button
          onClick={() => setStep('dashboard')}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-xl font-semibold transition text-sm"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
          }}
        >
          <CheckCircle size={16} />
          ยืนยันและเริ่มติดตามงาน
          <Zap size={16} />
        </button>
      </div>
    </div>
  );
}
