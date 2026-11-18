import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import toast from 'react-hot-toast';
import {
  X,
  Play,
  Type,
  ArrowDownAZ,
  ArrowLeftRight,
  Hash,
  Loader2,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

const operations = [
  {
    id: 'UPPERCASE',
    title: 'Uppercase',
    icon: Type,
    badge: 'Transform',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'Converts all alphabet characters into uppercase format',
    sampleOutput: 'HELLO WORLD'
  },
  {
    id: 'LOWERCASE',
    title: 'Lowercase',
    icon: ArrowDownAZ,
    badge: 'Transform',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    description: 'Converts all alphabet characters into lowercase format',
    sampleOutput: 'hello world'
  },
  {
    id: 'REVERSE_STRING',
    title: 'Reverse String',
    icon: ArrowLeftRight,
    badge: 'Algorithm',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'Reverses character sequence from end to beginning',
    sampleOutput: 'dlroW olleH'
  },
  {
    id: 'WORD_COUNT',
    title: 'Word Count',
    icon: Hash,
    badge: 'Analytics',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    description: 'Counts total whitespace-delimited tokens accurately',
    sampleOutput: 'Total: 42 words'
  }
];

const PRESETS = [
  {
    label: 'Interview Sample',
    title: 'Assignment Spec Text Transformation',
    text: 'Hello Dolly, Welcome to AI Platform!',
    op: 'UPPERCASE'
  },
  {
    label: 'Reverse Benchmark',
    title: 'Palindrome & String Inversion Test',
    text: 'Hello World',
    op: 'REVERSE_STRING'
  },
  {
    label: 'Word Counter',
    title: 'MERN Stack Essay Analysis',
    text: 'I am learning MERN stack development and building scalable asynchronous background processing pipelines with Redis and Python.',
    op: 'WORD_COUNT'
  }
];

export const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operation, setOperation] = useState('UPPERCASE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setInputText(preset.text);
    setOperation(preset.op);
    toast.success(`Loaded preset: ${preset.label}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!inputText.trim()) {
      toast.error('Please provide input text to process');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await taskService.createTask({
        title: title.trim(),
        inputText: inputText.trim(),
        operation
      });

      const created = res.data.data;
      toast.success('Task enqueued into Redis Stream!');

      // Reset form
      setTitle('');
      setInputText('');
      setOperation('UPPERCASE');
      onClose();

      if (onTaskCreated) {
        onTaskCreated(created);
      }

      // Navigate to task details page to observe status progression
      navigate(`/tasks/${created.taskId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approximate words & characters
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Asynchronous AI Task</h2>
              <p className="text-xs text-slate-500">
                Dispatches a text payload to the Redis Stream consumer group for Python workers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Presets
              </label>
              <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>One-click test samples</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-all active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Normalize Customer Review Text"
              maxLength={200}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400 shadow-2xs font-medium"
              required
            />
          </div>

          {/* Operation Cards */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Choose Text Operation <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {operations.map((op) => {
                const Icon = op.icon;
                const isSelected = operation === op.id;
                return (
                  <div
                    key={op.id}
                    onClick={() => setOperation(op.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-xs text-slate-900">{op.title}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${op.badgeColor}`}>
                        {op.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 leading-snug">{op.description}</p>
                    <div className="mt-1 font-mono text-[10px] text-blue-600/90 truncate bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Sample: {op.sampleOutput}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input Text Payload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Input Text Payload <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                <span>{charCount.toLocaleString()} chars</span>
                <span>•</span>
                <span>{wordCount} words</span>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or write the text content to be sent to the background queue..."
              rows={4}
              maxLength={50000}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 font-mono placeholder:font-sans placeholder:text-slate-400 shadow-2xs"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Queue: <code className="font-mono text-slate-600">tasks:stream</code></span>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enqueuing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
