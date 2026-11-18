import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CreateTaskModal from '../components/CreateTaskModal';

export const DashboardLayout = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-primary">
      <Navbar onOpenCreateModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-surface-border bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-content-secondary gap-2">
          <span>AI Task Processing Platform &bull; MERN + Python Async Engine</span>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Redis Streams Online</span>
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
