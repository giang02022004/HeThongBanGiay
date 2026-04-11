import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { UserPlus, BookOpen } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-600 text-white mb-6 shadow-2xl shadow-indigo-200">
            <UserPlus size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">Join the <br/>Collective</h1>
          <p className="text-xl font-medium text-gray-400">Create your account to start learning</p>
        </div>

        <Card className="p-12 mb-8 bg-white" hover={false}>
          {error && (
            <div className="mb-8 p-5 rounded-3xl bg-red-50 text-red-500 text-sm font-bold border border-red-100 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-8 p-5 rounded-3xl bg-green-50 text-green-600 text-sm font-bold border border-green-100 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
              Đăng ký thành công! Đang chuyển hướng...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Chọn tên đăng nhập"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Địa chỉ email của bạn"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
            />
            
            <Button type="submit" className="w-full mt-6 py-5 rounded-[2rem] text-xl bg-indigo-600 hover:bg-indigo-700" disabled={loading || success}>
              {loading ? 'Creating Identity...' : 'SIGN UP NOW'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-gray-400 text-lg font-bold">
          Already a member?{' '}
          <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-8">
            Return to Arena
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
