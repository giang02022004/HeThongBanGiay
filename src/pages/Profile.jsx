import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Briefcase, 
  Shield, 
  Award, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  Edit,
  Save,
  X,
  Star,
  ChevronLeft,
  Trophy,
  Flame,
  Target,
  Zap,
  Check,
  Camera
} from 'lucide-react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'edit', 'security', 'history'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            alert('Cập nhật ảnh đại diện thành công!');
        } catch (err) {
            console.error('Upload failed', e);
            alert('Lỗi tải ảnh lên!');
        } finally {
            setUploading(false);
        }
    };
    
    // States for various forms
    const [formData, setFormData] = useState({
        username: '',
        interests: '',
        skills: '',
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/me');
            setProfile(res.data);
            updateUser(res.data); // Update global auth state
            setFormData({
                username: res.data.username || '',
                interests: res.data.interests || '',
                skills: res.data.skills || '',
            });
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await api.get('/progress/my-enrollments');
            setHistoryData(res.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await api.put('/user/me', formData);
            setActiveModal(null);
            fetchProfile();
        } catch (err) {
            console.error('Failed to update profile', err);
            alert('Có lỗi xảy ra khi cập nhật thông tin!');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        setSaving(true);
        try {
            await api.post('/user/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            alert('Đổi mật khẩu thành công!');
            setActiveModal(null);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error('Failed to change password', err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const sections = [
        { id: 'info', title: 'Thông tin cá nhân', icon: <User size={48} />, action: () => setActiveModal('edit') },
        { id: 'career', title: 'Kỹ năng & Sở thích', icon: <Briefcase size={48} />, action: () => setActiveModal('edit') },
        { id: 'security', title: 'Bảo mật', icon: <Shield size={48} />, action: () => setActiveModal('security') },
        { id: 'achievements', title: 'Thành tựu', icon: <Award size={48} />, action: () => { setActiveModal('achievements'); fetchHistory(); } },
        { id: 'history', title: 'Lịch sử học tập', icon: <History size={48} />, action: () => { setActiveModal('history'); fetchHistory(); } },
        { id: 'settings', title: 'Cài đặt', icon: <Settings size={48} />, action: () => {} }
    ];

    // Calculate Achievement Stats
    const totalCompleted = historyData.filter(en => (en.maxScore || 0) >= 80).length;
    const avgScore = historyData.length > 0 
        ? Math.round(historyData.reduce((acc, curr) => acc + (curr.maxScore || 0), 0) / historyData.length)
        : 0;
    const hasPerfectScore = historyData.some(en => en.maxScore === 100);

    const badges = [
        { id: 1, name: 'Ngôi sao mới', desc: 'Hoàn thành bài thi đầu tiên', icon: <Trophy />, achieved: historyData.length > 0 },
        { id: 2, name: 'Chiến thần học tập', desc: 'Hoàn thành 5 bài thi đạt điểm cao', icon: <Flame />, achieved: totalCompleted >= 5 },
        { id: 3, name: 'Thợ săn điểm 10', desc: 'Đạt điểm 100 tuyệt đối', icon: <Target />, achieved: hasPerfectScore },
        { id: 4, name: 'Cấp độ', desc: 'Đạt cấp độ Trung cấp trở lên', icon: <Zap />, achieved: profile?.level === 'Trung cấp' || profile?.level === 'Cao cấp' }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
            {/* Simple Header ... same as before ... */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                        <ChevronLeft size={18} /> Quay lại trang chủ
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs overflow-hidden border border-gray-100">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                profile?.username?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{profile?.username}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-10">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-12 border-b border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-3xl font-bold text-blue-600 shadow-sm overflow-hidden">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-500 hover:text-blue-600 cursor-pointer transition-all hover:scale-110 group-hover:bg-blue-50">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                                <Camera size={16} />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{profile?.username}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5"><Mail size={14} /> {profile?.email}</span>
                                <span className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">{profile?.level || 'Học viên'}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveModal('edit')}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                    >
                        <Edit size={16} /> Chỉnh sửa hồ sơ
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map(section => (
                        <div 
                            key={section.id}
                            className="p-10 bg-white border border-gray-200 rounded-[24px] hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all group cursor-pointer flex flex-col items-center text-center"
                            onClick={section.action}
                        >
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                                {section.icon}
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors">{section.title}</h3>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100">
                    <button 
                        onClick={logout}
                        className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                        <LogOut size={18} /> Đăng xuất tài khoản
                    </button>
                </div>
            </main>

            {/* Modals Handling */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`bg-white w-full ${activeModal === 'history' || activeModal === 'achievements' ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl shadow-2xl relative z-10 overflow-hidden`}
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold">
                                    {activeModal === 'edit' && 'Chỉnh sửa hồ sơ'}
                                    {activeModal === 'security' && 'Bảo mật tài khoản'}
                                    {activeModal === 'history' && 'Lịch sử học tập'}
                                    {activeModal === 'achievements' && 'Thành tựu & Huy hiệu'}
                                </h3>
                                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[70vh]">
                                {activeModal === 'edit' && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và tên</label>
                                            <input 
                                                type="text" 
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kỹ năng chuyên môn</label>
                                            <textarea 
                                                rows="2"
                                                value={formData.skills}
                                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sở thích & Định hướng</label>
                                            <textarea 
                                                rows="2"
                                                value={formData.interests}
                                                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" 
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeModal === 'security' && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mật khẩu hiện tại</label>
                                            <input 
                                                type="password" 
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mật khẩu mới</label>
                                            <input 
                                                type="password" 
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                                            <input 
                                                type="password" 
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeModal === 'history' && (
                                    <div className="space-y-4">
                                        {historyLoading ? (
                                            <div className="py-10 text-center text-gray-500">Đang tải lịch sử...</div>
                                        ) : historyData.length === 0 ? (
                                            <div className="py-10 text-center text-gray-500 italic">Bạn chưa thực hiện bài kiểm tra nào.</div>
                                        ) : (
                                            historyData.map((item) => (
                                                <div key={item.courseId} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between group">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase text-sm mb-1">{item.courseTitle}</h4>
                                                        <p className="text-xs text-gray-500">Đã đăng ký: {new Date(item.enrolledAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-sm font-bold ${item.maxScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                                                            {item.maxScore || 0}/100
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.progressPercent}% hoàn thành</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeModal === 'achievements' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                                <span className="text-2xl font-bold text-gray-900">{totalCompleted}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Khóa học đạt</span>
                                            </div>
                                            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                                <span className="text-2xl font-bold text-gray-900">{avgScore}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Điểm trung bình</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Bộ sưu tập huy hiệu</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {badges.map(badge => (
                                                    <div key={badge.id} className={`p-4 rounded-xl border transition-all flex items-center gap-5 ${badge.achieved ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-gray-100 opacity-40'}`}>
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${badge.achieved ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                            {React.cloneElement(badge.icon, { size: 18 })}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className={`font-bold text-sm ${badge.achieved ? 'text-gray-900' : 'text-gray-400'}`}>{badge.name}</h5>
                                                            <p className="text-[11px] text-gray-400">{badge.desc}</p>
                                                        </div>
                                                        {badge.achieved && (
                                                            <div className="text-gray-900">
                                                                <Check size={16} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Minimalist Completed Courses List */}
                                        <div className="space-y-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Khóa học đã chinh phục</h4>
                                            <div className="space-y-1">
                                                {historyData.filter(en => (en.maxScore || 0) >= 80).length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic px-1">Chưa có khóa học nào được hoàn thành.</p>
                                                ) : (
                                                    historyData.filter(en => (en.maxScore || 0) >= 80).map((en, i) => (
                                                        <div key={i} className="flex items-center gap-3 py-2 px-1 rounded-lg transition-colors group">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0"></div>
                                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight flex-1">{en.courseTitle}</span>
                                                            <span className="text-xs font-black text-gray-900">{en.maxScore}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(activeModal === 'edit' || activeModal === 'security') && (
                                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                    <button 
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={activeModal === 'edit' ? handleUpdateProfile : handleChangePassword}
                                        disabled={saving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold flex items-center gap-2"
                                    >
                                        {saving ? 'Đang lưu...' : <><Save size={16} /> Lưu thay đổi</>}
                                    </button>
                                </div>
                            )}

                            {(activeModal === 'history' || activeModal === 'achievements') && (
                                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                                    <button 
                                        onClick={() => setActiveModal(null)}
                                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-all text-sm font-semibold"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
