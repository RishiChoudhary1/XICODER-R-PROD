import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import { Plus, Trash2 } from 'lucide-react';
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

function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/admin');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans pb-12">
      
      {/* Top Header - Kept simple with Logo and Username */}
      <nav className="bg-[#000000] text-gray-300 px-6 py-2.5 flex justify-between items-center text-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="hover:opacity-80 transition-opacity">
            <img src={myLogo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
          </NavLink>
          <span className="text-gray-600">|</span>
          <span className="text-white">Create Problem</span>
        </div>
        
        <div className="flex items-center gap-4">
          <NavLink to="/admin" className="hover:text-white transition-colors">Back to Admin</NavLink>
          <span className="text-gray-600">|</span>
          <span>{user?.firstName || 'Admin'}</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8 max-w-4xl">
        <h1 className="text-2xl text-gray-900 mb-6 font-normal">Add New Problem</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <div className="border border-gray-300 bg-white">
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700">
              Basic Information
            </div>
            <div className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 uppercase">Title</label>
                <input
                  {...register('title')}
                  className={`w-full border p-2 text-sm bg-white text-black caret-black outline-none focus:border-black rounded-none ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.title && <span className="text-red-600 text-xs mt-1 block">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5 uppercase">Description</label>
                <textarea
                  {...register('description')}
                  className={`w-full border p-2 text-sm bg-white text-black caret-black outline-none focus:border-black rounded-none min-h-[120px] ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.description && <span className="text-red-600 text-xs mt-1 block">{errors.description.message}</span>}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1.5 uppercase">Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className={`w-full border p-2 text-sm bg-white text-black outline-none focus:border-black rounded-none ${errors.difficulty ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1.5 uppercase">Tag</label>
                  <select
                    {...register('tags')}
                    className={`w-full border p-2 text-sm bg-white text-black outline-none focus:border-black rounded-none ${errors.tags ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">DP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases Area */}
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Visible Test Cases */}
            <div className="flex-1 border border-gray-300 bg-white">
              <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700 flex justify-between items-center">
                <span>Visible Test Cases</span>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="flex items-center gap-1 text-[#0056b3] hover:underline text-xs"
                >
                  <Plus size={14} /> Add Case
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 bg-[#fafafa] p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase text-gray-500">Case #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <input
                      {...register(`visibleTestCases.${index}.input`)}
                      placeholder="Input"
                      className="w-full border border-gray-300 p-1.5 text-sm bg-white text-black caret-black outline-none focus:border-black rounded-none font-mono"
                    />
                    <input
                      {...register(`visibleTestCases.${index}.output`)}
                      placeholder="Output"
                      className="w-full border border-gray-300 p-1.5 text-sm bg-white text-black caret-black outline-none focus:border-black rounded-none font-mono"
                    />
                    <textarea
                      {...register(`visibleTestCases.${index}.explanation`)}
                      placeholder="Explanation (Optional)"
                      className="w-full border border-gray-300 p-1.5 text-sm bg-white text-black caret-black outline-none focus:border-black rounded-none min-h-[60px]"
                    />
                  </div>
                ))}
                {errors.visibleTestCases && <span className="text-red-600 text-xs block">{errors.visibleTestCases.message}</span>}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div className="flex-1 border border-gray-300 bg-white self-start">
              <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700 flex justify-between items-center">
                <span>Hidden Test Cases</span>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="flex items-center gap-1 text-[#0056b3] hover:underline text-xs"
                >
                  <Plus size={14} /> Add Case
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 bg-[#fafafa] p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase text-gray-500">Case #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <input
                      {...register(`hiddenTestCases.${index}.input`)}
                      placeholder="Input"
                      className="w-full border border-gray-300 p-1.5 text-sm bg-white text-black caret-black outline-none focus:border-black rounded-none font-mono"
                    />
                    <input
                      {...register(`hiddenTestCases.${index}.output`)}
                      placeholder="Output"
                      className="w-full border border-gray-300 p-1.5 text-sm bg-white text-black caret-black outline-none focus:border-black rounded-none font-mono"
                    />
                  </div>
                ))}
                {errors.hiddenTestCases && <span className="text-red-600 text-xs block">{errors.hiddenTestCases.message}</span>}
              </div>
            </div>
            
          </div>

          {/* Code Templates */}
          <div className="border border-gray-300 bg-white">
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700">
              Language Templates & Solutions
            </div>
            
            <div className="p-5 space-y-8">
              {[0, 1, 2].map((index) => {
                const langName = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                return (
                  <div key={index} className="space-y-3 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <h3 className="font-medium text-[#0056b3] text-sm">{langName}</h3>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1.5">Initial Boilerplate Code</label>
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          className="w-full border border-gray-300 bg-[#fdfdfd] p-3 text-xs font-mono text-black caret-black outline-none focus:border-black rounded-none min-h-[150px] whitespace-pre"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1.5">Complete Reference Solution</label>
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          className="w-full border border-gray-300 bg-[#fdfdfd] p-3 text-xs font-mono text-black caret-black outline-none focus:border-black rounded-none min-h-[150px] whitespace-pre"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors border border-black"
            >
              Create Problem
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AdminPanel;