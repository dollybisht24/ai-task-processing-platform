import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import toast from 'react-hot-toast';
import {
  X,
  Play,
  Type,
  CaseLower,
  ArrowLeftRight,
  Hash,
  Loader2
} from 'lucide-react';

const operations = [
  {
    id: 'UPPERCASE',
    title: 'Uppercase',
    icon: Type,
    description: 'Converts all characters to uppercase'
  },
  {
    id: 'LOWERCASE',
    title: 'Lowercase',
    icon: CaseLower,
    description: 'Converts all characters to lowercase'
  },
  {
    id: 'REVERSE_STRING',
    title: 'Reverse String',
    icon: ArrowLeftRight,
    description: 'Reverses the sequence of characters'
  },
  {
    id: 'WORD_COUNT',
    title: 'Word Count',
    icon: Hash,
    description: 'Counts the number of words in payload'
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
    toast.success(`Loaded: ${preset.label}`, { id: 'preset-loaded' });
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
      toast.success('Task enqueued successfully!', { id: 'task-created' });

      // Reset form
      setTitle('');
      setInputText('');
      setOperation('UPPERCASE');
      onClose();

      if (onTaskCreated) {
        onTaskCreated(created);
      }

      navigate(`/tasks/${created.taskId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-98 duration-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create Task</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit a text payload to the asynchronous background worker
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick Presets
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reverse Customer Name"
              maxLength={200}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Operation Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Operation <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {operations.map((op) => {
                const Icon = op.icon;
                const isSelected = operation === op.id;
                return (
                  <div
                    key={op.id}
                    onClick={() => setOperation(op.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="font-semibold text-xs">{op.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{op.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input Text Payload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Input Text <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {charCount} chars &bull; {wordCount} words
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to process..."
              rows={4}
              maxLength={50000}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 font-mono text-slate-900 placeholder:font-sans placeholder:text-slate-400"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-xs transition-colors disabled:opacity-50"
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
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
