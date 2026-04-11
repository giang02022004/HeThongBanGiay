import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { LogIn, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50/50 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary text-white mb-6 shadow-2xl shadow-blue-200">
            <BookOpen size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">Start Your <br/>Learning Journey</h1>
          <p className="text-xl font-medium text-gray-400">Platform for industrial lifelong learning</p>
        </div>

        <Card className="p-12 mb-8 bg-white" hover={false}>
          {error && (
            <div className="mb-8 p-5 rounded-3xl bg-red-50 text-red-500 text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your secret code"
              required
            />
            
            <Button type="submit" className="w-full mt-6 py-5 rounded-[2rem] text-xl" disabled={loading}>
              {loading ? 'Entering Arena...' : 'ACCESS PLATFORM'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-gray-400 text-lg font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-black hover:underline underline-offset-8">
            Join the collective
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
