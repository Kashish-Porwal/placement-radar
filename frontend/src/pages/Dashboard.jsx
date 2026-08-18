import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { getApplications, updateApplicationStatus, deleteApplication } from '../services/api';
import NewAppModal from '../components/NewAppModal';
import TaskDetailModal from '../components/TaskDetailModal';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import { formatDistanceToNow } from 'date-fns';
import confetti from 'canvas-confetti';

const triggerOfferConfetti = () => {
  const count = 200;
  const defaults = { origin: { y: 0.6 } };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

const initialColumns = [
  { id: 'Applied', title: 'Applied', color: 'border-blue-500' },
  { id: 'OA', title: 'OA / Screening', color: 'border-yellow-500' },
  { id: 'Interview_R1', title: 'Interview R1', color: 'border-purple-500' },
  { id: 'Interview_R2', title: 'Interview R2', color: 'border-purple-400' },
  { id: 'Offer', title: 'Offer', color: 'border-green-500' },
  { id: 'Rejected', title: 'Rejected', color: 'border-red-500' },
];

const getPlatformColor = (platform) => {
  switch(platform) {
    case 'LinkedIn': return 'bg-[#0077b5]/20 text-[#0077b5] border-[#0077b5]/50';
    case 'Naukri': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'Wellfound': return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'Internshala': return 'bg-sky-500/20 text-sky-400 border-sky-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

const TaskCardContent = ({ task, onDelete, onSelect }) => {
  const [imgError, setImgError] = useState(false);
  const [logoStep, setLogoStep] = useState(0);
  const [tiltStyle, setTiltStyle] = useState({});

  if (!task) return null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 14;
    const rotateY = (x / rect.width) * 14;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  };

  const dateStr = task.appliedDate ? formatDistanceToNow(new Date(task.appliedDate), { addSuffix: true }) : 'Recently';

  const getCompanyLogo = (task, step = 0) => {
    let rawName = (task.company || '').toLowerCase().trim().replace(/\s+/g, '');
    let cleanName = (task.company || '').toLowerCase().trim();
    cleanName = cleanName.replace(/\b(solutions|inc|llc|pvt|ltd|limited|technologies|tech|corp|corporation|labs|systems|group)\b/gi, '').trim();
    cleanName = cleanName.replace(/[^a-z0-9]/g, '');

    if (step === 0) return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${rawName}.com&size=128`;
    if (step === 1) return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${cleanName}inc.com&size=128`;
    if (step === 2) return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${cleanName}.com&size=128`;
    if (step === 3) return `https://logo.clearbit.com/${cleanName}inc.com`;
    return null;
  };

  const logoUrl = getCompanyLogo(task, logoStep);

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="glass-card p-4 hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)] cursor-grab active:cursor-grabbing border-white/10 hover:border-primary-cyan/40 group relative overflow-hidden transform-gpu"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/30 to-primary-cyan/30 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 shadow-sm">
            {!imgError && logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${task.company} logo`}
                className="w-full h-full object-contain p-1 bg-white rounded-lg"
                onError={() => {
                  if (logoStep < 3) {
                    setLogoStep(prev => prev + 1);
                  } else {
                    setImgError(true);
                  }
                }}
              />
            ) : (
              <span className="text-sm font-bold text-white uppercase bg-gradient-to-tr from-primary to-primary-cyan w-full h-full flex items-center justify-center">
                {(task.company || 'C').charAt(0)}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base text-white">{task.company}</h3>
        </div>
        <button 
          className="text-gray-400 hover:text-red-500 p-1 transition-colors z-10"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(task._id);
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-sm text-gray-300 mb-3">{task.role}</p>
      
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPlatformColor(task.platform)}`}>
            {task.platform}
          </span>

          {(task.status === 'Interview_R1' || task.status === 'Interview_R2') && task.interviewDate && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 flex items-center gap-1 animate-pulse">
              📅 {new Date(task.interviewDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(task);
          }}
          className="text-xs px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary-cyan border border-primary/30 font-medium transition-all hover:scale-105"
        >
          ⚡ Paste JD & AI
        </button>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onDelete, onSelect }) => {
  if (!task || !task._id) return null;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id, data: { type: 'Task', task } });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="glass-card p-4 opacity-30 border-primary-cyan border-2 h-[130px] rounded-2xl"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardContent task={task} onDelete={onDelete} onSelect={onSelect} />
    </div>
  );
};

const Column = ({ column, tasks = [], onDelete, onSelect }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const validTasks = tasks.filter(t => t && t._id);

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className={`flex items-center justify-between mb-4 px-2 border-b-2 ${column.color} pb-2`}>
        <h2 className="font-heading font-semibold text-lg text-white">{column.title}</h2>
        <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">{validTasks.length}</span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 min-h-[500px] glass rounded-3xl p-3 bg-white/[0.02] border-white/5 flex flex-col gap-3">
        <SortableContext items={validTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {validTasks.map(task => (
            <TaskCard key={task._id} task={task} onDelete={onDelete} onSelect={onSelect} />
          ))}
        </SortableContext>
        <button className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 py-3 rounded-xl transition-colors border border-dashed border-white/10 hover:border-white/30 mt-2">
          <Plus size={16} /> Add 
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, task: null, targetStatus: null });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getApplications();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppAdd = (newApp) => {
    setTasks(prev => [newApp, ...prev]);
  };

  const handleAppUpdate = (updatedApp) => {
    setTasks(prev => prev.map(t => t._id === updatedApp._id ? updatedApp : t));
    if (selectedTask?._id === updatedApp._id) setSelectedTask(updatedApp);
  };

  const handleAppDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await deleteApplication(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      if (selectedTask?._id === id) setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete application', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleScheduleConfirm = async (taskId, targetStatus, interviewDate) => {
    setTasks(currentTasks => {
      return currentTasks.map(t => {
        if (t && t._id === taskId) {
          return { 
            ...t, 
            status: targetStatus, 
            interviewDate: interviewDate ? new Date(interviewDate) : t.interviewDate 
          };
        }
        return t;
      });
    });

    try {
      await updateApplicationStatus(taskId, targetStatus, interviewDate);
    } catch (error) {
      console.error('Failed to update status', error);
      fetchApplications();
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const currentActiveTask = activeTask;
    setActiveTask(null);

    if (!over || !active || !active.id) return;

    const activeId = active.id;
    const overId = over.id;

    if (!activeId || !overId) return;

    if (activeId === overId) {
      const clickedTask = tasks.find(t => t && t._id === activeId);
      if (clickedTask) setSelectedTask(clickedTask);
      return;
    }

    // Determine target status
    let targetStatus = null;
    const isOverColumn = initialColumns.some(c => c.id === overId);
    
    if (isOverColumn) {
      targetStatus = overId;
    } else {
      const overTask = tasks.find(t => t && t._id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;

    // Check if dragging into Offer column
    if (targetStatus === 'Offer') {
      triggerOfferConfetti();
    }

    // Check if dragging into Interview column
    if (targetStatus === 'Interview_R1' || targetStatus === 'Interview_R2') {
      const draggedApp = currentActiveTask || tasks.find(t => t && t._id === activeId);
      setScheduleModal({
        isOpen: true,
        task: draggedApp,
        targetStatus
      });
      return;
    }

    // Optimistically update state for other columns
    setTasks(currentTasks => {
      const activeIndex = currentTasks.findIndex(t => t && t._id === activeId);
      if (activeIndex === -1) return currentTasks;
      const taskToMove = currentTasks[activeIndex];
      
      if (!taskToMove || taskToMove.status === targetStatus) return currentTasks;

      return [
        ...currentTasks.slice(0, activeIndex),
        { ...taskToMove, status: targetStatus, interviewDate: null },
        ...currentTasks.slice(activeIndex + 1)
      ];
    });

    try {
      await updateApplicationStatus(activeId, targetStatus);
    } catch (error) {
      console.error('Failed to update status', error);
      fetchApplications();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2 flex items-center gap-2">
            Application Tracker
          </h1>
          <p className="text-gray-400 text-sm">Track and manage your job applications through interactive stages.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-gradient-to-r from-primary to-primary-cyan text-white px-6 py-2.5 rounded-full font-medium hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> New Application
        </button>
      </div>

      {/* Storyteller Narrative Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary-cyan/10 border border-white/10 backdrop-blur-md flex items-center justify-between shadow-[0_0_25px_rgba(6,182,212,0.12)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-cyan/20 flex items-center justify-center text-primary-cyan border border-primary-cyan/30 animate-pulse">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase">Career Storyline Narrative</h3>
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Active Journey</span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Current progress: <strong className="text-primary-cyan">{tasks.length} Applications Active</strong> • <span className="text-purple-300 font-semibold">{tasks.filter(t => t?.status?.startsWith('Interview')).length} Scheduled Interviews</span> • <span className="text-green-400 font-semibold">{tasks.filter(t => t?.status === 'Offer').length} Job Offers</span>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        {loading ? (
          <div className="flex h-full items-center justify-center text-primary-cyan">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary-cyan border-t-transparent rounded-full" />
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full items-start">
              {initialColumns.map(col => (
                <Column 
                  key={col.id} 
                  column={col} 
                  tasks={tasks.filter(t => t && t.status === col.id)} 
                  onDelete={handleAppDelete}
                  onSelect={setSelectedTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask && activeTask._id ? (
                <div className="rotate-3 scale-105 shadow-2xl">
                  <TaskCardContent task={activeTask} onDelete={() => {}} onSelect={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <NewAppModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onAdd={handleAppAdd} 
      />

      <TaskDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onUpdate={handleAppUpdate}
      />

      <ScheduleInterviewModal 
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, task: null, targetStatus: null })}
        onConfirm={handleScheduleConfirm}
        task={scheduleModal.task}
        targetStatus={scheduleModal.targetStatus}
      />
    </div>
  );
};

export default Dashboard;
