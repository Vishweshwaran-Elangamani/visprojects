import React, { useState } from 'react';
import { api } from './ui/api';
import { toast } from 'sonner';


type LoginProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md border border-gray-300 bg-white p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 border-2 border-gray-400 flex items-center justify-center">
            <span className="text-gray-600">LOGO</span>
          </div>
          <h1 className="text-xl text-gray-800 mb-2">Referral Management System</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 bg-white"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 bg-white"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="w-full p-3 bg-gray-200 border border-gray-400 text-gray-800 hover:bg-gray-300"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-8 p-4 border border-gray-300 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>Admin: admin@company.com / admin123</p>
            <p>Employee: sarah@company.com / employee123</p>
            <p>HR: mike@company.com / hr123</p>
          </div>
        </div>
      </div>
    </div>
  );
}