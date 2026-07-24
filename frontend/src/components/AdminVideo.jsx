import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router'; 
import { useSelector } from 'react-redux';
import { Trash2, Upload } from 'lucide-react';
import myLogo from '../assets/xicoderlogo.svg';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError(err);
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex justify-center items-center text-sm text-gray-600">
        Loading problem archive...
      </div>
    );
  }

  
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    return error?.response?.data?.error || error?.message || 'An unknown error occurred';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans pb-12">
      
      {/* heaeader */}
      <nav className="bg-[#000000] text-gray-300 px-6 py-2.5 flex justify-between items-center text-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="hover:opacity-80 transition-opacity">
            <img src={myLogo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
          </NavLink>
          <span className="text-gray-600">|</span>
          <span className="text-white">Manage Videos</span>
        </div>
        
        <div className="flex items-center gap-4">
          <NavLink to="/admin" className="hover:text-white transition-colors">Back to Admin</NavLink>
          <span className="text-gray-600">|</span>
          <span>{user?.firstName || 'Admin'}</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-2xl text-gray-900 font-normal">Video Upload and Delete</h1>
          <span className="text-sm text-gray-500">Total: {problems.length}</span>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-800 text-sm font-mono whitespace-pre-wrap">
            {getErrorMessage()}
          </div>
        )}

        <div className="border border-gray-300 bg-white overflow-hidden">
          <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700 font-medium">
            Problem Editorial Directory
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fafafa] border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium w-16">#</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium w-32">Difficulty</th>
                  <th className="px-4 py-3 font-medium w-32">Tags</th>
                  
                  <th className="px-4 py-3 font-medium w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => (
                  <tr 
                    key={problem._id} 
                    className="border-b border-gray-100 hover:bg-[#fcfcfc] transition-colors last:border-b-0"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    
                    <td className="px-4 py-3 font-medium text-black">
                      {problem.title}
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="uppercase inline-flex items-center justify-center leading-none text-[10px] px-1.5 py-1 border rounded-sm text-black border-gray-300 bg-white">
                        {problem.difficulty}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="uppercase inline-flex items-center justify-center leading-none text-[10px] px-1.5 py-1 border rounded-sm text-black border-gray-300 bg-white">
                        {problem.tags}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <NavLink 
                          to={`/admin/upload/${problem._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#0056b3] bg-white text-[#0056b3] hover:bg-blue-50 text-xs transition-colors"
                          title="Upload Video"
                        >
                          <Upload size={14} /> Upload
                        </NavLink>
                        
                        <button 
                          onClick={() => handleDelete(problem._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 bg-white text-red-600 hover:bg-red-50 text-xs transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {problems.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No problems found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideo;