'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
          🌲 Welcome Back! 🌲
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-green-800 font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-green-800 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Login
          </button>
        </form>

        <p className="text-center text-green-700 mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
