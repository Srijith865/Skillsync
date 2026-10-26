import React, { useState } from 'react';

interface RoadmapWeek {
  week: number;
  title: string;
  tasks: string[];
}

interface RoadmapListProps {
  weeks: RoadmapWeek[];
}

export const RoadmapList: React.FC<RoadmapListProps> = ({ weeks }) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const totalTasks = weeks.reduce((acc, w) => acc + w.tasks.length, 0);
  const doneTasks = Object.values(completedTasks).filter(Boolean).length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono-ui text-sm font-bold" style={{ color: 'var(--cyan)' }}>#</span>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">30-Day Skill Closure Roadmap</h3>
            <p className="font-mono-ui text-[10px] tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
              4-WEEK ACCELERATOR · {totalTasks} TASKS
            </p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="flex items-center gap-3 min-w-[160px]">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between">
              <span className="font-mono-ui text-[10px] tracking-widest" style={{ color: 'var(--text-muted)' }}>PROGRESS</span>
              <span className="font-mono-ui text-[10px] font-bold" style={{ color: 'var(--green)' }}>
                {doneTasks}/{totalTasks}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, var(--blue), var(--green))`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Week Accordions */}
      <div className="space-y-2">
        {weeks.map((weekItem, index) => {
          const weekNumber = weekItem.week || index + 1;
          const isExpanded = expandedWeek === index;
          const weekDone = weekItem.tasks.filter((_, ti) => completedTasks[`w${weekNumber}-t${ti}`]).length;

          return (
            <div
              key={weekNumber}
              className="overflow-hidden"
              style={{
                background: 'var(--dark)',
                border: `1px solid ${isExpanded ? 'rgba(0,0,242,0.4)' : 'var(--border)'}`,
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Week Header */}
              <button
                type="button"
                onClick={() => setExpandedWeek(isExpanded ? null : index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgba(0,0,242,0.03)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono-ui text-[9px] font-bold tracking-widest px-2 py-1"
                    style={{
                      background: 'rgba(0,0,242,0.15)',
                      border: '1px solid rgba(0,0,242,0.4)',
                      color: 'var(--cyan)',
                    }}
                  >
                    W{String(weekNumber).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-white">{weekItem.title}</div>
                    <div className="font-mono-ui text-[9px] tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      DAYS {(weekNumber - 1) * 7 + 1}–{weekNumber * 7}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="font-mono-ui text-[10px]"
                    style={{ color: weekDone === weekItem.tasks.length ? 'var(--green)' : 'var(--text-muted)' }}
                  >
                    {weekDone}/{weekItem.tasks.length}
                  </span>
                  <span
                    className="font-mono-ui text-xs transition-transform"
                    style={{
                      color: 'var(--text-muted)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ↓
                  </span>
                </div>
              </button>

              {/* Tasks */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-1.5" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="pt-3 space-y-1.5">
                    {weekItem.tasks.map((task, tIndex) => {
                      const taskId = `w${weekNumber}-t${tIndex}`;
                      const isDone = Boolean(completedTasks[taskId]);
                      return (
                        <button
                          key={taskId}
                          type="button"
                          onClick={() => toggleTask(taskId)}
                          className="roadmap-item w-full text-left"
                          style={{
                            borderLeftColor: isDone ? 'var(--green)' : 'var(--border)',
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-4 h-4 flex items-center justify-center mt-0.5 transition-all"
                            style={{
                              border: `1.5px solid ${isDone ? 'var(--green)' : 'var(--border-2)'}`,
                              background: isDone ? 'rgba(0,212,106,0.12)' : 'transparent',
                            }}
                          >
                            {isDone && (
                              <span className="font-mono-ui text-[9px] font-bold" style={{ color: 'var(--green)' }}>✓</span>
                            )}
                          </div>
                          <span
                            className="font-mono-ui text-[11px] leading-relaxed"
                            style={{
                              color: isDone ? 'var(--text-dim)' : 'var(--cream)',
                              textDecoration: isDone ? 'line-through' : 'none',
                            }}
                          >
                            {task}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
