import { useParams, NavLink } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import myLogo from '../assets/xicoderlogo.svg';

function AdminUpload(){
    const { problemId }  = useParams();
    const { user } = useSelector((state) => state.auth);
    
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
      reset,
      setError,
      clearErrors
    } = useForm();
    
    const selectedFile = watch('videoFile')?.[0];
    
    
    const onSubmit = async (data) => {
      const file = data.videoFile[0];
      
      setUploading(true);
      setUploadProgress(0);
      clearErrors();
  
      try {
        //  1  Get upload signature from backend
        const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
        const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;
  
        // 2 Create FormData for Cloudinary upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('public_id', public_id);
        formData.append('api_key', api_key);
  
        // 3 Upload directly to Cloudinary
        const uploadResponse = await axios.post(upload_url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });
  
        const cloudinaryResult = uploadResponse.data;
  
        // 4 Save video metadata to backend
        const metadataResponse = await axiosClient.post('/video/save', {
          problemId: problemId,
          cloudinaryPublicId: cloudinaryResult.public_id,
          secureUrl: cloudinaryResult.secure_url,
          duration: cloudinaryResult.duration,
        });
  
        setUploadedVideo(metadataResponse.data.videoSolution);
        reset(); 
        
      } catch (err) {
        console.error('Upload error:', err);
        setError('root', {
          type: 'manual',
          message: err.response?.data?.message || 'Upload failed. Please try again.'
        });
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    };
    
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    
    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans pb-12">
        
        {/* header */}
        <nav className="bg-[#000000] text-gray-300 px-6 py-2.5 flex justify-between items-center text-sm sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <NavLink to="/" className="hover:opacity-80 transition-opacity">
              <img src={myLogo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
            </NavLink>
            <span className="text-gray-600">|</span>
            <span className="text-white">Upload Editorial</span>
          </div>
          
          <div className="flex items-center gap-4">
            <NavLink to="/admin/video" className="hover:text-white transition-colors">Back to Videos</NavLink>
            <span className="text-gray-600">|</span>
            <span>{user?.firstName || 'Admin'}</span>
          </div>
        </nav>

        <div className="container mx-auto px-4 mt-12 max-w-xl">
          <h1 className="text-2xl text-gray-900 mb-6 font-normal">Upload Video Solution</h1>
          
          <div className="border border-gray-300 bg-white">
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700 font-medium">
              Target Problem ID: <span className="font-mono text-gray-500 font-normal ml-1">{problemId}</span>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* File input */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2 uppercase">Select Video File</label>
                  <input
                    type="file"
                    accept="video/*"
                    {...register('videoFile', {
                      required: 'Please select a video file',
                      validate: {
                        isVideo: (files) => {
                          if (!files || !files[0]) return 'Please select a video file';
                          const file = files[0];
                          return file.type.startsWith('video/') || 'Please select a valid video file';
                        },
                        fileSize: (files) => {
                          if (!files || !files[0]) return true;
                          const file = files[0];
                          const maxSize = 100 * 1024 * 1024; 
                          return file.size <= maxSize || 'File size must be less than 100MB';
                        }
                      }
                    })}
                    className={`block w-full text-sm text-gray-600 
                      file:mr-4 file:py-2 file:px-4 file:border-r file:border-0 file:border-gray-300
                      file:text-xs file:font-medium file:uppercase file:bg-[#f5f5f5] file:text-black
                      hover:file:bg-[#e9ecef] transition-colors border rounded-none cursor-pointer
                      ${errors.videoFile ? 'border-red-400' : 'border-gray-300'}`}
                    disabled={uploading}
                  />
                  {errors.videoFile && (
                    <span className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.videoFile.message}
                    </span>
                  )}
                </div>
    
                {/* Selected file */}
                {selectedFile && !uploading && !uploadedVideo && (
                  <div className="border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    <h3 className="font-medium mb-1">Staged for Upload:</h3>
                    <p className="font-mono text-xs">{selectedFile.name}</p>
                    <p className="font-mono text-xs mt-0.5">Size: {formatFileSize(selectedFile.size)}</p>
                  </div>
                )}
    
                {/* Upload indicator */}
                {uploading && (
                  <div className="space-y-2 border border-gray-200 p-4 bg-[#fafafa]">
                    <div className="flex justify-between text-xs font-medium uppercase text-gray-600">
                      <span>Uploading to Cloudinary...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5">
                      <div 
                        className="bg-[#0056b3] h-1.5 transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
    
                {/* error   message */}
                {errors.root && (
                  <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{errors.root.message}</span>
                  </div>
                )}
    
                {/* success  message */}
                {uploadedVideo && (
                  <div className="border border-green-300 bg-green-50 p-4 text-sm text-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <h3 className="font-medium">Upload Successful!</h3>
                    </div>
                    <div className="pl-6 space-y-1 font-mono text-xs text-green-700">
                      <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
                      <p>Timestamp: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
    
                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`w-full py-2.5 flex justify-center items-center gap-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <UploadCloud size={16} />
                    {uploading ? 'Processing Upload...' : 'Upload Video'}
                  </button>
                </div>
              </form>
            
            </div>
          </div>
        </div>
      </div>
    );
}

export default AdminUpload;