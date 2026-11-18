import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import toast from 'react-hot-toast';
import { X, Play, Type, ArrowDownAZ, ArrowLeftRight, Hash, Loader2 } from 'lucide-react';

const operations = [
  {
    id: 'UPPERCASE',
    title: 'Uppercase',
    icon: Type,
    description: 'Transform all characters into capital letters',
    example: '"hello world" → "HELLO WORLD"'
  },
  {
    id: 'LOWERCASE',
    title: 'Lowercase',
    icon: ArrowDownAZ,
    description: 'Transform all characters into lowercase letters',
    example: '"HELLO WORLD" → "hello world"'
  },
  {
    id: 'REVERSE_STRING',
    title: 'Reverse String',
    icon: ArrowLeftRight,
    description: 'Reverse the full string sequence character-by-character',
    example: '"Hello World" → "dlroW olleH"'
  },
  {
    id: 'WORD_COUNT',
    title: 'Word Count',
    icon: Hash,
    description: 'Calculate the total count of whitespace-delimited words',
    example: '"I am learning MERN" → 4'
  }
];

export const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operation, setOperation] = useState('UPPERCASE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      toast.success('Task submitted to Redis queue!');

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-surface-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-slate-50/70">
          <div>
            <h2 className="text-lg font-semibold text-content-primary">Create New AI Task</h2>
            <p className="text-xs text-content-secondary mt-0.5">
              Submit a text processing payload to be asynchronously executed by Python workers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sanitize Customer Review Payload"
              maxLength={200}
              className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors text-content-primary placeholder:text-content-muted"
              required
            />
          </div>

          {/* Operation Selector Cards */}
          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">
              Select Text Processing Operation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {operations.map((op) => {
                const Icon = op.icon;
                const isSelected = operation === op.id;
                return (
                  <div
                    key={op.id}
                    onClick={() => setOperation(op.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand bg-brand-light/60 ring-1 ring-brand'
                        : 'border-surface-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-md ${isSelected ? 'bg-brand text-white' : 'bg-slate-100 text-content-secondary'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="font-medium text-sm text-content-primary">{op.title}</div>
                    </div>
                    <p className="text-xs text-content-secondary mt-1.5 line-clamp-1">{op.description}</p>
                    <span className="inline-block mt-1 font-mono text-[11px] text-brand/80">{op.example}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input Text Payload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-content-primary uppercase tracking-wider">
                Input Text Payload
              </label>
              <span className="text-[11px] text-content-secondary font-mono">
                {inputText.length} / 50,000 characters
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter or paste text to be processed by background Python worker..."
              rows={5}
              maxLength={50000}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors text-content-primary font-mono placeholder:font-sans placeholder:text-content-muted"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enqueuing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
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
