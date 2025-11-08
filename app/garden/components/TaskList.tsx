'use client';

import { useState } from 'react';
import { createTask, completeTask, deleteTask } from '@/app/actions/tasks';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: Date | null;
}

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    setIsAdding(true);
    const formData = new FormData();
    formData.append('title', newTask);
    await createTask(formData);
    setNewTask('');
    setIsAdding(false);
  }

  async function handleCompleteTask(taskId: string) {
    await completeTask(taskId);
  }

  async function handleDeleteTask(taskId: string) {
    await deleteTask(taskId);
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900"
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={isAdding || !newTask.trim()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="font-semibold text-green-800">Active Tasks ({activeTasks.length})</h3>
        {activeTasks.length === 0 ? (
          <p className="text-green-600 text-sm italic">No active tasks. Add one above!</p>
        ) : (
          activeTasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="flex-shrink-0 w-6 h-6 border-2 border-green-600 rounded hover:bg-green-600 transition-colors"
              />
              <span className="flex-1 text-green-800">{task.title}</span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-green-800">Completed ({completedTasks.length})</h3>
          {completedTasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg opacity-60">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs">
                ✓
              </div>
              <span className="flex-1 text-gray-600 line-through">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
