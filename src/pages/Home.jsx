import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Settings, ChevronDown, User as UserIcon, Sparkles, Plus, CheckCircle, XCircle, Award, TrendingUp, GraduationCap } from 'lucide-react';

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showCert, setShowCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      try {
        const progressRes = await api.get('/progress/my-enrollments');
        setQuizzes(progressRes.data);
      } catch (err) {
        console.error('Failed to fetch progress data', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const recRes = await api.get('/courses/recommendations');
        setRecommendations(recRes.data);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    const fetchAllCourses = async () => {
      setLoadingCourses(true);
      try {
        const courseRes = await api.get('/courses');
        setAllCourses(courseRes.data);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/progress/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      }
    };

    fetchProgressData();
    fetchRecommendations();
    fetchAllCourses();
    fetchLeaderboard();
  }, []);

  const handleRegisterCourse = async (courseId) => {
    setIsRegistering(true);
    try {
      await api.post(`/enrollments/register/${courseId}`);
      // Refresh dashboard after successful registration
      const progressRes = await api.get('/progress/my-enrollments');
      setQuizzes(progressRes.data);
      // Remove from recommendations list
      setRecommendations(prev => prev.filter(r => r.id !== courseId));
    } catch (err) {
      console.error('Failed to register course', err);
      alert(err.response?.data?.thongBao || 'Có lỗi xảy ra khi đăng ký!');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCreateTestProfile = async () => {
    try {
      await api.post('/courses/test-profile');
      alert('Đã cập nhật profile mẫu! Đang tải lại gợi ý cho bạn...');
      // Refresh recommendations
      const recRes = await api.get('/courses/recommendations');
      setRecommendations(recRes.data);
    } catch (err) {
      console.error('Failed to update test profile', err);
    }
  };

  const [activeHomeTab, setActiveHomeTab] = useState('learning'); // 'learning', 'failed', 'catalog'

  const handleStartQuiz = (id) => {
    navigate(`/quiz/${id}`);
  };

  const filteredEnrollments = quizzes.filter(q => {
    const matchesSearch = q.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isFailed = q.maxScore !== null && q.maxScore < 80;
    const isCompleted = q.progressPercent === 100 && q.maxScore !== null && q.maxScore >= 80;

    if (activeHomeTab === 'failed') return isFailed;
    if (activeHomeTab === 'completed') return isCompleted;
    if (activeHomeTab === 'learning') return !isFailed && !isCompleted;
    
    return true;
  });

  // SVG representation of the ETEP Cover
  const EtepCover = () => (
    <div className="w-full h-full bg-[#69c0ff] relative flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="absolute top-4 left-4 text-white font-bold text-2xl tracking-widest opacity-80">PRO</div>
      <div className="w-[120px] h-[90px] relative mt-2">
        <div className="absolute inset-x-0 bottom-4 top-0 bg-[#003a8c] border-4 border-white rounded-[4px] z-10 flex">
           {/* Monitor Screen Elements */}
           <div className="w-1/3 border-r border-[#40a9ff] h-full flex flex-col p-1 gap-1">
             <div className="bg-[#40a9ff] w-full h-2 rounded-sm"></div>
             <div className="bg-[#40a9ff] w-full h-2 rounded-sm"></div>
             <div className="bg-[#40a9ff] w-full h-2 rounded-sm opacity-50"></div>
           </div>
           <div className="w-2/3 h-full bg-white flex flex-col p-2 gap-1.5 justify-center items-start overflow-hidden">
              <div className="flex items-center gap-1 w-full"><div className="w-2 h-2 rounded-sm bg-[#52c41a]"></div><div className="w-3/4 h-1.5 rounded-full bg-gray-200"></div></div>
              <div className="flex items-center gap-1 w-full"><div className="w-2 h-2 rounded-sm bg-[#52c41a]"></div><div className="w-3/4 h-1.5 rounded-full bg-gray-200"></div></div>
              <div className="flex items-center gap-1 w-full"><div className="w-2 h-2 rounded-sm bg-gray-300"></div><div className="w-1/2 h-1.5 rounded-full bg-gray-200"></div></div>
           </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-white z-0"></div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-white rounded-t-sm z-0"></div>
      </div>
      <div className="mt-auto mb-3 text-[#003a8c] font-black text-xl tracking-wider">KỸ NĂNG SỐ</div>
      {/* Decorative circles */}
      <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white/20"></div>
      <div className="absolute bottom-10 left-8 w-4 h-4 rounded-full bg-white/20"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[14px]">
      
      {/* Banner Top (Bộ Giáo Dục) */}
      <div className="bg-white border-b relative">
        <div className="max-w-[1240px] mx-auto min-h-[100px] py-4 px-4 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-50 to-blue-100"></div>
          <div className="flex items-center justify-center gap-3 md:gap-4 z-10 w-full flex-col md:flex-row text-center">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-full flex items-center justify-center text-yellow-400 font-bold text-lg md:text-xl relative shrink-0">
               <span className="absolute transform -translate-y-[2px]">★</span>
             </div>
             <div className="flex flex-col items-center">
               <div className="text-[13px] md:text-[15px] font-bold text-[#c62828] uppercase tracking-wide">Nền tảng Học tập Suốt đời</div>
               <div className="text-[16px] md:text-[24px] font-black text-[#0050b3] uppercase tracking-wide mt-1 text-center md:text-left leading-tight">
                 Dành cho công nhân khu công nghiệp & chuyển đổi số
               </div>
             </div>
          </div>
        </div>
        <div className="w-full bg-[#faebeb] text-[#c62828] text-center py-2 text-[14px] font-medium border-y border-[#f5c6c6]">
          Chương trình rèn luyện <strong>Kỹ năng sống & Số hóa</strong>. Nếu cần trợ giúp, vui lòng <a href="#" className="underline text-[#0050b3] hover:text-[#003a8c]">bấm vào đây</a>.
        </div>
      </div>

      {/* Nav 1 (White Nav) */}
      <nav className="bg-white px-2 md:px-8 min-h-[50px] py-1 flex items-center justify-between border-b border-[#e8e8e8]">
        <div className="flex items-center gap-3 md:gap-6 text-[#595959] text-[13px] md:text-[15px] overflow-x-auto whitespace-nowrap flex-1 pr-2 pb-1 md:pb-0 scrollbar-hide">
           <button onClick={() => { setActiveHomeTab('learning'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#0050b3] shrink-0 outline-none">Trang chủ</button>
           <button onClick={() => { setActiveHomeTab('catalog'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-[#d9534f] font-medium shrink-0 outline-none">Khóa học</button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-[#595959] text-[13px] hidden md:flex items-center gap-2">
            Giai đoạn <select className="border border-[#d9d9d9] rounded px-2 py-0.5 outline-none bg-white"><option>2025 - 2030</option></select>
          </div>
          <button className="text-[#595959] hover:text-[#0050b3] px-2"><Bell size={18} /></button>
          
          {/* User Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 hover:bg-[#f5f5f5] py-1 px-2 rounded transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#f0f0f0] text-[#8c8c8c] flex items-center justify-center font-bold text-sm overflow-hidden border border-[#e8e8e8]">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="text-[14px] text-[#595959] font-medium max-w-[120px] truncate">
                {user?.username}
              </span>
              <ChevronDown size={16} className="text-[#8c8c8c]" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded shadow-lg border border-[#e8e8e8] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#f0f0f0] mb-1">
                  <div className="font-bold text-[#262626]">{user?.username}</div>
                  <div className="text-[12px] text-[#8c8c8c]">{user?.roles?.includes('ROLE_ADMIN') ? 'Quản trị viên' : 'Học viên'}</div>
                </div>
                <button onClick={() => { setMenuOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 text-[#262626] hover:bg-[#f5f5f5] text-[14px] flex items-center gap-2">
                  <UserIcon size={16} className="text-[#8c8c8c]" /> Quản lý tài khoản
                </button>
                {user?.roles?.includes('ROLE_ADMIN') && (
                  <button onClick={() => navigate('/admin')} className="w-full text-left px-4 py-2 text-[#262626] hover:bg-[#f5f5f5] text-[14px] flex items-center gap-2">
                    <Settings size={16} className="text-[#8c8c8c]" /> Trang quản trị
                  </button>
                )}
                <button onClick={logout} className="w-full text-left px-4 py-2 text-[#262626] hover:bg-[#f5f5f5] text-[14px] flex items-center gap-2">
                  <LogOut size={16} className="text-[#8c8c8c]" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Nav 2 (Green Nav) */}
      <div className="bg-[#0050b3] px-4 md:px-8 flex items-center overflow-x-auto">
        <div className="flex items-center text-white text-[14px] font-medium">
          <button 
            onClick={() => setActiveHomeTab('learning')}
            className={`py-3 px-4 hover:bg-white/10 whitespace-nowrap transition-colors relative ${activeHomeTab === 'learning' ? 'text-[#fdb813]' : ''}`}
          >
            Đang Học
            {activeHomeTab === 'learning' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#fdb813]"></div>}
          </button>
          
          <button 
            onClick={() => setActiveHomeTab('completed')}
            className={`py-3 px-4 hover:bg-white/10 whitespace-nowrap transition-colors relative ${activeHomeTab === 'completed' ? 'text-[#fdb813]' : ''}`}
          >
            Đã Hoàn Thành
            {activeHomeTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#fdb813]"></div>}
          </button>

          <button 
            onClick={() => setActiveHomeTab('failed')}
            className={`py-3 px-4 hover:bg-white/10 whitespace-nowrap transition-colors relative ${activeHomeTab === 'failed' ? 'text-[#fdb813]' : ''}`}
          >
            Chưa Đạt
            {activeHomeTab === 'failed' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#fdb813]"></div>}
          </button>

          <button 
            onClick={() => setActiveHomeTab('catalog')}
            className={`py-3 px-4 hover:bg-white/10 whitespace-nowrap transition-colors relative ${activeHomeTab === 'catalog' ? 'text-[#fdb813]' : ''}`}
          >
            Đăng ký Khóa học
            {activeHomeTab === 'catalog' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#fdb813]"></div>}
          </button>
          <button 
            onClick={() => navigate('/career-pathway')}
            className="py-3 px-4 hover:bg-white/10 whitespace-nowrap transition-colors outline-none"
          >
            Lộ trình Thăng tiến
          </button>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <h2 className="text-[24px] font-bold text-[#333] mb-4">
           {activeHomeTab === 'failed' ? 'Bài thi chưa đạt' : 
            activeHomeTab === 'completed' ? 'Khóa học đã hoàn thành' :
            activeHomeTab === 'catalog' ? 'Khám phá tất cả khóa học' : 'Bài đang học'}
        </h2>
        
        {activeHomeTab !== 'catalog' && (
          <button 
            onClick={() => setActiveHomeTab('catalog')}
            className="bg-[#0050b3] hover:bg-[#003a8c] text-white px-5 py-2 font-medium transition-colors text-[14px] mb-6 flex-shrink-0"
          >
            Đăng ký học
          </button>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-full">
            <input 
              type="text" 
              placeholder="Nhập tên khóa học" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-4 py-2.5 border border-[#d9d9d9] text-[14px] focus:outline-none focus:border-[#0050b3] shadow-sm placeholder:text-[#bfbfbf] rounded-md"
            />
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white border border-[#f0f0f0] p-6 rounded-xl shadow-sm">
          {loading || loadingCourses ? (
             <div className="py-10 text-center text-[#595959]">Đang tải...</div>
          ) : activeHomeTab === 'catalog' ? (
            /* VIEW: CATALOG (KHÁM PHÁ) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCourses
                .filter(course => !quizzes.some(en => en.courseId === course.id))
                .filter(course => course.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((course, idx) => (
                  <div key={course.id || idx} className="bg-white border border-[#f0f0f0] overflow-hidden hover:shadow-lg transition-all flex flex-col group rounded-xl">
                    <div className="h-[160px] bg-gray-100 relative overflow-hidden">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <EtepCover />
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-[#52c41a] text-white px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm shadow-sm">Mới</span>
                        <span className="bg-white/90 text-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm shadow-sm">{course.level || 'Cơ bản'}</span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col bg-[#fff]">
                      <h4 className="text-[17px] font-bold text-[#1a1a1a] mb-2 line-clamp-2 h-12 group-hover:text-[#0050b3] transition-colors leading-snug">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#faad14]"></div>
                        <span className="text-[12px] font-medium text-[#8c8c8c] uppercase tracking-wider">{course.category?.name || 'Kỹ năng số'}</span>
                      </div>
                      <p className="text-[13px] text-[#595959] line-clamp-2 mb-6 flex-1 italic leading-relaxed">
                        {course.description || 'Chương trình chuẩn hóa kỹ năng dành cho công nhân trong kỳ nguyên số.'}
                      </p>
                      
                      <button 
                        onClick={() => handleRegisterCourse(course.id)}
                        disabled={isRegistering}
                        className="w-full bg-[#0050b3] hover:bg-[#003a8c] disabled:bg-gray-400 text-white py-3 text-[14px] font-black transition-all rounded-lg shadow-sm flex items-center justify-center gap-2"
                      >
                        {isRegistering ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ NGAY'}
                      </button>
                    </div>
                  </div>
                ))
              }
              {allCourses.filter(course => !quizzes.some(en => en.courseId === course.id)).length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-[#e8e8e8] rounded-2xl">
                    <p className="text-[#8c8c8c] font-medium">Bạn đã đăng ký tất cả khóa học hiện có! Chúc mừng bạn.</p>
                </div>
              )}
            </div>
          ) : filteredEnrollments.length > 0 ? (
            <div className="flex flex-col gap-10">
              {filteredEnrollments.map((en, index) => {
                const progress = en.progressPercent || 0;
                const score = en.maxScore !== null ? en.maxScore : '--';
                const enrollDate = en.enrolledAt ? new Date(en.enrolledAt) : new Date();
                const deadline = `${enrollDate.getDate()} Tháng ${enrollDate.getMonth() + 1}, ${enrollDate.getFullYear()}`;

                return (
                  <div key={en.courseId} className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-[#f0f0f0] first:border-0 first:pt-0">
                    <div 
                      className="w-full sm:w-[280px] h-[160px] shrink-0 cursor-pointer shadow-sm relative overflow-hidden rounded-xl"
                      onClick={() => handleStartQuiz(en.courseId)}
                    >
                      {en.courseImageUrl ? (
                        <img src={en.courseImageUrl} alt={en.courseTitle} className="w-full h-full object-cover" />
                      ) : (
                        <EtepCover />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[12px] text-[#8c8c8c]">{deadline}</span>
                        <div className="flex items-center gap-3">
                          {score !== '--' && Number(score) >= 80 ? (
                            <span className="text-[12px] font-bold text-[#52c41a] flex items-center gap-1 bg-[#f6ffed] px-2 py-0.5 rounded-md border border-[#b7eb8f]">
                              <CheckCircle className="w-3 h-3" />
                              Đạt
                            </span>
                          ) : (
                            <span className="text-[12px] font-bold text-[#8c8c8c] flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                              <XCircle className="w-3 h-3" />
                              Chưa đạt
                            </span>
                          )}
                          <span className="text-[12px] text-[#595959]">Điểm: <strong className={score !== '--' ? (Number(score) >= 80 ? "text-[#52c41a]" : "text-[#ff4d4f]") : ""}>{score}/100</strong></span>
                        </div>
                      </div>
                      
                      <h3 className="text-[16px] font-bold text-[#000] mb-2 hover:text-[#0050b3] cursor-pointer transition-colors" onClick={() => handleStartQuiz(en.courseId)}>
                         Khóa học kỹ năng: {en.courseTitle} - Dành cho Công nhân
                      </h3>
                      
                      <div className="mb-6 flex justify-between items-center">
                        <span className="bg-[#e6f7ff] text-[#0050b3] px-2 py-1 text-[11px] font-bold border border-[#91d5ff] uppercase tracking-wide rounded-md">
                          {en.categoryName || 'Kỹ năng'}
                        </span>
                        
                        {score !== '--' && Number(score) >= 80 && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); setShowCert(en); }}
                             className="text-[12px] bg-[#fdb813] text-white font-bold px-3 py-1.5 rounded-md hover:bg-[#d48806] flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                            In Chứng Chỉ
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-[#f5f5f5] h-[6px] rounded-full relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 bg-[#003a8c] h-full rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-end mt-1">
                           <span className="text-[11px] font-bold text-[#262626]">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-[#f0f0f0] rounded-lg text-center bg-gray-50/30">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Sparkles className="w-8 h-8 text-[#fdb813]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#333] mb-2">Sẵn sàng để bắt đầu chưa?</h3>
              <p className="text-[#8c8c8c] text-[14px] mb-6 max-w-[320px] mx-auto">
                Bạn chưa đăng ký khóa học nào. Hãy xem các gợi ý bên dưới để bắt đầu lộ trình học tập của mình.
              </p>
            </div>
          )}

          {/* Recommendations Section */}
          {(loadingRecs || recommendations.length > 0) && (
            <div id="recommendations-section" className="mt-16 pt-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#0050b3] rounded-full"></div>
                  <h2 className="text-[20px] font-bold text-[#333] flex items-center gap-2">
                    Khóa học nổi bật
                  </h2>
                </div>
              </div>
              
              {loadingRecs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 border border-[#f0f0f0] h-[280px] animate-pulse rounded-sm"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((item, idx) => {
                    const course = item.course;
                    const reason = item.aiReason;
                    
                    return (
                      <div key={course.id || idx} className="bg-white border border-[#f0f0f0] overflow-hidden hover:shadow-md transition-all flex flex-col group rounded-xl">
                        <div className="h-[140px] bg-gray-100 relative group-hover:opacity-90 transition-opacity overflow-hidden rounded-t-xl">
                          {course.imageUrl ? (
                            <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                               <EtepCover />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                             <span className="bg-[#fdb813] text-white px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm">
                               {course.level || 'Cơ bản'}
                             </span>
                          </div>
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="text-[15px] font-bold text-[#333] mb-1 line-clamp-2 h-10 group-hover:text-[#0050b3] transition-colors">
                            {course.title}
                          </h4>
                          
                          <div className="mb-3">
                             <p className="text-[11px] text-[#52c41a] font-medium bg-[#f6ffed] border border-[#b7eb8f] px-2 py-0.5 inline-block rounded-md">
                               {reason}
                             </p>
                          </div>
                          
                          <p className="text-[12px] text-[#8c8c8c] line-clamp-2 mb-6 flex-1">
                            {course.description || 'Học kỹ năng này để cải thiện hiệu suất công việc và thăng tiến trong sự nghiệp.'}
                          </p>
                          
                          <button 
                            onClick={() => handleRegisterCourse(course.id)}
                            disabled={isRegistering}
                            className="w-full bg-[#0050b3] hover:bg-[#003a8c] disabled:bg-gray-400 text-white py-2 text-[13px] font-bold transition-all flex items-center justify-center gap-2 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                            Đăng ký ngay
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Cải tiến: Bảng Xếp Hạng (Giữ lại để tạo động lực) */}
          <div className="mt-16">
            {/* Bảng Vàng Gamification */}
            <div className="bg-white border border-[#f0f0f0] p-8 shadow-xl rounded-[24px] bg-gradient-to-br from-white to-[#fffb8f]/5 relative overflow-hidden max-w-[800px] mx-auto">
              <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <Award className="w-48 h-48" />
              </div>
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#fdb813] p-2 rounded-xl text-white shadow-lg shadow-yellow-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-[22px] font-black text-[#2b3674]">Bảng Vàng Thi Đua</h2>
                    <p className="text-[#8c8c8c] text-[12px] font-medium uppercase tracking-widest">Kỳ học gần nhất</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[11px] bg-[#fdb813] text-white px-3 py-1 rounded-full font-black shadow-sm tracking-tighter">LIVE</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {leaderboard && leaderboard.length === 0 ? (
                   <div className="col-span-full text-center py-10">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-[#8c8c8c] text-[14px] italic">Đang cập nhật danh sách chiến thần...</p>
                   </div>
                ) : (
                   leaderboard && leaderboard.map((lb, i) => (
                     <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-blue-50 group cursor-default ${i < 3 ? 'bg-[#f4f7fe]/50' : 'bg-white'}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px] shadow-sm shrink-0 ${
                         i === 0 ? 'bg-gradient-to-tr from-[#fdb813] to-[#ffe58f] text-white ring-4 ring-yellow-500/10' : 
                         i === 1 ? 'bg-gradient-to-tr from-[#bfbfbf] to-[#e6e6e6] text-white ring-4 ring-gray-200/20' : 
                         i === 2 ? 'bg-gradient-to-tr from-[#d48806] to-[#ffd666] text-white ring-4 ring-orange-200/20' : 
                         'bg-white text-[#8c8c8c] border border-gray-100'
                       }`}>
                         {i + 1}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[16px] font-black text-[#2b3674] truncate group-hover:text-[#0050b3] transition-colors">{lb.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                              lb.badge.includes('Vàng') ? 'bg-yellow-500 text-white' : 
                              lb.badge.includes('Bạc') ? 'bg-gray-400 text-white' : 
                              'bg-green-500 text-white'
                            }`}>
                              {lb.badge}
                            </span>
                          </div>
                       </div>
                       <div className="text-right shrink-0">
                          <span className="text-[20px] font-black text-[#0050b3]">{lb.score}</span>
                          <p className="text-[10px] text-[#8c8c8c] uppercase font-bold tracking-widest">Điểm</p>
                       </div>
                     </div>
                   ))
                )}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* MODAL IN CHỨNG CHỈ (PRINTABLE) */}
      {showCert && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #print-section, #print-section * { visibility: visible !important; }
              #print-section { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; box-shadow: none; border: none; transform: scale(1); }
              @page { size: landscape; margin: 0; }
              .no-print { display: none !important; }
            }
          `}</style>
          
          <div className="relative max-w-full overflow-hidden flex flex-col items-center">
            {/* Thanh công cụ */}
            <div className="w-full flex justify-end gap-3 mb-4 no-print pr-4">
              <button onClick={() => window.print()} className="bg-[#52c41a] text-white px-5 py-2 font-bold rounded shadow flex items-center gap-2 hover:bg-[#389e0d]">
                <CheckCircle className="w-4 h-4" /> IN / LƯU PDF
              </button>
              <button onClick={() => setShowCert(null)} className="bg-white text-gray-700 px-5 py-2 font-bold rounded shadow hover:bg-gray-100 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> ĐÓNG
              </button>
            </div>
            
            {/* Bản Thiết Kế Chứng Chỉ (Khổ ngang A4 tỉ lệ) */}
            <div id="print-section" className="bg-[#fffdf0] w-[800px] h-[560px] max-w-[95vw] shadow-2xl relative flex flex-col items-center justify-center text-center px-16 py-12" style={{backgroundImage: 'radial-gradient(#f4f0cb 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
               {/* Khung Viền Góc */}
               <div className="absolute top-4 left-4 w-16 h-16 border-t-8 border-l-8 border-[#0050b3]"></div>
               <div className="absolute top-4 right-4 w-16 h-16 border-t-8 border-r-8 border-[#0050b3]"></div>
               <div className="absolute bottom-4 left-4 w-16 h-16 border-b-8 border-l-8 border-[#0050b3]"></div>
               <div className="absolute bottom-4 right-4 w-16 h-16 border-b-8 border-r-8 border-[#0050b3]"></div>
               
               <div className="absolute top-0 left-0 w-full h-full border-[10px] border-[#0050b3]/10 pointer-events-none m-3"></div>

               <div className="w-20 h-20 bg-[#0050b3] text-white rounded-full flex items-center justify-center shadow-lg mb-6">
                 <GraduationCap size={40} />
               </div>
               
               <h1 className="text-[42px] font-black tracking-widest text-[#0050b3] uppercase mb-1" style={{fontFamily: 'serif'}}>CHỨNG NHẬN HOÀN THÀNH</h1>
               <p className="text-[14px] text-[#8c8c8c] tracking-widest uppercase mb-8">Nền tảng Đào tạo Chuyển đổi số Doanh nghiệp</p>
               
               <p className="text-[16px] text-gray-600 mb-2">Trân trọng cấp chứng nhận này cho học viên:</p>
               <h2 className="text-[36px] font-bold text-[#d48806] italic mb-6" style={{fontFamily: 'serif'}}>{user?.username || 'Học viên'}</h2>
               
               <p className="text-[16px] text-gray-600 mb-3">Đã xuất sắc hoàn thành khóa học chuyên đề đào tạo kỹ năng:</p>
               <h3 className="text-[22px] font-black text-[#2b3674] px-10 w-full border-b border-dashed border-[#0050b3]/30 pb-4 mb-8">
                 {showCert.courseTitle}
               </h3>
               
               <div className="flex w-full justify-between items-center px-10 mt-auto">
                 <div className="text-center">
                    <p className="font-bold text-[#333] text-[15px] border-t border-[#0050b3] pt-2 w-32 mx-auto">Giám đốc Đào tạo</p>
                    <p className="text-[12px] text-gray-500 mt-1 italic">Đã ký (Hệ thống điện tử)</p>
                 </div>
                 
                 <div className="w-24 h-24 rounded-full border-[4px] border-[#d48806]/30 flex items-center justify-center">
                    <div className="w-20 h-20 bg-[#fffbe6] rounded-full flex flex-col items-center justify-center text-[#d48806]">
                      <Award size={28} />
                      <span className="text-[10px] font-black mt-1 uppercase">Đạt Chuẩn</span>
                    </div>
                 </div>
                 
                 <div className="text-center">
                    <p className="text-[14px] font-medium text-gray-600">Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</p>
                    <p className="text-[14px] font-medium text-[#52c41a]">Thành tích thi: {showCert.quizzes?.[0]?.score || '--'}/100 đ</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
