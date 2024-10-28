import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FormInput from './FormInput';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: { username: string; email: string; password: string }) => void;
  onToggle: () => void;
}

export default function AuthForm({ type, onSubmit, onToggle }: AuthFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'register' && !formData.username.trim()) {
      alert('Username is required');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#313338] flex items-center justify-center p-4">
      <div className="bg-[#2b2d31] p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <MessageSquare className="w-12 h-12 text-[#5865f2]" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {type === 'login' ? 'Welcome back!' : 'Create an account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <FormInput
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          )}
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#5865f2] text-white py-2 px-4 rounded font-medium hover:bg-[#4752c4] transition duration-200"
          >
            {type === 'login' ? 'Log In' : 'Continue'}
          </button>
        </form>
        <p className="text-[#b5bac1] text-sm mt-4">
          {type === 'login' ? "Need an account? " : "Already have an account? "}
          <button
            onClick={onToggle}
            className="text-[#00a8fc] hover:underline"
          >
            {type === 'login' ? 'Register' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}