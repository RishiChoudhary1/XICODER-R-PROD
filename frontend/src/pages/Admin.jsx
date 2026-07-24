import React from 'react';
import { Plus, Edit, Trash2, Home, Video, FileJson, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      route: '/admin/create'
    },
    {
      id: 'createmultipleprob',
      title: 'Upload JSON',
      description: 'Add coding problems via bulk upload',
      icon: FileJson,
      route: '/admin/createMultipleProb'
    },
    // {
    //   id: 'update',
    //   title: 'Update Problem',
    //   description: 'Edit existing problems and their details',
    //   icon: Edit,
    //   route: '/admin/update'
    // },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload and delete video Solutions',
      icon: Video,
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      
      
      <nav className="bg-[#000000] text-gray-300 px-6 py-2.5 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span>System Admin</span>
        </div>
        <NavLink to="/" className="flex items-center gap-1 hover:text-white transition-colors">
          Home
        </NavLink>
      </nav>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
        
        {/* Page Title */}
        {/* <h1 className="text-2xl text-gray-900 mb-6 font-normal">Admin Panel</h1> */}

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Main Options Menu - Styled like AtCoder's data tables/sidebars */}
          <div className="flex-1 border border-gray-300 bg-white">
            
            {/* Table Header */}
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700">
              Manage Problem Sets
            </div>
            
            {/* Options List */}
            <div className="flex flex-col">
              {adminOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <NavLink
                    key={option.id}
                    to={option.route}
                    className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 hover:bg-[#fcfcfc] last:border-b-0 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Subdued Icon */}
                      <div className="text-gray-500 group-hover:text-gray-800">
                        <IconComponent size={18} strokeWidth={1.5} />
                      </div>
                      
                      {/* Text Content */}
                      <div>
                        <div className="text-sm text-[#0056b3] group-hover:underline">
                          {option.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow Indicator */}
                    <ChevronRight size={16} className="text-gray-400" />
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Quick Stats / Info Sidebar (Optional, fits the layout style) */}
          {/* <div className="w-full md:w-64 border border-gray-300 bg-white self-start">
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700">
              System Info
            </div>
            <div className="p-4 text-xs text-gray-600 flex flex-col gap-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Status</span>
                <span className="text-green-600">Online</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Judge Engine</span>
                <span>Active</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Access Level</span>
                <span>Administrator</span>
              </div>
            </div>
          </div> */}

        </div>
      </div>
    </div>
  );
}

export default Admin;