import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Map, 
  Target, 
  Award, 
  ShieldCheck, 
  Zap, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  Circle, 
  CheckCircle2, 
  Lock,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CareerPathway = () => {
  const navigate = useNavigate();
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get('/courses'),
          api.get('/progress/my-enrollments')
        ]);
        setCourses(courseRes.data);
        setEnrollments(progressRes.data);
      } catch (err) {
        console.error('Failed to fetch data for pathway', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to filter courses by level and check status
  const getCoursesForLevel = (levelName) => {
    const levelLower = levelName?.toLowerCase();
    const filtered = courses.filter(c => {
      const cLevel = (c.level || 'Cơ bản').toLowerCase();
      if (levelLower === 'cơ bản') return cLevel === 'cơ bản' || cLevel === 'dễ';
      if (levelLower === 'trung bình') return cLevel === 'trung bình';
      if (levelLower === 'nâng cao') return cLevel === 'nâng cao' || cLevel === 'khó';
      return false;
    });

    return filtered.map(c => {
      const en = enrollments.find(e => e.courseId === c.id);
      return {
        ...c,
        isEnrolled: !!en,
        progress: en ? en.progressPercent : 0,
        isCompleted: en ? en.maxScore !== null && en.maxScore >= 80 : false
      };
    });
  };

  const baseMilestones = [
    {
      id: 1,
      title: "Giai đoạn 1: Tân Binh",
      subtitle: "Hòa nhập & An toàn",
      description: "Bước chân đầu tiên vào môi trường công nghiệp hiện đại. Bạn sẽ được trang bị nền tảng an toàn và văn hóa làm việc chuyên nghiệp.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "bg-blue-500",
      level: "Cơ bản",
      defaultReqs: ["Khóa học An toàn lao động cơ bản", "Nội quy và Văn hóa doanh nghiệp"]
    },
    {
      id: 2,
      title: "Giai đoạn 2: Thợ Lành Nghề",
      subtitle: "Chuyên môn & Số hóa",
      description: "Nâng tầm tay nghề và làm quen với các công cụ kỹ thuật số trong sản xuất. Đây là giai đoạn quan trọng nhất để bứt phá.",
      icon: <Zap className="w-6 h-6" />,
      color: "bg-yellow-500",
      level: "Trung bình",
      defaultReqs: ["Kỹ năng vận hành máy móc CNC/Tự động", "Tin học văn phòng cho sản xuất"]
    },
    {
      id: 3,
      title: "Giai đoạn 3: Tổ Trưởng",
      subtitle: "Dẫn dắt & Quản lý",
      description: "Thử thách với vai trò điều hành nhóm. Tập chung vào kỹ năng lãnh đạo và tối ưu hóa quy trình làm việc.",
      icon: <Users className="w-6 h-6" />,
      color: "bg-green-500",
      level: "Nâng cao", // Or specific advanced levels
      defaultReqs: ["Kỹ năng quản lý đội nhóm nhỏ", "Lập kế hoạch sản xuất hàng tuần"]
    },
    {
      id: 4,
      title: "Giai đoạn 4: Quản Lý Xưởng",
      subtitle: "Chiến lược & Số hóa 4.0",
      description: "Tầm nhìn bao quát toàn hệ thống. Làm chủ công nghệ Chuyển đổi số 4.0 để đưa doanh nghiệp vươn xa.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-500",
      level: "Nâng cao",
      defaultReqs: ["Quản trị sản xuất thông minh (Smart Factory)", "Phân tích dữ liệu sản xuất nâng cao"]
    }
  ];

  const processedMilestones = [];
  baseMilestones.forEach((m, idx) => {
    const milestoneCourses = getCoursesForLevel(m.level);
    const totalCount = milestoneCourses.length;
    const completedCount = milestoneCourses.filter(c => c.isCompleted).length;
    
    let status = 'locked';
    const isThisLevelDone = totalCount > 0 && completedCount >= totalCount;

    if (idx === 0) {
      status = isThisLevelDone ? 'completed' : 'current';
    } else {
      const prev = processedMilestones[idx - 1];
      if (prev.status === 'completed') {
        status = isThisLevelDone ? 'completed' : 'current';
      } else {
        status = 'locked';
      }
    }

    processedMilestones.push({
      ...m,
      status,
      realCourses: milestoneCourses,
      totalCount,
      completedCount,
      completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    });
  });

  // Calculate overall career progress
  const totalCareerCourses = courses.length;
  const totalCompleted = enrollments.filter(e => e.maxScore !== null && e.maxScore >= 80).length;
  const overallProgress = totalCareerCourses > 0 ? Math.round((totalCompleted / totalCareerCourses) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[#0050b3] font-bold">
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-t-transparent border-[#0050b3] rounded-full" />
       <span className="ml-4">Đang chuẩn bị lộ trình của bạn...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#2b3674] font-sans pb-20">
      {/* Top Bar */}
      <nav className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#707eae] hover:text-[#0050b3] transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Quay lại Trang chủ
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-[#e0e5f2] px-3 py-1 rounded-full text-[12px] font-bold text-[#707eae]">
            {overallProgress >= 100 ? 'QUẢN LÝ TỐI CAO' : overallProgress >= 75 ? 'BẬC 4' : overallProgress >= 50 ? 'BẬC 3' : overallProgress >= 25 ? 'BẬC 2' : 'TÂN BINH'}
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-[40px] font-black tracking-tight mb-4 flex items-center justify-center gap-3">
              <Map className="text-[#0050b3] w-10 h-10" /> Lộ Trình Thăng Tiến Của Bạn
            </h1>
            <p className="text-[#707eae] text-[18px] max-w-[700px] mx-auto leading-relaxed">
              Khám phá hành trình từ một công nhân mới đến quản lý sản xuất hiện đại. 
              Mỗi bước đi là một cột mốc đánh dấu sự trưởng thành và kỹ năng mới.
            </p>
          </motion.div>
        </div>

        {/* Global Progress Bar */}
        <div className="mb-20 bg-white p-6 rounded-3xl shadow-xl shadow-blue-500/5 border border-blue-50/50">
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <p className="text-[#707eae] text-[14px] font-bold uppercase tracking-wider mb-1">Tiến trình sự nghiệp</p>
              <h3 className="text-[24px] font-black">{overallProgress}% Hoàn thành</h3>
            </div>
            <div className="text-right">
              <p className="text-[#707eae] text-[14px] font-bold uppercase tracking-wider mb-1">Mục tiêu tiếp theo</p>
              <h3 className="text-[24px] font-black text-yellow-500">
                {processedMilestones.find(m => m.status === 'current')?.title || 'Hoàn thành lộ trình'}
              </h3>
            </div>
          </div>
          <div className="h-4 w-full bg-[#f4f7fe] rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
            />
            <div className="absolute top-0 right-[55%] h-full w-[2px] bg-white opacity-50 shadow-[0_0_10px_white]" />
          </div>
        </div>

        {/* The Roadmap Timeline */}
        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[4px] bg-blue-100/50 -translate-x-1/2 rounded-full hidden md:block"></div>

          <div className="space-y-24 relative">
            {processedMilestones.map((m, idx) => {
              const isEven = idx % 2 === 0;
              const isLocked = m.status === 'locked';
              const isCurrent = m.status === 'current';
              const isCompleted = m.status === 'completed';

              return (
                <div key={m.id} className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content Side */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="w-full md:w-[45%] group"
                  >
                    <div 
                      onClick={() => setSelectedMilestone(selectedMilestone === m.id ? null : m.id)}
                      className={`cursor-pointer p-8 rounded-[32px] transition-all duration-300 border-2 ${
                        isCurrent 
                        ? 'bg-white border-yellow-400 shadow-2xl shadow-yellow-500/10' 
                        : isLocked 
                        ? 'bg-gray-50 border-gray-100 opacity-80' 
                        : 'bg-white border-transparent shadow-xl shadow-blue-500/5 hover:-translate-y-2'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[12px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isCompleted ? 'Đã đạt' : isCurrent ? 'Đang thực hiện' : 'Chưa mở khóa'}
                        </span>
                        {isLocked && <Lock size={16} className="text-gray-400" />}
                        {isCompleted && <CheckCircle2 size={20} className="text-green-500" />}
                      </div>

                      <h2 className="text-[26px] font-black mb-1 group-hover:text-[#0050b3] transition-colors">{m.title}</h2>
                      <p className="text-[#0050b3] font-bold text-[16px] mb-4">{m.subtitle}</p>
                      <p className="text-[#707eae] text-[15px] leading-relaxed mb-6">{m.description}</p>
                      
                        {m.totalCount > 0 ? (
                          <span className="bg-blue-50 text-[#0050b3] px-3 py-1 rounded-lg text-[12px] font-black border border-blue-100 flex items-center gap-2">
                             <CheckCircle2 size={12} />
                             Tiến độ: {m.completedCount}/{m.totalCount} khóa
                          </span>
                        ) : (
                          <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-lg text-[12px] font-bold border border-gray-100 italic">
                             Đang cập nhật bài giảng
                          </span>
                        )}
                        {m.status === 'current' && m.totalCount > 0 && (
                          <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-[11px] font-bold border border-yellow-100 animate-pulse">
                             Cần xong {m.totalCount} bài để thăng cấp
                          </span>
                        )}

                        <AnimatePresence>
                          {selectedMilestone === m.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-8 pt-8 border-t border-gray-100">
                                <h4 className="font-black text-[14px] uppercase tracking-widest text-[#707eae] mb-4">Các khóa học yêu cầu:</h4>
                                <div className="space-y-4">
                                  {m.realCourses.length > 0 ? (
                                    m.realCourses.map((course) => (
                                      <div 
                                        key={course.id}
                                        onClick={(e) => { e.stopPropagation(); navigate('/'); /* Hoặc navigate to course */ }}
                                        className={`p-4 rounded-2xl border transition-all ${
                                          course.isCompleted 
                                          ? 'bg-green-50/50 border-green-100' 
                                          : course.isEnrolled ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100 hover:border-blue-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-bold text-[15px] text-[#2b3674]">{course.title}</h5>
                                          {course.isCompleted ? (
                                             <CheckCircle2 size={16} className="text-green-500" />
                                          ) : course.isEnrolled ? (
                                             <div className="text-[11px] font-bold text-blue-500">{course.progress}%</div>
                                          ) : (
                                             <ChevronRight size={16} className="text-gray-300" />
                                          )}
                                        </div>
                                        <p className="text-[12px] text-[#707eae] line-clamp-1">{course.description}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="space-y-3">
                                      {m.defaultReqs.map((r, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[14px] font-medium text-[#c0c0c0] italic">
                                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                                          {r} (Đang cập nhật bài giảng)
                                        </li>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigate('/'); }}
                                  className={`w-full mt-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    isLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#0050b3] text-white hover:bg-black'
                                  }`}
                                >
                                  {isCompleted ? 'Xem lại bài học' : isLocked ? 'Cần đạt cấp trước' : 'Bắt đầu học ngay'}
                                  <ChevronRight size={18} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                  {/* Center Node Side */}
                  <div className="absolute left-[30px] md:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-xl border-[4px] border-white transition-colors cursor-pointer ${
                         isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-yellow-500 text-white ring-8 ring-yellow-500/20' : 'bg-white text-gray-300'
                      }`}
                    >
                      {isCompleted ? <Award size={28} /> : m.icon}
                    </motion.div>
                  </div>

                  {/* Empty Side (for Desktop layout) */}
                  <div className="hidden md:block w-full md:w-[45%]" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Card */}
        <div className="mt-32 bg-black text-white p-12 rounded-[40px] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <h2 className="text-[32px] font-black mb-4 relative z-10 text-[#fdb813]">Tương lai nằm trong tầm tay bạn</h2>
          <p className="text-gray-400 text-[18px] max-w-[600px] mx-auto mb-10 relative z-10 leading-relaxed">
            Mỗi giai đoạn đều có sự hỗ trợ từ AI của hệ thống để gợi ý các tài liệu sát thực tế nhất. Đừng ngần ngại bứt phá giới hạn!
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:bg-[#fdb813] transition-all relative z-10"
          >
            QUAY LẠI TRANG HỌC TẬP
          </button>
        </div>
      </main>
    </div>
  );
};

export default CareerPathway;
