import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { 
  X, Check, ChevronUp, ChevronDown, 
  Search, ArrowLeft, ChevronsRight, Loader2,
  CheckCircle2, CircleDot, PlayCircle, Video, FileText, Image, GraduationCap
} from 'lucide-react';
import ReactPlayer from 'react-player';

const QuizSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Layout states
  const [activeMediaTab, setActiveMediaTab] = useState('video');
  const [expandedModules, setExpandedModules] = useState({ 0: true, 1: true, 2: true });
  const [noteText, setNoteText] = useState('');

  // Tiến độ học tập
  const [tienDo, setTienDo] = useState({ phanTram: 0, baiHoanThanh: 0, tongBai: 0, tiendoBaiHoc: {} });
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [markingDone, setMarkingDone] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  // Hàm trộn mảng (Fisher-Yates Shuffle)
  const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };
  
  // Định nghĩa các biến dẫn xuất (Derived State) trước khi dùng trong useEffect
  const currentQuiz = course?.quizzes && course.quizzes.length > 0 ? course.quizzes[0] : null;
  const lessons = course?.lessons || [];
  const currentLessonIndex = lessons.findIndex(l => l.id === currentLessonId) ?? -1;
  const isLastLesson = lessons.length > 0 && currentLessonIndex === lessons.length - 1;

  const questions = shuffledQuestions.filter(q => {
    // Ưu tiên lọc theo lessonId nếu có, nếu không thì dùng lessonIndex (từ form Admin)
    if (q.lessonId) return q.lessonId === currentLessonId;
    return q.lessonIndex === currentLessonIndex;
  });

  const currentLesson = course?.lessons?.find(l => l.id === currentLessonId);
  const videoUrl = currentLesson?.videos?.[0]?.url;
  const readingText = currentLesson?.content;
  const infographicUrl = currentLesson?.readingContents?.[0]?.content;

  // Hàm kiểm tra xem một bài học (theo ID hoặc Index) đã trả lời hết câu hỏi chưa
  const isLessonQuizDone = (lId, lIdx) => {
    const lessonQuestions = shuffledQuestions.filter(q => q.lessonId === lId || q.lessonIndex === lIdx);
    if (lessonQuestions.length === 0) return true; 
    return lessonQuestions.every(q => answers[q.id] && answers[q.id].length > 0);
  };

  // Tính toán tiến độ thực tế (Real-time)
  const localBaiHoanThanh = lessons.filter((l, idx) => isLessonQuizDone(l.id, idx)).length;
  const localTongBai = lessons.length;
  const localPhanTram = localTongBai > 0 ? Math.round((localBaiHoanThanh / localTongBai) * 100) : 0;

  // Kiểm tra xem tất cả câu hỏi của bài hiện tại đã được trả lời chưa
  const isCurrentLessonAnswered = questions.length > 0 && questions.every(q => answers[q.id] && answers[q.id].length > 0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
        
        // Lấy thông tin nhấp (draft) từ DATABASE trước
        let draftFromDB = null;
        try {
          // Chỉ lấy Quiz đầu tiên vì hiện tại 1 Course có 1 Quiz chính
          const quizId = res.data.quizzes?.[0]?.id;
          if (quizId) {
            const draftRes = await api.get(`/progress/quiz-draft/${quizId}`);
            if (draftRes.data.duLieu) {
              draftFromDB = JSON.parse(draftRes.data.duLieu);
            }
          }
        } catch (e) {
          console.log('Không có bản nháp trên server hoặc chưa đăng nhập');
        }

        // Ưu tiên load chế độ Xem lại (Review) nếu có state truyền qua
        if (location.state?.mode === 'review') {
          setAnswers(location.state.answers || {});
          setShuffledQuestions(location.state.shuffledQuestions || []);
          setFinished(true);
          setScore(location.state.score || 0);
          console.log('Đang ở chế độ xem lại bài làm');
        } else if (draftFromDB) {
          // Ưu tiên bản nháp từ DATABASE (để hỗ trợ đa thiết bị)
          setAnswers(draftFromDB.answers || {});
          setShuffledQuestions(draftFromDB.shuffledQuestions || []);
          console.log('Đã khôi phục bản nháp từ Server');
        } else {
          // Kiểm tra xem có bản nháp lưu trong localStorage không (fallback)
          const draftKey = `quiz_draft_${id}`;
          const savedDraft = localStorage.getItem(draftKey);
          
          if (savedDraft) {
            try {
              const draft = JSON.parse(savedDraft);
              setAnswers(draft.answers || {});
              setShuffledQuestions(draft.shuffledQuestions || []);
              console.log('Đã khôi phục bản nháp từ trình duyệt');
            } catch (e) {
              console.error('Lỗi khi phân giải bản nháp local:', e);
              initializeQuiz(res.data);
            }
          } else {
            initializeQuiz(res.data);
          }
        }

        if (res.data.lessons && res.data.lessons.length > 0) {
          setCurrentLessonId(res.data.lessons[0].id);
        }
      } catch (err) {
        console.error(err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const initializeQuiz = (courseData) => {
      if (courseData.quizzes?.[0]?.questions) {
        const originalQuestions = courseData.quizzes[0].questions;
        const randomized = shuffleArray(originalQuestions).map(q => ({
          ...q,
          options: shuffleArray(q.options)
        }));
        setShuffledQuestions(randomized);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  // Effect tự động lưu bản nháp khi có thay đổi (Local + Server)
  useEffect(() => {
    if (course && !finished && (Object.keys(answers).length > 0 || shuffledQuestions.length > 0)) {
      const quizId = currentQuiz?.id;
      const draftData = {
        answers,
        shuffledQuestions,
        updatedAt: new Date().toISOString()
      };

      // 1. Lưu LocalStorage (Dùng để offline tạm thời hoặc nhanh)
      const draftKey = `quiz_draft_${id}`;
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      // 2. Đồng bộ lên Server (Database) - Hỗ trợ đa thiết bị
      if (quizId) {
        const syncToDB = async () => {
           try {
              await api.post('/progress/quiz-draft', {
                 quizId: quizId,
                 duLieu: JSON.stringify(draftData)
              });
           } catch (e) {
              console.error('Lỗi đồng bộ bản nháp lên server:', e);
           }
        };
        
        // Debounce nhẹ để tránh gọi API quá dày đặc
        const timer = setTimeout(syncToDB, 1500); 
        return () => clearTimeout(timer);
      }
    }
  }, [answers, shuffledQuestions, course, id, finished, currentQuiz]);

  // Tải tiến độ học khi có course
  useEffect(() => {
    if (course) fetchTienDo();
  }, [course]);

  const fetchTienDo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Chưa đăng nhập thì bỏ qua
      const res = await api.get(`/progress/course/${id}`);
      setTienDo(res.data);
    } catch (err) {
      // Không báo lỗi nếu chưa đăng nhập
      console.error('Không thể tải tiến độ:', err);
    }
  };

  const danhDauHoanThanh = async (lessonId) => {
    try {
      setMarkingDone(true);
      await api.post(`/progress/lesson/${lessonId}/watched`);
      await fetchTienDo(); // Load lại tiến độ
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingDone(false);
    }
  };

  const handleOptionToggle = (questionId, optionId, isMultiple) => {
    if (finished) return;
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        return { ...prev, [questionId]: current.includes(optionId) 
          ? current.filter(a => a !== optionId) 
          : [...current, optionId] };
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const [startTime] = useState(Date.now());

  const handleSubmit = async () => {
    // 1. Phân loại câu hỏi theo bài học
    const questionsByLesson = {};
    shuffledQuestions.forEach(q => {
      const lId = q.lessonId || `idx-${q.lessonIndex}`;
      if (!questionsByLesson[lId]) questionsByLesson[lId] = [];
      questionsByLesson[lId].push(q);
    });

    const lessonIds = Object.keys(questionsByLesson);
    if (lessonIds.length === 0) {
      setScore(0);
      setFinished(true);
      return;
    }

    // 2. Tính điểm: Mỗi bài học chiếm tỉ trọng bằng nhau (Tổng 100 điểm)
    const weightPerLesson = 100 / lessonIds.length;
    let totalScore = 0;

    lessonIds.forEach(lId => {
      const lessonQuestions = questionsByLesson[lId];
      let correctInLesson = 0;
      
      lessonQuestions.forEach(q => {
        const selected = answers[q.id] || [];
        const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
        if (selected.length === correctIds.length && selected.every(id => correctIds.includes(id))) {
          correctInLesson++;
        }
      });

      // Điểm của bài này = (Số câu đúng / Tổng câu bài này) * Trọng số của bài
      const lessonPoints = (correctInLesson / lessonQuestions.length) * weightPerLesson;
      totalScore += lessonPoints;
    });

    const finalScore = Math.round(totalScore);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    
    setScore(finalScore);
    setFinished(true);

    // Lưu kết quả bài thi vào Database (Dùng endpoint mới thống nhất)
    try {
      await api.post('/progress/submit-quiz', {
          quizId: currentQuiz?.id,
          lessonId: currentLessonId,
          score: parseFloat(finalScore),
          timeTaken: timeTaken
      });
      await fetchTienDo(); // Load lại để hiển thị tiến độ mới nhất
    } catch (e) { 
      console.error('Lỗi khi lưu kết quả bài thi:', e); 
    }

    // Xóa bản nháp sau khi đã nộp thành công
    localStorage.removeItem(`quiz_draft_${id}`);

    // Chuyển hướng sang trang kết quả
    setTimeout(() => {
      navigate(`/quiz-result/${id}`, { 
        state: { 
          score: finalScore, 
          courseTitle: course?.title,
          answers: answers,
          shuffledQuestions: shuffledQuestions
        } 
      });
    }, 600);
  };

  const toggleModule = (idx) => setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#0050b3]" size={36}/>
    </div>
  );
  if (!course) return null;

  // Syllabus dựa vào dữ liệu thật

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans text-[14px] text-[#333] overflow-hidden">
      
      {/* TOP HEADER */}
      <div className="flex-shrink-0 flex flex-col z-50">
        <header className="h-[50px] border-b border-[#e8e8e8] flex items-center justify-between px-4 bg-white">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-[#0050b3] hover:text-[#003a8c] font-medium transition-colors">
              <ArrowLeft size={18} /> Quay lại
            </button>
            <div className="text-gray-300">|</div>
            <div className="font-semibold text-[15px] text-[#333] truncate max-w-[700px]">
              {course.title}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Minh tiến độ nhỏ gọn ở Header */}
            <div className="hidden md:flex items-center gap-2 bg-[#f0f5ff] px-3 py-1.5 rounded-full">
              <div className="w-24 h-2 bg-[#d9d9d9] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0050b3] rounded-full transition-all duration-500"
                  style={{ width: `${localPhanTram}%` }}
                />
              </div>
              <span className="text-[12px] font-bold text-[#0050b3]">{localPhanTram}%</span>
            </div>
            <button className="text-[#595959] hover:text-[#333]"><Search size={18}/></button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="h-[36px] bg-white border-b flex items-center px-4 text-[#595959] text-[13px]">
          <span className="cursor-pointer hover:text-[#0050b3] font-medium">{course.title}</span>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-[#333] font-semibold">
            {lessons[0]?.title || 'Bài giảng'}
          </span>
        </div>

        {/* Alert Banner */}
        <div className="bg-[#ffe8e8] text-[#d32f2f] text-center py-1.5 text-[13px] font-medium border-b border-[#ffccc7]">
          Bản quyền học liệu thuộc về Nền tảng Học tập Suốt đời cho Công nhân Khu công nghiệp
        </div>
      </div>

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR: Syllabus & Tiến độ */}
        <aside className="w-[290px] border-r border-[#e8e8e8] hidden md:flex flex-col bg-white shrink-0">
          <div className="p-3.5 font-bold text-[#333] border-b border-[#e8e8e8] text-[15px]">
            Hướng dẫn học tập
          </div>

          {/* Progress Summary Bar */}
          <div className="px-4 py-3 bg-[#f8f9ff] border-b border-[#e8e8e8]">
            <div className="flex justify-between mb-1.5 text-[12px] font-medium">
              <span className="text-[#595959]">Tiến độ hoàn thành</span>
              <span className="font-bold text-[#0050b3]">{localBaiHoanThanh}/{localTongBai} bài</span>
            </div>
            <div className="w-full h-2.5 bg-[#e8e8e8] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#0050b3] to-[#1890ff] transition-all duration-700"
                style={{ width: `${localPhanTram}%` }}
              />
            </div>
            <div className="text-right text-[11px] text-[#0050b3] font-bold mt-1">{localPhanTram}%</div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Module: Tổng quan */}
            <div className="border-b border-[#f0f0f0]">
              <div 
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 bg-[#e6f7ff]"
                onClick={() => toggleModule(0)}
              >
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-[#0050b3] shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-[13px] font-bold uppercase text-[#0050b3]">TỔNG QUAN</span>
                </div>
                {expandedModules[0] ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
              </div>
              {expandedModules[0] && (
                <div>
                  <div className="pl-10 pr-4 py-2.5 border-l-2 border-[#0050b3] bg-[#e6f7ff]">
                    <div className="text-[13px] text-[#0050b3] font-semibold">Giới thiệu khóa học</div>
                    <div className="text-[11px] text-gray-400 uppercase mt-0.5">VIDEO</div>
                  </div>
                </div>
              )}
            </div>

            {/* Module: Bài học thật từ DB */}
            <div className="border-b border-[#f0f0f0]">
              <div 
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleModule(1)}
              >
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 shrink-0 rounded-full border border-gray-300 mt-0.5 bg-white" />
                  <span className="text-[13px] font-bold uppercase text-[#333]">NỘI DUNG HỌC TẬP</span>
                </div>
                {expandedModules[1] ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
              </div>
              {expandedModules[1] && (
                <div>
                  {lessons.map((lesson, idx) => {
                    const isCurrent = lesson.id === currentLessonId;

                    // Logic khóa bài: Bài 1 luôn mở, bài n mở nếu bài n-1 hoàn thành (Video + Quiz)
                    const prevLesson = idx > 0 ? lessons[idx-1] : null;
                    const prevStatus = prevLesson ? tienDo.tiendoBaiHoc?.[prevLesson.id] : null;
                    
                    const isPrevCompleted = prevLesson ? isLessonQuizDone(prevLesson.id, idx - 1) : true;

                    const isLocked = idx > 0 && !isPrevCompleted;
                    const isCompleted = isLessonQuizDone(lesson.id, idx);

                    return (
                      <div 
                        key={lesson.id}
                        onClick={() => !isLocked && setCurrentLessonId(lesson.id)}
                        className={`pl-10 pr-4 py-2.5 transition-colors border-l-2 ${
                           isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                        } ${
                          isCurrent ? 'bg-[#e6f7ff] border-[#0050b3]' : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {isCompleted ? (
                            <CheckCircle2 size={14} className="text-[#52c41a] shrink-0 mt-0.5" fill="#f6ffed" />
                          ) : isLocked ? (
                            <GraduationCap size={14} className="text-gray-300 shrink-0 mt-0.5" />
                          ) : (
                            <CircleDot size={14} className={`shrink-0 mt-0.5 ${isCurrent ? 'text-[#0050b3]' : 'text-gray-300'}`} />
                          )}
                          <div>
                            <div className={`text-[13px] leading-snug flex items-center gap-1.5 ${isCurrent ? 'text-[#0050b3] font-semibold' : 'text-[#333]'}`}>
                              {lesson.title || `Bài ${idx + 1}`}
                              {isLocked && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Khóa</span>}
                            </div>
                            <div className="text-[11px] text-gray-400 uppercase mt-0.5 tracking-wide">VIDEO + QUIZ</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skills complete indicator */}
            {tienDo.phanTram === 100 && (
              <div className="mx-4 my-3 p-3 bg-[#f6ffed] border border-[#b7eb8f] rounded-lg flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#52c41a] shrink-0" />
                <div>
                  <div className="text-[13px] font-bold text-[#389e0d]">Hoàn thành khóa học!</div>
                  <div className="text-[11px] text-[#52c41a]">Bạn đã học xong tất cả bài</div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: Video & Quiz */}
        <main className="flex-1 overflow-y-auto bg-white" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[850px] mx-auto p-6 md:p-8">

            {/* Tabs */}
            <div className="flex justify-end mb-2">
              <div className="flex overflow-hidden rounded-md border border-[#0050b3]">
                {['video', 'read', 'infographic'].map((tab, i) => (
                  <button key={tab}
                    onClick={() => setActiveMediaTab(tab)}
                    className={`flex items-center gap-2 px-4 py-1.5 text-[13px] font-medium transition-colors ${i > 0 ? 'border-l border-[#0050b3]' : ''} ${activeMediaTab === tab ? 'bg-[#0050b3] text-white' : 'bg-white text-[#0050b3] hover:bg-blue-50'}`}
                  >
                    {tab === 'video' && <Video size={14} />}
                    {tab === 'read' && <FileText size={14} />}
                    {tab === 'infographic' && <Image size={14} />}
                    {tab === 'video' ? 'Xem video' : tab === 'read' ? 'Đọc' : 'Infographic'}
                  </button>
                ))}
              </div>
            </div>

            {/* Video / Content Rendering */}
            <div className="mb-4">
              <h3 className="text-[18px] font-bold text-[#333] mb-3 flex items-center gap-2">
                <PlayCircle size={22} className="text-[#0050b3]" />
                {currentLesson?.title || course.title}
              </h3>
              
              {activeMediaTab === 'video' && (
                <div className="w-full aspect-[16/9] bg-[#111] relative shadow-md rounded-md overflow-hidden">
                  {videoUrl ? (
                    <ReactPlayer 
                      url={videoUrl} 
                      controls width="100%" height="100%"
                      onEnded={() => currentLessonId && danhDauHoanThanh(currentLessonId)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50 bg-gray-900">
                      <PlayCircle size={56} />
                      <p className="text-sm">Video bài giảng đang được cập nhật</p>
                    </div>
                  )}
                </div>
              )}

              {activeMediaTab === 'read' && (
                <div className="w-full min-h-[400px] bg-white border border-[#e8e8e8] p-8 rounded-md shadow-sm animate-in fade-in duration-500">
                   {readingText ? (
                      <div className="prose max-w-none text-[#333] leading-relaxed whitespace-pre-line">
                         {readingText}
                      </div>
                   ) : (
                      <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400">
                         <Search size={48} className="mb-4 opacity-20" />
                         <p>Nội dung tài liệu đang được soạn thảo</p>
                      </div>
                   )}
                </div>
              )}

              {activeMediaTab === 'infographic' && (
                <div className="w-full bg-gray-50 border border-[#e8e8e8] rounded-md overflow-hidden animate-in zoom-in-95 duration-500">
                   {infographicUrl ? (
                      <img src={infographicUrl} alt="Infographic" className="w-full h-auto" />
                   ) : (
                      <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                         <PlayCircle size={48} className="mb-4 opacity-20" />
                         <p>Hình ảnh Infographic đang được cập nhật</p>
                      </div>
                   )}
                </div>
              )}

              {/* Nút đánh dấu hoàn thành cho các loại nội dung không phải video */}
              {currentLessonId && !tienDo.tiendoBaiHoc?.[currentLessonId]?.daXemVideo && (
                <button
                  onClick={() => danhDauHoanThanh(currentLessonId)}
                  disabled={markingDone}
                  className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#f6ffed] border border-[#b7eb8f] text-[#389e0d] rounded-xl hover:bg-[#d9f7be] transition-all font-bold text-[14px] shadow-sm active:scale-95"
                >
                  {markingDone ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                  Tôi đã học xong phần này
                </button>
              )}
              {currentLessonId && tienDo.tiendoBaiHoc?.[currentLessonId]?.daXemVideo && (
                <div className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#f6ffed] border border-[#b7eb8f] text-[#52c41a] rounded-xl text-[14px] font-bold">
                  <CheckCircle2 size={18} /> Bài học đã hoàn thành ✓
                </div>
              )}
            </div>

            <hr className="border-[#f0f0f0] my-8" />

            {/* Quiz Section */}
            {finished && (
              <div className="mb-6 p-5 bg-[#e6f7ff] border border-[#91d5ff] rounded-xl text-center">
                <div className="text-3xl font-black text-[#0050b3] mb-1">{score}/100</div>
                <div className="text-[#595959]">điểm tổng kết — Tiến độ đã được ghi nhận!</div>
              </div>
            )}

            <h3 className="text-[20px] font-bold text-[#333] mb-6 border-b pb-3">Câu hỏi tương tác</h3>
            
            {(!questions || questions.length === 0) ? (
              <div className="text-center py-10 text-[#8c8c8c] bg-gray-50 rounded-xl border-2 border-dashed">
                Chưa có câu hỏi tương tác nào được thiết lập cho khóa học này.
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, qIdx) => {
                  const isMulti = q.type === 'MULTIPLE_CHOICE';
                  const isTrueFalse = q.type === 'TRUE_FALSE';
                  
                  // Text hướng dẫn dựa trên loại
                  let huongDan = 'Chọn đáp án đúng nhất';
                  if (isMulti) huongDan = 'Chọn nhiều ý đúng';
                  if (isTrueFalse) huongDan = 'Chọn Đúng hoặc Sai';

                  return (
                    <div key={q.id} className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
                      <div className="bg-[#f8f9ff] border-b px-5 py-3 rounded-t-xl">
                        <span className="font-bold text-[#333]">{qIdx + 1}. {huongDan}</span>
                      </div>
                      <div className="p-5">
                        <div className="text-[15px] text-[#333] mb-4 font-medium">{q.text}</div>
                        <div className="flex flex-col gap-2.5">
                          {q.options.map(opt => {
                            const isSelected = (answers[q.id] || []).includes(opt.id);
                            let cls = "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ";
                            if (!finished) {
                              cls += isSelected ? 'border-[#0050b3] bg-[#e6f7ff]' : 'border-[#e8e8e8] hover:bg-gray-50';
                            } else {
                              if (opt.isCorrect) cls += 'border-[#52c41a] bg-[#f6ffed]';
                              else if (isSelected) cls += 'border-[#ff4d4f] bg-[#fff1f0]';
                              else cls += 'border-[#e8e8e8] opacity-50';
                            }
                            return (
                              <label 
                                key={opt.id} 
                                className={cls}
                                onClick={() => handleOptionToggle(q.id, opt.id, isMulti)}
                              >
                                <div className="pt-0.5 shrink-0">
                                  <div className={`w-4.5 h-4.5 border-2 flex items-center justify-center transition-all ${
                                    isMulti ? 'rounded-md' : 'rounded-full'
                                  } ${isSelected ? 'bg-[#0050b3] border-[#0050b3]' : 'border-[#d9d9d9] bg-white'}`}>
                                    {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                                  </div>
                                </div>
                                <span className="text-[14px] text-[#333] leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!finished && (
                  <div className="text-center pt-4 pb-10">
                    {isLastLesson ? (
                      <button 
                        onClick={handleSubmit}
                        className="bg-[#0050b3] hover:bg-[#003a8c] text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-colors flex items-center gap-2 mx-auto"
                      >
                        Kết thúc & Nộp bài
                      </button>
                    ) : isCurrentLessonAnswered ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-[#f6ffed] border border-[#b7eb8f] p-4 rounded-xl inline-block w-full max-w-[500px]">
                           <p className="text-[#389e0d] font-bold text-[15px] mb-1"> Tuyệt vời! Bạn đã trả lời xong phần này.</p>
                           <p className="text-[#52c41a] text-[13px]">Bản nháp đã được lưu. Bạn có thể tiếp tục sang nội dung mới.</p>
                        </div>
                        <button 
                         onClick={() => {
                           const nextLesson = lessons[currentLessonIndex + 1];
                           if (nextLesson) setCurrentLessonId(nextLesson.id);
                           window.scrollTo(0, 0);
                         }}
                         className="bg-[#52c41a] hover:bg-[#389e0d] text-white font-bold py-3 px-12 rounded-xl shadow-lg transition-colors flex items-center gap-2"
                        >
                          Bài học tiếp theo <ChevronsRight size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#f6ffed] border border-[#b7eb8f] p-4 rounded-xl inline-block">
                        <p className="text-[#389e0d] font-bold text-[15px] mb-1">Cần hoàn thành các câu hỏi trên để mở bài tiếp theo</p>
                        <p className="text-[#52c41a] text-[13px]">Sau khi trả lời xong, hệ thống sẽ tự động lưu và mở khóa bài mới ở thanh bên.</p>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-1 mt-3">
                      <p className="text-[12px] text-[#8c8c8c]">Tiến độ của bạn sẽ được cộng dồn đến bài cuối cùng</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#52c41a] font-medium bg-[#f6ffed] px-2 py-0.5 rounded-full border border-[#b7eb8f]">
                         <Check size={10} strokeWidth={4} />
                         Bản nháp được đồng bộ tự động
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>

        {/* RIGHT SIDEBAR: Notes */}
        <aside className="w-[280px] border-l border-[#e8e8e8] hidden xl:flex flex-col bg-white shrink-0">
          <div className="flex border-b border-[#e8e8e8]">
            <div className="border-b-2 border-[#0050b3] text-[#0050b3] px-4 py-3.5 font-bold flex items-center gap-2 text-[15px] relative top-[1px]">
              <ChevronsRight size={18} /> Ghi chép
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <p className="text-[13px] text-gray-500 italic mb-4 leading-relaxed">
              Ghi lại những điều quan trọng trong quá trình học tập
            </p>
            <textarea 
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Nhập ghi chú của bạn..."
              className="w-full h-[200px] border border-[#d9d9d9] rounded-lg p-3 text-[14px] resize-none outline-none focus:border-[#0050b3] hover:border-[#0050b3] transition-colors"
            />
            <button className="mt-3 w-full py-2 bg-[#fb8c00] hover:bg-[#e65100] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Check size={16}/> Lưu ghi chép
            </button>
          </div>

          {/* Mini tiến độ trong sidebar phải */}
          <div className="border-t p-4">
            <div className="text-[12px] font-bold text-[#a3aed1] mb-2 uppercase tracking-wide">Tiến độ của bạn</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-3 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#0050b3] to-[#1890ff] transition-all duration-700"
                  style={{ width: `${localPhanTram}%` }}
                />
              </div>
              <span className="text-[13px] font-black text-[#0050b3] shrink-0">{localPhanTram}%</span>
            </div>
            <p className="text-[11px] text-gray-400">{localBaiHoanThanh} / {localTongBai} bài học đã hoàn thành</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default QuizSession;
