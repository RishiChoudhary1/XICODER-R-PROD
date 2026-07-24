import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { Check, LogOut, ShieldAlert, Github, Twitter, Mail, ChevronRight } from 'lucide-react';

import myLogo from '../assets/xicoderlogo.svg';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); 
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      solvedProblems.some(sp => sp._id === problem._id);
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-gray-800 font-sans">
      
     
      <nav className="bg-[#000000] text-gray-300 px-6 py-2.5 flex justify-between items-center text-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center hover:opacity-80 transition-opacity">
            
            <img src={myLogo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
          </NavLink>
          <div className="hidden sm:flex gap-4">
            
            <NavLink to="#" className="hover:text-white transition-colors">Contests (Coming Soon)</NavLink>
            
          </div>
        </div>
        
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
            >
              {user?.firstName || 'Guest'} <span className="text-xs">▼</span>
            </div>
            <ul 
              tabIndex={0} 
              className="mt-3 p-1 shadow-md border border-gray-300 menu dropdown-content bg-white text-gray-800 rounded-none w-48 text-sm"
            >
              {user?.role === 'admin' && (
                <li className="border-b border-gray-200">
                  <NavLink to="/admin" className="rounded-none hover:bg-[#f5f5f5] py-2 flex items-center gap-2 text-[#0056b3]">
                    <ShieldAlert size={14} /> System Admin
                  </NavLink>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="rounded-none hover:bg-[#f5f5f5] py-2 flex items-center gap-2">
                  <LogOut size={14} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-6 max-w-6xl">
        
        
        <div className="w-full md:w-64 shrink-0">
          <div className="border border-gray-300 bg-white">
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700">
              Search Filters
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs text-gray-800 mb-1.5">Status</label>
                <select 
                  className="w-full border border-gray-300 p-1.5 text-sm bg-white text-gray-800 outline-none focus:border-[#0056b3] rounded-none"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Problems</option>
                  <option value="solved">Solved Problems</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Rated Range (Difficulty)</label>
                <select 
                  className="w-full border border-gray-300 p-1.5 text-sm bg-white text-gray-800 outline-none focus:border-[#0056b3] rounded-none"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Category (Tag)</label>
                <select 
                  className="w-full border border-gray-300 p-1.5 text-sm bg-white text-gray-800 outline-none focus:border-[#0056b3] rounded-none"
                  value={filters.tag}
                  onChange={(e) => setFilters({...filters, tag: e.target.value})}
                >
                  <option value="all">All Tags</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Area - Problem List */}
        <div className="flex-1">
          <div className="border border-gray-300 bg-white">
            
            {/* Header */}
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700 flex justify-between items-center">
              <span>Problem Archive</span>
              <span className="text-xs text-gray-500">Showing {filteredProblems.length} results</span>
            </div>

            {/* List */}
            <div className="flex flex-col">
              {filteredProblems.map(problem => (
                <div 
                  key={problem._id} 
                  className="border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#fcfcfc] transition-colors last:border-b-0"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    
                    {/* Status Icon */}
                    <div className="mt-0.5 sm:mt-0 w-5 flex justify-center">
                      {solvedProblems.some(sp => sp._id === problem._id) ? (
                        <Check size={16} className="text-gray-800" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                      )}
                    </div>

                    {/* Title & Tags */}
                    <div>
                      <NavLink 
                        to={`/problem/${problem._id}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:underline text-sm font-medium"
                      >
                        {problem.title}
                      </NavLink>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] px-1.5 py-0.5 border border-gray-200 rounded-sm bg-gray-50 ${getDifficultyStyles(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-[11px] text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded-sm bg-gray-50">
                          {problem.tags}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Solve Link - Flat simple style */}
                  <div className="mt-3 sm:mt-0 ml-8 sm:ml-0">
                    <NavLink 
                      to={`/problem/${problem._id}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#000000] hover:underline text-sm flex items-center gap-1"
                    >
                      Solve <ChevronRight size={14} />
                    </NavLink>
                  </div>
                </div>
              ))}
              
              {filteredProblems.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No problems match your current search filters.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Section */}
      <footer className="border-t border-gray-300 bg-white mt-auto">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          
          {/* Footer Logo & Copyright */}
          <div className="flex items-center gap-3">
            <img src={myLogo} alt="Logo" className="h-6 w-auto grayscale opacity-70" />
            <span>XiCoder © {new Date().getFullYear()} Rishi Choudhary</span>
          </div>

          {/* Footer Links */}
          <div className="flex gap-4 mr-20">
            <NavLink to="#" className="hover:text-[#0056b3] hover:underline">Terms of Service</NavLink>
            <NavLink to="#" className="hover:text-[#0056b3] hover:underline">Privacy Policy</NavLink>
            <NavLink to="#" className="hover:text-[#0056b3] hover:underline">About</NavLink>
          </div>

          {/* Social Icons */}
          <div className="flex gap-3">
            <a href="#" className="hover:text-[#0056b3]" aria-label="GitHub"><Github size={18} /></a>
            <a href="#" className="hover:text-[#0056b3]" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" className="hover:text-[#0056b3]" aria-label="Email"><Mail size={18} /></a>
          </div>

        </div>
      </footer>
    </div>
  );
}

const getDifficultyStyles = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'text-green-700';
    case 'medium': return 'text-orange-700';
    case 'hard': return 'text-red-700';
    default: return 'text-gray-700 border-gray-200 bg-gray-50';
  }
};

export default Homepage;