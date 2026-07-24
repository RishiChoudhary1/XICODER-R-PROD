import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { X, Code2 } from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        
        // BUG FIX: Ensure data is strictly an array to prevent .map() and .length crashes
        const data = response.data;
        setSubmissions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        // If the API returns a 404 (Not Found) for empty submissions, treat it as an empty list instead of an error
        if (err.response && err.response.status === 404) {
          setSubmissions([]);
          setError(null);
        } else {
          setError('Failed to fetch submission history');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId]);

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': 
        return 'text-green-700 border-green-200 bg-green-50';
      case 'wrong':
      case 'wrong answer':
      case 'error': 
        return 'text-red-700 border-red-200 bg-red-50';
      case 'pending': 
        return 'text-blue-700 border-blue-200 bg-blue-50';
      default: 
        return 'text-gray-700 border-gray-200 bg-gray-50';
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Loading submission history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 text-sm font-mono whitespace-pre-wrap">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      
      {(!submissions || submissions.length === 0) ? (
        <div className="p-6 text-center border border-gray-300 bg-[#fafafa] text-sm text-gray-500">
          No submissions found for this problem.
        </div>
      ) : (
        <div className="border border-gray-300 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f5f5f5] border-b border-gray-300 text-gray-700">
                <tr>
                  <th className="px-4 py-2.5 font-medium">#</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Language</th>
                  <th className="px-4 py-2.5 font-medium">Runtime</th>
                  <th className="px-4 py-2.5 font-medium">Memory</th>
                  <th className="px-4 py-2.5 font-medium">Passed</th>
                  <th className="px-4 py-2.5 font-medium">Time</th>
                  <th className="px-4 py-2.5 font-medium text-right">Code</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, index) => (
                  <tr key={sub._id || index} className="border-b border-gray-100 hover:bg-[#fcfcfc] transition-colors last:border-b-0">
                    <td className="px-4 py-3 text-gray-500">{submissions.length - index}</td>
                    
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center leading-none text-[11px] px-2 py-1 border rounded-sm font-medium uppercase tracking-wider ${getStatusStyles(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{sub.language}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{sub.runtime ? `${sub.runtime}s` : 'N/A'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{formatMemory(sub.memory)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{sub.testCasesPassed}/{sub.testCasesTotal}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(sub.createdAt)}</td>
                    
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedSubmission(sub)}
                        className="inline-flex items-center gap-1 text-[#0056b3] hover:underline text-xs font-medium"
                      >
                        <Code2 size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code View Modal Overlay */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          
          <div className="bg-white border border-gray-300 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-6 py-4 flex justify-between items-center shrink-0">
              <h3 className="font-medium text-black">
                Submission Source Code
              </h3>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Details Bar */}
            <div className="bg-[#fafafa] border-b border-gray-200 px-6 py-3 flex flex-wrap gap-4 text-xs shrink-0">
              <span className={`inline-flex items-center justify-center leading-none text-[10px] px-2 py-1 border rounded-sm font-medium uppercase tracking-wider ${getStatusStyles(selectedSubmission.status)}`}>
                {selectedSubmission.status}
              </span>
              <span className="flex items-center text-gray-600 border border-gray-300 px-2 py-1 bg-white">
                <strong className="font-medium mr-1 text-black">Language:</strong> {selectedSubmission.language}
              </span>
              <span className="flex items-center text-gray-600 border border-gray-300 px-2 py-1 bg-white">
                <strong className="font-medium mr-1 text-black">Runtime:</strong> {selectedSubmission.runtime}s
              </span>
              <span className="flex items-center text-gray-600 border border-gray-300 px-2 py-1 bg-white">
                <strong className="font-medium mr-1 text-black">Memory:</strong> {formatMemory(selectedSubmission.memory)}
              </span>
            </div>
            
            {/* Error Message if compilation failed */}
            {selectedSubmission.errorMessage && (
              <div className="mx-6 mt-4 p-4 border border-red-300 bg-red-50 text-red-800 text-sm font-mono whitespace-pre-wrap shrink-0">
                {selectedSubmission.errorMessage}
              </div>
            )}
            
            {/* Code Block */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#1e1e1e]">
              <pre className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;