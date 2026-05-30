import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../../api/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '../../store/authSlice';

interface SignUpFormProps {
  onSuccess?: () => void;
}

interface SignUpFormValues {
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>();

  const [signup, { isLoading, error }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data: SignUpFormValues) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    try {
      const result = await signup({
        username: data.username,
        email: data.email,
        password: data.password,
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
        })
      );

      if (onSuccess) {
        onSuccess();
      }

      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to sign up', err);
    }
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor='username'
          className='block text-sm font-medium text-gray-700'
        >
          Username
        </label>
        <div className='mt-1'>
          <input
            id='username'
            type='text'
            autoComplete='username'
            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            {...register('username', {
              required: 'Username is required',
            })}
          />
          {errors.username && (
            <p className='mt-2 text-sm text-red-600'>
              {errors.username.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-700'
        >
          Email address
        </label>
        <div className='mt-1'>
          <input
            id='email'
            type='email'
            autoComplete='email'
            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            {...register('email', {
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <p className='mt-2 text-sm text-red-600'>{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor='password'
          className='block text-sm font-medium text-gray-700'
        >
          Password
        </label>
        <div className='mt-1'>
          <input
            id='password'
            type='password'
            autoComplete='new-password'
            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />
          {errors.password && (
            <p className='mt-2 text-sm text-red-600'>
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor='confirmPassword'
          className='block text-sm font-medium text-gray-700'
        >
          Confirm Password
        </label>
        <div className='mt-1'>
          <input
            id='confirmPassword'
            type='password'
            autoComplete='new-password'
            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className='mt-2 text-sm text-red-600'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className='rounded-md bg-red-50 p-4'>
          <p className='text-sm font-medium text-red-800'>
            {(error as any)?.data?.message ||
              'Sign up failed. Please try again.'}
          </p>
        </div>
      )}

      <div>
        <button
          type='submit'
          disabled={isLoading}
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </div>
    </form>
  );
};

export default SignUpForm;
