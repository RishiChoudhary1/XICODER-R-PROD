import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { Play, Send, TerminalSquare, Check } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let {problemId} = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  
  const TabButton = ({ active, onClick, children }) => (
    <button 
      className={`px-5 py-2.5 text-sm font-medium transition-colors border-r border-gray-300 relative ${
        active 
          ? 'bg-white text-black border-t-2 border-t-black' 
          : 'bg-[#f5f5f5] text-gray-600 hover:bg-[#e9ecef] border-t-2 border-t-transparent'
      }`}
      onClick={onClick}
    >
      {active && <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-white"></div>}
      {children}
    </button>
  );

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa] text-gray-600 text-sm font-medium">
        Loading problem data...
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
      
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-gray-300 bg-white">
        
        {/* Left Tabs */}
        <div className="flex border-b border-gray-300 bg-[#f5f5f5] overflow-x-auto">
          <TabButton active={activeLeftTab === 'description'} onClick={() => setActiveLeftTab('description')}>Description</TabButton>
          <TabButton active={activeLeftTab === 'editorial'} onClick={() => setActiveLeftTab('editorial')}>Editorial</TabButton>
          <TabButton active={activeLeftTab === 'solutions'} onClick={() => setActiveLeftTab('solutions')}>Solutions</TabButton>
          <TabButton active={activeLeftTab === 'submissions'} onClick={() => setActiveLeftTab('submissions')}>Submissions</TabButton>
          <TabButton active={activeLeftTab === 'chatAI'} onClick={() => setActiveLeftTab('chatAI')}>ChatAI</TabButton>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center flex-wrap gap-3 mb-6">
                    <h1 className="text-xl font-medium text-black">{problem.title}</h1>
                    <span className="uppercase inline-flex items-center justify-center leading-none text-[11px] px-1.5 py-1 border rounded-sm text-black border-gray-300 bg-white">
                      {problem.difficulty}
                    </span>
                    <span className="uppercase inline-flex items-center justify-center leading-none text-[11px] px-1.5 py-1 border rounded-sm text-black border-gray-300 bg-white">
                      {problem.tags}
                    </span>
                  </div>

                  {/* <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap mb-8">
                    {problem.description}
                  </div> */}

                  <div className="text-sm leading-relaxed text-gray-800 mb-8 prose max-w-none prose-p:my-4 prose-headings:my-4 prose-ul:list-disc prose-ul:ml-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {problem.description}
                    </ReactMarkdown>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-4 text-black border-b border-gray-200 pb-2">Examples</h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-[#f5f5f5] border border-gray-300 p-4 rounded-none">
                          <h4 className="font-medium text-sm mb-2 text-black">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm font-mono text-gray-700">
                            <div><strong className="text-black">Input:</strong> {example.input}</div>
                            <div><strong className="text-black">Output:</strong> {example.output}</div>
                            {example.explanation && (
                              <div className="mt-2 text-gray-600 font-sans"><strong className="text-black">Explanation:</strong> {example.explanation}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div>
                  <h2 className="text-lg font-medium mb-4 border-b border-gray-200 pb-2">Video Editorial</h2>
                  <div className="text-sm leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-lg font-medium mb-4 border-b border-gray-200 pb-2">Reference Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-gray-300">
                        <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2 flex justify-between items-center">
                          <span className="font-medium text-sm text-black">{problem?.title}</span>
                          <span className="text-xs uppercase text-gray-500 border border-gray-300 px-2 py-0.5 bg-white">{solution?.language}</span>
                        </div>
                        <div className="p-0">
                          <pre className="bg-[#1e1e1e] text-gray-300 p-4 text-sm overflow-x-auto m-0 font-mono">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-sm text-gray-500">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-lg font-medium mb-4 border-b border-gray-200 pb-2">My Submissions</h2>
                  <div className="text-sm">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div>
                  <h2 className="text-lg font-medium mb-4 border-b border-gray-200 pb-2">Ask Away!</h2>
                  <div className="text-sm">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col bg-white">
        
        {/* Right Tabs */}
        <div className="flex border-b border-gray-300 bg-[#f5f5f5]">
          <TabButton active={activeRightTab === 'code'} onClick={() => setActiveRightTab('code')}>Source Code</TabButton>
          <TabButton active={activeRightTab === 'testcase'} onClick={() => setActiveRightTab('testcase')}>Test Output</TabButton>
          <TabButton active={activeRightTab === 'result'} onClick={() => setActiveRightTab('result')}>Submission</TabButton>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col h-full">
              {/* Language Selector */}
              <div className="flex items-center px-4 py-2 border-b border-gray-300 bg-[#fafafa]">
                <span className="text-xs text-gray-500 mr-3 uppercase font-medium">Language:</span>
                <div className="flex gap-1">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-3 py-1 text-xs border rounded-none transition-colors ${
                        selectedLanguage === lang 
                          ? 'border-black bg-white text-black font-medium z-10' 
                          : 'border-gray-300 bg-[#f5f5f5] text-gray-600 hover:bg-white hover:border-gray-400'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-gray-300 bg-[#f5f5f5] flex justify-between items-center">
                <button 
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  <TerminalSquare size={16} /> Console
                </button>
                
                <div className="flex gap-2">
                  <button
                    className={`flex items-center gap-1.5 px-6 py-1.5 text-sm font-medium border border-gray-400 bg-white text-black hover:bg-gray-100 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    <Play size={14} /> {loading ? 'Running...' : 'Run Code'}
                  </button>
                  <button
                    className={`flex items-center gap-1.5 px-6 py-1.5 text-sm font-medium border border-black bg-black text-white hover:bg-gray-800 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    <Send size={14} /> {loading ? 'Evaluating...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              <h3 className="text-lg font-medium border-b border-gray-200 pb-2 mb-4">Compilation & Test Output</h3>
              {runResult ? (
                <div className={`border p-5 ${runResult.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  {runResult.success ? (
                    <div>
                      <h4 className="font-bold text-green-700 flex items-center gap-2">
                        <Check size={18} /> All example test cases passed!
                      </h4>
                      <div className="mt-3 flex gap-4 text-sm text-green-800">
                        <span><strong className="font-medium">Runtime:</strong> {runResult.runtime} sec</span>
                        <span><strong className="font-medium">Memory:</strong> {runResult.memory} KB</span>
                      </div>
                      
                      
                      <div className="mt-6 space-y-4">
                        {runResult.testCases?.map((tc, i) => (
                          <div key={i} className="bg-white border border-green-200 p-4 text-sm">
                            <div className="font-mono text-gray-800 space-y-2 break-words">
                              <div><strong className="text-gray-500">Input:</strong> <br/>{tc.stdin}</div>
                              <div><strong className="text-gray-500">Expected:</strong> <br/>{tc.expected_output}</div>
                              <div><strong className="text-gray-500">Output:</strong> <br/>{tc.stdout}</div>
                              <div className="text-green-600 font-medium pt-2 mt-2 border-t border-green-100">
                                ✓ Passed
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-red-700">Error / Failed</h4>
                      
                      
                      {runResult.error && (
                        <div className="mt-4 p-3 bg-white border border-red-200 text-sm font-mono text-red-800 whitespace-pre-wrap break-words">
                          {runResult.error}
                        </div>
                      )}

                     
                      {runResult.testCases && runResult.testCases.length > 0 && (
                        <div className="mt-6 space-y-4">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className={`bg-white border p-4 text-sm ${tc.status_id == 3 ? 'border-green-200' : 'border-red-200'}`}>
                              <div className="font-mono text-gray-800 space-y-2 break-words">
                                <div><strong className="text-gray-500">Input:</strong> <br/>{tc.stdin}</div>
                                <div><strong className="text-gray-500">Expected:</strong> <br/>{tc.expected_output}</div>
                                <div><strong className="text-gray-500">Output:</strong> <br/>{tc.stdout}</div>
                                
                                
                                <div className={`font-medium pt-2 mt-2 border-t ${tc.status_id == 3 ? 'text-green-600 border-green-100' : 'text-red-600 border-red-100'}`}>
                                  {tc.status_id == 3 ? 'Passed' : 'Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm p-4 border border-gray-200 bg-[#f5f5f5] text-center">
                  Click "Run Code" to test your solution against the example inputs.
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              <h3 className="text-lg font-medium border-b border-gray-200 pb-2 mb-4">Final Evaluation</h3>
              {submitResult ? (
                <div className={`border p-5 ${submitResult.accepted ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  {submitResult.accepted ? (
                    <div>
                      <h4 className="font-bold text-xl text-green-700 mb-4">Accepted</h4>
                      <div className="space-y-2 text-sm text-green-800 border-t border-green-200 pt-4">
                        <div className="flex justify-between max-w-xs">
                          <span className="text-gray-600">Test Cases Passed:</span>
                          <span className="font-medium">{submitResult.passedTestCases} / {submitResult.totalTestCases}</span>
                        </div>
                        <div className="flex justify-between max-w-xs">
                          <span className="text-gray-600">Runtime:</span>
                          <span className="font-medium">{submitResult.runtime} sec</span>
                        </div>
                        <div className="flex justify-between max-w-xs">
                          <span className="text-gray-600">Memory:</span>
                          <span className="font-medium">{submitResult.memory} KB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-xl text-red-700 mb-4">{submitResult.error || 'Wrong Answer'}</h4>
                      <div className="space-y-2 text-sm text-red-800 border-t border-red-200 pt-4">
                        <div className="flex justify-between max-w-xs">
                          <span className="text-gray-600">Test Cases Passed:</span>
                          <span className="font-medium">{submitResult.passedTestCases} / {submitResult.totalTestCases}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm p-4 border border-gray-200 bg-[#f5f5f5] text-center">
                  Submit your code to see the final evaluation results.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;