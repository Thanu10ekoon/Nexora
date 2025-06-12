import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const regNo = watch('regNo');
  const isStudent = regNo?.startsWith('SE/');
  const isAdmin = regNo?.startsWith('AD/');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const userData = {
        regNo: data.regNo,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        department: data.department,
        yearOfStudy: isStudent ? parseInt(data.yearOfStudy) : undefined
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        toast.success(`Welcome to Campus Copilot, ${result.user.fullName}!`);
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center">
            <img 
              src="/NexoraLogo.png" 
              alt="Nexora Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Campus Copilot
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your Novacore University account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="regNo" className="form-label">
                Registration Number
              </label>
              <input
                {...register('regNo', {
                  required: 'Registration number is required',
                  pattern: {
                    value: /^(SE|AD)\/20\d{2}\/\d{4}$/,
                    message: 'Format: SE/20XX/XXXX (Student) or AD/20XX/XXXX (Admin)'
                  }
                })}
                type="text"
                className="form-input"
                placeholder="SE/2024/0001 or AD/2024/0001"
              />
              {errors.regNo && (
                <p className="mt-1 text-sm text-red-600">{errors.regNo.message}</p>
              )}
              {regNo && (
                <p className="mt-1 text-sm text-green-600">
                  {isStudent && '✓ Student account'}
                  {isAdmin && '✓ Admin account'}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                type="text"
                className="form-input"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="form-input"
                placeholder="your.email@novacore.edu"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number (Optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="form-input"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <select
                {...register('department', {
                  required: 'Department is required'
                })}
                className="form-input"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Administration">Administration</option>
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            {isStudent && (
              <div>
                <label htmlFor="yearOfStudy" className="form-label">
                  Year of Study
                </label>
                <select
                  {...register('yearOfStudy', {
                    required: isStudent ? 'Year of study is required' : false
                  })}
                  className="form-input"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                {errors.yearOfStudy && (
                  <p className="mt-1 text-sm text-red-600">{errors.yearOfStudy.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
