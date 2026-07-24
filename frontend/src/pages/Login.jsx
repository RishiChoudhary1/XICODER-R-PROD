import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { Eye, EyeOff } from 'lucide-react'; 

import bgImage from '../assets/xicoderbg19.jpeg'; 
import myLogo from '../assets/xicoderlogo.svg';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gray-900 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }} 
    >
      {/* Scaled Down Card identical to Signup page */}
      <div className="w-full max-w-xl bg-white border-[3px] border-black rounded-none p-6">
        
        {/* Scaled Down Logo */}
        <div className="flex justify-center mb-1">
          <img 
            src={myLogo} 
            alt="Logo" 
            className="h-20 w-auto" 
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4"> 
          
          {/* Email Field */}
          <div className="form-control">
            <label className="label p-0 mb-1">
              <span className="text-black font-bold uppercase text-[10px] tracking-wider">Email</span>
            </label>
            <input
              type="email"
              placeholder="JOHN@EXAMPLE.COM"
              className={`w-full p-2.5 text-xs bg-white text-black caret-black border-2 border-black rounded-none outline-none focus:bg-gray-100 placeholder-gray-400 transition-colors ${errors.emailId ? 'border-dashed border-gray-600' : ''}`}
              {...register('emailId')}
            />
            {errors.emailId && (
              <span className="text-gray-700 font-bold text-[9px] mt-1 uppercase tracking-wide flex items-center gap-1">
                <span className="text-black">!</span> {errors.emailId.message}
              </span>
            )}
          </div>

          {/* Password Field with Toggle */}
          <div className="form-control">
            <label className="label p-0 mb-1">
              <span className="text-black font-bold uppercase text-[10px] tracking-wider">Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full p-2.5 pr-10 text-xs bg-white text-black caret-black border-2 border-black rounded-none outline-none focus:bg-gray-100 placeholder-gray-400 transition-colors ${errors.password ? 'border-dashed border-gray-600' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute top-1/2 right-2.5 transform -translate-y-1/2 text-black hover:text-gray-600 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-gray-700 font-bold text-[9px] mt-1 uppercase tracking-wide flex items-center gap-1">
                <span className="text-black">!</span> {errors.password.message}
              </span>
            )}
          </div>

          {/* Global Authentication Error Display */}
          {error && (
            <div className="text-center mt-1">
              <span className="text-gray-700 font-bold text-[9px] uppercase tracking-wide flex items-center justify-center gap-1">
                <span className="text-black">!</span> {typeof error === 'string' ? error : 'Login failed'}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-control mt-2"> 
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-xs bg-black text-white font-bold uppercase tracking-widest border-2 border-black rounded-none transition-all 
                ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-gray-800 hover:border-gray-800 active:scale-[0.99]'}`}
            >
              {loading ? 'PROCESSING...' : 'LOG IN'}
            </button>
          </div>
        </form>

        {/* Signup Redirect */}
        <div className="text-center mt-6 border-t-2 border-black pt-4">
          <span className="text-[10px] font-bold text-black uppercase tracking-wider">
            Don't have an account?{' '}
            <NavLink to="/signup" className="text-gray-600 hover:text-black underline decoration-2 underline-offset-4 transition-colors">
              Sign Up
            </NavLink>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;