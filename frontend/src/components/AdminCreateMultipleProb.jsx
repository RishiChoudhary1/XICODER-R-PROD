import React, { useState } from 'react';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router'; 
import myLogo from '../assets/xicoderlogo.svg';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminCreateMultipleProb() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // 1. Parse the string into a JSON object
      const parsedData = JSON.parse(jsonInput);

      // 2. Validate the JSON object against the Zod schema
      const validatedData = problemSchema.parse(parsedData);

      // 3. Send to backend
      await axiosClient.post('/problem/create', validatedData);
      
      alert('Problem created successfully!');
      navigate('/');
    } catch (err) {
      // Handle JSON parsing errors
      if (err instanceof SyntaxError) {
        setError('Invalid JSON syntax. Please check for missing quotes, commas, or brackets.');
      } 
      // Handle Zod schema validation errors
      else if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map(
          e => `- ${e.path.join('.')}: ${e.message}`
        ).join('\n');
        setError(`JSON Structure Error:\n${errorMessages}`);
      } 
      // Handle Backend API errors
      else {
        setError(`Server Error: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans pb-12">
      
      {/* Top Header */}
      <nav className="bg-[#000000] text-gray-300 px-6 py-2.5 flex justify-between items-center text-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="hover:opacity-80 transition-opacity">
            <img src={myLogo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
          </NavLink>
          <span className="text-gray-600">|</span>
          <span className="text-white">JSON Upload</span>
        </div>
        
        <div className="flex items-center gap-4">
          <NavLink to="/admin" className="hover:text-white transition-colors">Back to Admin</NavLink>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8 max-w-4xl">
        <h1 className="text-2xl text-gray-900 mb-6 font-normal">Upload Problem via JSON</h1>
        
        <div className="border border-gray-300 bg-white">
          <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700">
            JSON Data
          </div>
          
          <div className="p-5 space-y-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 uppercase">Paste Problem JSON Here</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{
  "title": "Example Problem Title",
  "description": "Detailed description of the problem...",
  "difficulty": "easy", // Can be: "easy", "medium", or "hard"
  "tags": "array",      // Can be: "array", "linkedList", "graph", or "dp"......'
                className="w-full border border-gray-300 p-4 text-sm bg-[#fafafa] text-black caret-black outline-none focus:border-black rounded-none h-[300px] font-mono whitespace-pre"
              />
            </div>

            {error && (
              <div className="p-4 border border-red-300 bg-red-50 text-red-800 text-sm font-mono whitespace-pre-wrap">
                {error}
              </div>
            )}

            <button 
              onClick={handleSubmit} 
              disabled={!jsonInput.trim() || isLoading}
              className="w-full py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Upload Problem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateMultipleProb;