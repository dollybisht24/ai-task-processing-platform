const mongoose = require('mongoose');

const logEntrySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
      default: 'INFO'
    }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    inputText: {
      type: String,
      required: [true, 'Input text is required'],
      maxlength: [50000, 'Input text cannot exceed 50,000 characters']
    },
    operation: {
      type: String,
      required: [true, 'Operation is required'],
      enum: {
        values: ['UPPERCASE', 'LOWERCASE', 'REVERSE_STRING', 'WORD_COUNT'],
        message: '{VALUE} is not a supported operation'
      }
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed'],
      default: 'pending',
      index: true
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    logs: [logEntrySchema],
    errorMessage: {
      type: String,
      default: null
    },
    retryCount: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal querying and performance
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ userId: 1, status: 1 });

// Helper to format task output matching prompt requirements
taskSchema.methods.toClientFormat = function () {
  return {
    taskId: this._id.toString(),
    title: this.title,
    inputText: this.inputText,
    operation: this.operation,
    status: this.status,
    result: this.result,
    logs: this.logs,
    errorMessage: this.errorMessage,
    retryCount: this.retryCount,
    startedAt: this.startedAt,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
