import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CreateTaskModal from '../components/CreateTaskModal';

export const DashboardLayout = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onOpenCreateModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>AI Task Processing Platform &bull; Distributed Background Queue</span>
          <div className="flex items-center space-x-3 text-slate-400">
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
