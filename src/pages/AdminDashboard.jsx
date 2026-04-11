import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
  Trash2, Edit, Plus, Users, BookOpen, BarChart3, Settings, 
  Bell, Search, LayoutDashboard, MessageSquare, Check,
  GraduationCap, Award, TrendingUp, X, UploadCloud, Video,
  CheckCircle2, Loader2, AlertCircle, ArrowLeft, FileText, Image, Sparkles
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'courses', 'categories'
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalWorkers: 0, completionRate: '0.0%', totalCertificates: 0, totalCourses: 0 });

  // Category modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [isCatEditMode, setIsCatEditMode] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', parentCategoryId: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Lessons, 3: Quiz
  const [savingCourse, setSavingCourse] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', imageUrl: '', category: '', level: 'Cơ bản', lessons: [],
    cauHois: [] // Danh sách câu hỏi trực tiếp
  });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openNewCourseModal = () => {
    setIsEditMode(false);
    setEditingCourseId(null);
    setFormData({ 
      title: '', 
      description: '', 
      imageUrl: '', 
      category: '', 
      level: 'Cơ bản', 
      lessons: [], 
      cauHois: [] 
    });
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này? Toàn bộ bài giảng và bài kiểm tra đi kèm sẽ bị xóa sạch.")) {
      try {
        await api.delete(`/courses/${id}`);
        alert("Đã xóa khóa học thành công!");
        fetchCourses();
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi xóa khóa học!");
      }
    }
  };

  const handleEditClick = (course) => {
    setEditingCourseId(course.id);
    setIsEditMode(true);
    
    // Ánh xạ ngược dữ liệu từ entity sang form builder
    setFormData({
      title: course.title || '',
      description: course.description || '',
      imageUrl: course.imageUrl || '',
      level: course.level || 'Cơ bản',
      category: course.category?.id || '',
      lessons: (course.lessons || []).map(ls => ({
        title: ls.title || '',
        videoUrl: ls.videos?.[0]?.url || '',
        readingText: ls.content || '',
        infographicUrl: ls.readingContents?.[0]?.content || '',
        activeTab: ls.videos?.[0]?.url ? 'video' : 'read',
        uploading: false
      })),
      cauHois: (course.quizzes?.[0]?.questions || []).map(q => ({
        text: q.text || '',
        difficulty: q.difficulty || 'Dễ',
        lessonIndex: q.lessonIndex || 0,
        type: q.type || 'SINGLE_CHOICE',
        options: (q.options || []).map(o => ({
          text: o.text || '',
          isCorrect: o.isCorrect || false,
          explanation: o.explanation || ''
        }))
      }))
    });
    
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const addEmptyLesson = () => {
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, { 
        title: '', 
        videoUrl: '', 
        readingText: '', 
        infographicUrl: '',
        activeTab: 'video', // 'video', 'read', 'infographic'
        uploading: false 
      }]
    }));
  };

  const updateLesson = (index, field, value) => {
    const newLessons = [...formData.lessons];
    newLessons[index][field] = value;
    setFormData({ ...formData, lessons: newLessons });
  };

  const handleVideoUpload = async (index, file) => {
    if (!file) return;
    updateLesson(index, 'uploading', true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await api.post('/videos/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.videoUrl) {
         updateLesson(index, 'videoUrl', res.data.videoUrl);
      }
    } catch (err) {
      console.error("Video upload failed", err);
      alert("Tải lên video thất bại!");
    } finally {
      updateLesson(index, 'uploading', false);
    }
  };

  const handleAiSummarize = async (index) => {
    const text = formData.lessons[index].readingText;
    if (!text || text.length < 20) {
      alert("Vui lòng nhập nội dung bài học dài hơn một chút để AI có thể tóm tắt!");
      return;
    }

    updateLesson(index, 'isSummarizing', true);
    
    try {
      const res = await api.post('/ai/summarize', { text });
      
      if (res.data && res.data.summary) {
        updateLesson(index, 'readingText', res.data.summary);
      }
    } catch (error) {
      console.error("AI Summarize error", error);
      alert("AI đang bận một chút, vui lòng thử lại sau!");
    } finally {
      updateLesson(index, 'isSummarizing', false);
    }
  };

  const removeLesson = (index) => {
    const newLessons = formData.lessons.filter((_, i) => i !== index);
    setFormData({ ...formData, lessons: newLessons });
  };

  const themCauHoi = () => {
    const cauHoiMoi = { 
      text: '', 
      difficulty: 'Dễ', 
      type: 'SINGLE_CHOICE',
      lessonIndex: 0, // Mặc định gán vào bài học đầu tiên
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    };
    setFormData(prev => ({ ...prev, cauHois: [...prev.cauHois, cauHoiMoi] }));
  };

  const capNhatCauHoi = (chIdx, field, value) => {
    const ds = [...formData.cauHois];
    ds[chIdx][field] = value;
    
    // Nếu chuyển sang Đúng/Sai, tự động tạo 2 đáp án
    if (field === 'type' && value === 'TRUE_FALSE') {
      ds[chIdx].options = [
        { text: 'Đúng', isCorrect: true },
        { text: 'Sai', isCorrect: false }
      ];
    } else if (field === 'type' && (value === 'SINGLE_CHOICE' || value === 'MULTIPLE_CHOICE')) {
      if (ds[chIdx].options.length < 4) {
        ds[chIdx].options = [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ];
      }
    }
    
    setFormData({ ...formData, cauHois: ds });
  };

  const capNhatDapAn = (chIdx, daIdx, field, value) => {
    const ds = [...formData.cauHois];
    const cauHoi = ds[chIdx];

    if (field === 'isCorrect') {
      if (cauHoi.type === 'SINGLE_CHOICE' || cauHoi.type === 'TRUE_FALSE') {
        // Chỉ được chọn 1 đáp án đúng
        cauHoi.options = cauHoi.options.map((opt, i) => ({ ...opt, isCorrect: i === daIdx }));
      } else if (cauHoi.type === 'MULTIPLE_CHOICE') {
        // Có thể chọn nhiều đáp án đúng (toggle)
        cauHoi.options[daIdx].isCorrect = !cauHoi.options[daIdx].isCorrect;
      }
    } else {
      cauHoi.options[daIdx][field] = value;
    }
    setFormData({ ...formData, cauHois: ds });
  };

  const xoaCauHoi = (chIdx) => {
    setFormData(prev => ({ ...prev, cauHois: prev.cauHois.filter((_, i) => i !== chIdx) }));
  };

  const handleAiGenerateQuestions = async () => {
    // Thu thập tất cả nội dung bài học kiểu văn bản
    const allLessonContent = formData.lessons
      .map(ls => ls.readingText)
      .filter(text => text && text.trim().length > 50)
      .join("\n\n");

    if (!allLessonContent) {
      alert("Vui lòng nhập nội dung bài học (tối thiểu 50 ký tự) để AI có thể dựa vào đó tạo câu hỏi!");
      return;
    }

    try {
      setIsGeneratingQuestions(true);
      const res = await api.post('/ai/generate-questions', { text: allLessonContent });
      
      if (res.data && res.data.questions) {
        try {
          const generatedQuestions = JSON.parse(res.data.questions);
          if (Array.isArray(generatedQuestions)) {
            setFormData(prev => ({
              ...prev,
              cauHois: [...prev.cauHois, ...generatedQuestions]
            }));
            alert(`AI đã tạo thêm ${generatedQuestions.length} câu hỏi mới dựa trên bài giảng!`);
          }
        } catch (parseError) {
          console.error("JSON Parse Error", parseError, res.data.questions);
          alert("Dữ liệu AI trả về không hợp lệ, vui lòng thử lại!");
        }
      }
    } catch (error) {
      console.error("AI Generation Error", error);
      alert("AI đang bận, vui lòng thử lại sau!");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!formData.title) {
       alert("Tiêu đề khóa học không được để trống!"); return;
    }
    try {
      setSavingCourse(true);
      const payload = {
         title: formData.title,
         description: formData.description,
         imageUrl: formData.imageUrl,
         categoryId: formData.category ? Number(formData.category) : null,
         level: formData.level,
         lessons: formData.lessons.map(ls => ({
            title: ls.title,
            videoUrl: ls.videoUrl,
            readingText: ls.readingText,
            infographicUrl: ls.infographicUrl
         })),
         // Đóng gói bộ câu hỏi thành 1 Quiz gắn vào khóa học
         quizzes: formData.cauHois.length > 0 ? [{
            title: `Bộ kiểm tra - ${formData.title}`,
            questions: formData.cauHois.map(ch => ({
               text: ch.text,
               difficulty: ch.difficulty,
               type: ch.type,
               lessonIndex: ch.lessonIndex ?? 0,
               options: ch.options.map(da => ({
                  text: da.text,
                  isCorrect: da.isCorrect,
                  explanation: da.explanation || ''
               }))
            }))
         }] : []
      };

      if (isEditMode) {
        await api.put(`/courses/${editingCourseId}`, payload);
        alert("Cập nhật khóa học thành công!");
      } else {
        await api.post('/courses', payload);
        alert("Khởi tạo Khóa học thành công!");
      }
      
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingCourseId(null);
      fetchCourses();
    } catch (error) {
       console.error("Save error", error);
       alert("Lưu khóa học thất bại!");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!catForm.name) { alert('Tên danh mục không được để trống!'); return; }
    try {
      setSavingCat(true);
      const payload = {
        name: catForm.name,
        description: catForm.description,
        parentCategory: catForm.parentCategoryId ? { id: Number(catForm.parentCategoryId) } : null
      };

      if (isCatEditMode) {
        await api.put(`/categories/${editingCatId}`, payload);
        alert('Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', payload);
        alert('Thêm danh mục thành công!');
      }

      setIsCatModalOpen(false);
      setIsCatEditMode(false);
      setEditingCatId(null);
      setCatForm({ name: '', description: '', parentCategoryId: '' });
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Lưu danh mục thất bại!');
    } finally {
      setSavingCat(false);
    }
  };

  const handleEditCatClick = (cat) => {
    setEditingCatId(cat.id);
    setIsCatEditMode(true);
    setCatForm({
      name: cat.name || '',
      description: cat.description || '',
      parentCategoryId: cat.parentCategory?.id || ''
    });
    setIsCatModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Nếu danh mục đang chứa khóa học, nó sẽ được chuyển vào chế độ lưu trữ thay vì xóa sạch.")) {
      try {
        await api.delete(`/categories/${id}`);
        alert("Xử lý xóa danh mục hoàn tất!");
        fetchCategories();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa danh mục!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans text-[14px] flex">
      <aside className="w-[280px] bg-white text-[#2b3674] flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="h-[90px] flex items-center px-8 border-b border-[#f4f7fe]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(24,144,255,0.4)]">
              <GraduationCap size={24} />
            </div>
            <span className="font-bold text-[22px] tracking-tight text-[#0050b3]">Admin LMS</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="text-[12px] font-bold text-[#a3aed1] px-4 mb-3 mt-2">DASHBOARD</p>
          <nav className="flex flex-col gap-2 mb-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold ${activeTab === 'overview' ? 'bg-[#0050b3] text-white shadow-[0_4px_14px_rgba(0,80,179,0.3)]' : 'text-[#a3aed1] hover:text-[#0050b3] hover:bg-[#e6f7ff]'}`}
            >
              <LayoutDashboard size={20} /> Tổng quan
            </button>
            <button className="flex items-center gap-4 px-4 py-3.5 text-[#a3aed1] hover:text-[#0050b3] hover:bg-[#e6f7ff] rounded-xl transition-all font-bold group">
              <BarChart3 size={20} className="group-hover:text-[#0050b3]" /> Phân tích
            </button>
          </nav>

          <p className="text-[12px] font-bold text-[#a3aed1] px-4 mb-3 mt-2">NỘI DUNG ĐÀO TẠO</p>
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold ${activeTab === 'courses' ? 'bg-[#0050b3] text-white shadow-[0_4px_14px_rgba(0,80,179,0.3)]' : 'text-[#a3aed1] hover:text-[#0050b3] hover:bg-[#e6f7ff]'}`}
            >
              <BookOpen size={20} /> Quản lý Khóa học
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold ${activeTab === 'categories' ? 'bg-[#0050b3] text-white shadow-[0_4px_14px_rgba(0,80,179,0.3)]' : 'text-[#a3aed1] hover:text-[#0050b3] hover:bg-[#e6f7ff]'}`}
            >
              <BarChart3 size={20} /> Quản lý Danh Mục
            </button>
            <button className="flex items-center gap-4 px-4 py-3.5 text-[#a3aed1] hover:text-[#0050b3] hover:bg-[#e6f7ff] rounded-xl transition-all font-bold group">
              <Users size={20} className="group-hover:text-[#0050b3]" /> Quản lý Công nhân
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#e6f7ff] to-[#f4f7fe] -z-10"></div>
        
        <header className="h-[90px] flex items-center justify-between px-8 shrink-0">
          <div>
            <p className="text-[#a3aed1] text-[14px] font-medium mb-1">Hệ Thống / {activeTab === 'overview' ? 'Tổng quan' : 'Khóa học'}</p>
            <h1 className="text-[32px] font-bold text-[#2b3674] leading-tight tracking-tight">
              {activeTab === 'overview' ? 'Dữ Liệu Hệ Thống' : 'Kho Học Liệu & Bài Giảng'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 border-0 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0050b3] to-[#1890ff] flex items-center justify-center text-white font-bold cursor-pointer">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-12">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 mt-2">
                <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#e6f7ff] flex items-center justify-center text-[#1890ff]"><BookOpen size={28} /></div>
                  <div>
                    <p className="text-[14px] text-[#a3aed1] font-medium mb-1">Tổng Số Khóa Học</p>
                    <h3 className="text-[24px] font-bold text-[#2b3674]">{stats.totalCourses || courses.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#f0f5ff] flex items-center justify-center text-[#2f54eb]"><Users size={28} /></div>
                  <div>
                    <p className="text-[14px] text-[#a3aed1] font-medium mb-1">Công Nhân Tham Gia</p>
                    <h3 className="text-[24px] font-bold text-[#2b3674]">{stats.totalWorkers}</h3>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#f6ffed] flex items-center justify-center text-[#52c41a]"><TrendingUp size={28} /></div>
                  <div>
                    <p className="text-[14px] text-[#a3aed1] font-medium mb-1">Tỷ Lệ Hoàn Thành Thi</p>
                    <h3 className="text-[24px] font-bold text-[#2b3674]">{stats.completionRate}</h3>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#fffb8f] flex items-center justify-center text-[#faad14]"><Award size={28} /></div>
                  <div>
                    <p className="text-[14px] text-[#a3aed1] font-medium mb-1">Chứng Chỉ Cấp Phát</p>
                    <h3 className="text-[24px] font-bold text-[#2b3674]">{stats.totalCertificates}</h3>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table (Mocked to fill empty layout gracefully) */}
              <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#2b3674]">Hoạt Động Gần Đây</h2>
                    <p className="text-[#a3aed1] text-[13px]">Lịch sử nộp bài, hoàn thành chứng chỉ trên hệ thống</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#f4f7fe]">
                        <th className="pb-3 px-2 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider">Học Viên</th>
                        <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider">Khóa Học Liên Quan</th>
                        <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider">Trạng Thái</th>
                        <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider text-right pr-2">Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#f4f7fe] hover:bg-[#f9fbfd]">
                        <td className="py-4 px-2 font-bold text-[#2b3674]">CN. Trần Văn An</td>
                        <td className="py-4 text-[#595959] text-[13px]">Nội quy an toàn điện tại xưởng gỗ</td>
                        <td className="py-4"><span className="bg-[#f6ffed] text-[#52c41a] px-3 py-1 rounded-full text-[12px] font-bold border border-[#b7eb8f]">Đã cấp chứng chỉ</span></td>
                        <td className="py-4 text-right pr-2 text-[#a3aed1] text-[13px]">15 phút trước</td>
                      </tr>
                      <tr className="border-b border-[#f4f7fe] hover:bg-[#f9fbfd]">
                        <td className="py-4 px-2 font-bold text-[#2b3674]">CN. Nguyễn Thị Bích</td>
                        <td className="py-4 text-[#595959] text-[13px]">Kỹ năng số cơ bản Microsoft Office</td>
                        <td className="py-4"><span className="bg-[#e6f7ff] text-[#1890ff] px-3 py-1 rounded-full text-[12px] font-bold border border-[#91d5ff]">Đang đăng ký học</span></td>
                        <td className="py-4 text-right pr-2 text-[#a3aed1] text-[13px]">2 giờ trước</td>
                      </tr>
                      <tr className="border-0 hover:bg-[#f9fbfd]">
                        <td className="py-4 px-2 font-bold text-[#2b3674]">CN. Phạm Tấn Cường</td>
                        <td className="py-4 text-[#595959] text-[13px]">Cách nhận biết lừa đảo mạng</td>
                        <td className="py-4"><span className="bg-[#fff2f0] text-[#ff4d4f] px-3 py-1 rounded-full text-[12px] font-bold border border-[#ffccc7]">Bài thi chưa đạt (60đ)</span></td>
                        <td className="py-4 text-right pr-2 text-[#a3aed1] text-[13px]">4 giờ trước</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h2 className="text-[20px] font-bold text-[#2b3674]">Hệ Thống Danh Mục Học Liệu</h2>
                  <p className="text-[#a3aed1] text-[14px]">Phân loại nội dung đào tạo theo lĩnh vực kỹ năng</p>
                </div>
                <button 
                  onClick={() => setIsCatModalOpen(true)}
                  className="h-10 px-5 bg-[#0050b3] text-white font-bold text-[14px] rounded-xl hover:bg-[#003a8c] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(0,80,179,0.3)]">
                  <Plus size={18} /> Thêm Danh Mục
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#f4f7fe]">
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider pl-2">Tên Danh Mục</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider">Mô Tả</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider">Danh Mục Cha</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider text-center">CHỈNH SỬA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-10 text-[#a3aed1] font-medium text-lg">Chưa có danh mục nào</td></tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id} className="border-b border-[#f4f7fe] last:border-0 hover:bg-[#f4f7fe]/50 transition-colors">
                          <td className="py-4 pl-2">
                            <span className="bg-[#e6f7ff] text-[#0050b3] px-3 py-1 rounded-full text-[12px] font-bold">
                              {cat.name}
                            </span>
                          </td>
                          <td className="py-4 text-[#595959] text-[13px]">{cat.description || '—'}</td>
                          <td className="py-4 text-[#a3aed1] text-[13px]">
                            {cat.parentCategory?.name ? (
                              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[12px]">{cat.parentCategory.name}</span>
                            ) : <span className="text-[#52c41a] text-[12px] font-bold">Danh mục gốc</span>}
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleEditCatClick(cat)}
                                className="w-8 h-8 flex items-center justify-center text-[#1890ff] hover:bg-[#e6f7ff] rounded-lg transition-colors">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="w-8 h-8 flex items-center justify-center text-[#ff4d4f] hover:bg-[#fff1f0] rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h2 className="text-[20px] font-bold text-[#2b3674]">Danh Sách Khóa Học & Kỹ Năng</h2>
                  <p className="text-[#a3aed1] text-[14px]">Quản lý lộ trình cho hệ thống học tập suốt đời</p>
                </div>
                <button 
                  onClick={openNewCourseModal}
                  className="h-10 px-5 bg-[#0050b3] text-white font-bold text-[14px] rounded-xl hover:bg-[#003a8c] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(0,80,179,0.3)]">
                  <Plus size={18} /> Thêm Khóa Mới
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#f4f7fe]">
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider pl-2">Tên Khóa Học</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider">Danh Mục</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider text-center">Cấp độ</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider text-center">BÀI HỌC/QUIZ</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider text-center">TRẠNG THÁI</th>
                      <th className="pb-3 text-[#a3aed1] text-[12px] font-bold uppercase tracking-wider text-center">CHỈNH SỬA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-8 text-[#a3aed1] font-medium"><div className="flex justify-center items-center gap-2"><Loader2 size={24} className="animate-spin text-[#0050b3]" /> Đang tải dữ liệu...</div></td></tr>
                    ) : courses.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-10 text-[#a3aed1] font-medium text-lg">Hệ thống chưa có dòng dữ liệu nào</td></tr>
                    ) : (
                      courses.map((course) => (
                        <tr key={course.id} className="border-b border-[#f4f7fe] last:border-0 hover:bg-[#f4f7fe]/50 transition-colors">
                          <td className="py-4 pl-2">
                             <span className="font-bold text-[#2b3674]">{course.title}</span>
                          </td>
                          <td className="py-4 text-[#2b3674] font-medium">
                            {course.category?.name ? (
                              <span className="bg-[#e6f7ff] text-[#0050b3] px-3 py-1 rounded-full text-[12px] font-bold">
                                {course.category.name}
                              </span>
                            ) : (
                              <span className="text-[#bfbfbf] text-[12px]">Chưa phân loại</span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                              course.level === 'Nâng cao' ? 'bg-red-50 text-red-600' :
                              course.level === 'Trung bình' ? 'bg-amber-50 text-amber-600' :
                              'bg-green-50 text-green-600'
                            }`}>
                              {course.level || 'Cơ bản'}
                            </span>
                          </td>
                          <td className="py-4 text-[#2b3674] font-bold text-center">
                             {course.lessons?.length || 0} Bài
                          </td>
                          <td className="py-4 text-center">
                            <span className="bg-[#52c41a]/10 text-[#52c41a] px-3 py-1 rounded-full text-[12px] font-bold">Hoạt động</span>
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleEditClick(course)}
                                className="w-8 h-8 flex items-center justify-center text-[#1890ff] hover:bg-[#e6f7ff] rounded-lg transition-colors">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCourse(course.id)}
                                className="w-8 h-8 flex items-center justify-center text-[#ff4d4f] hover:bg-[#fff1f0] rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- ADD/EDIT COURSE MODAL WITH STEPPER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09152b]/50 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[850px] mx-4 relative overflow-hidden flex flex-col max-h-[90vh]">
               
               <div className="bg-[#0050b3] p-5 flex justify-between items-center text-white shrink-0">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BookOpen size={20}/> 
                      {isEditMode ? 'Cập Nhật Khóa Học' : 'Biên Soạn Khóa Học Bồi Dưỡng'}
                    </h2>
                    <p className="text-blue-100 text-[13px] opacity-80 mt-1">
                      {isEditMode ? `Đang chỉnh sửa: ${formData.title}` : 'Cấu hình lộ trình học tập chuyên nghiệp'}
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24}/></button>
               </div>

               <div className="bg-white border-b px-8 py-6 shrink-0">
                  <div className="flex items-center justify-between max-w-[600px] mx-auto relative">
                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                     <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-[#0050b3] -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${(currentStep - 1) * 50}%` }}
                     ></div>

                     <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 1 ? 'bg-[#0050b3] text-white shadow-[0_0_15px_rgba(0,80,179,0.4)]' : 'bg-gray-100 text-gray-400'}`}>
                           <BookOpen size={18} />
                        </div>
                        <span className={`text-[12px] font-bold ${currentStep >= 1 ? 'text-[#0050b3]' : 'text-gray-400'}`}>Thông tin</span>
                     </div>

                     <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 2 ? 'bg-[#0050b3] text-white shadow-[0_0_15px_rgba(0,80,179,0.4)]' : 'bg-gray-100 text-gray-400'}`}>
                           <Video size={18} />
                        </div>
                        <span className={`text-[12px] font-bold ${currentStep >= 2 ? 'text-[#0050b3]' : 'text-gray-400'}`}>Bài giảng</span>
                     </div>

                     <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 3 ? 'bg-[#0050b3] text-white shadow-[0_0_15px_rgba(0,80,179,0.4)]' : 'bg-gray-100 text-gray-400'}`}>
                           <Award size={18} />
                        </div>
                        <span className={`text-[12px] font-bold ${currentStep >= 3 ? 'text-[#0050b3]' : 'text-gray-400'}`}>Kiểm tra</span>
                     </div>
                  </div>
               </div>

               <div className="p-8 overflow-y-auto flex-1 bg-[#f8f9fc]">
                  {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                          <h3 className="text-[16px] font-bold text-[#2b3674] mb-6 flex items-center gap-2">
                             <div className="w-1.5 h-6 bg-[#0050b3] rounded-full"></div>
                             1. Cấu hình thông tin cơ bản
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                             <div className="space-y-2">
                               <label className="text-[13px] font-bold text-[#a3aed1] ml-1 uppercase tracking-wider">Tên khóa học *</label>
                               <input 
                                 type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                 className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-[#0050b3] focus:bg-white bg-[#f9fbfd] transition-all font-medium text-[#2b3674]"
                                 placeholder="VD: Kỹ năng xử lý sự cố thiết bị"
                               />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <label className="text-[13px] font-bold text-[#a3aed1] ml-1 uppercase tracking-wider">Danh mục</label>
                                 <select className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-[#0050b3] focus:bg-white bg-[#f9fbfd] transition-all font-medium text-[#2b3674]" 
                                         value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="">Chọn lĩnh vực</option>
                                    {categories.map(cat => (
                                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                 </select>
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[13px] font-bold text-[#a3aed1] ml-1 uppercase tracking-wider">Cấp độ</label>
                                 <select className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-[#0050b3] focus:bg-white bg-[#f9fbfd] transition-all font-medium text-[#2b3674]" 
                                         value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                                    <option value="Cơ bản">Cơ bản</option>
                                    <option value="Trung bình">Trung bình</option>
                                    <option value="Nâng cao">Nâng cao</option>
                                 </select>
                               </div>
                             </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#a3aed1] ml-1 uppercase tracking-wider">Mục tiêu yêu cầu cần đạt (Mô tả)</label>
                            <textarea 
                               value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                               className="w-full border-2 border-gray-100 p-4 rounded-xl outline-none focus:border-[#0050b3] focus:bg-white bg-[#f9fbfd] transition-all h-[150px] resize-none font-medium text-[#2b3674]"
                               placeholder="Mô tả chi tiết nội dung và những gì học viên sẽ đạt được sau khóa học..."
                            ></textarea>
                          </div>
                       </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                             <h3 className="text-[16px] font-bold text-[#2b3674] flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-[#0050b3] rounded-full"></div>
                                2. Quản lý Bài giảng (Media & Text)
                             </h3>
                             <button onClick={addEmptyLesson} className="flex items-center gap-2 text-[13px] bg-[#0050b3] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#003a8c] transition-all shadow-md active:scale-95">
                                <Plus size={18}/> Thêm Bài Mới
                             </button>
                          </div>

                          {formData.lessons.length === 0 ? (
                             <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                  <Video size={32} />
                               </div>
                               <p className="text-gray-500 font-medium">Chưa có bài giảng nào được thêm.</p>
                               <p className="text-gray-400 text-[13px] mt-1">Nhấn "Thêm Bài Mới" để bắt đầu xây dựng nội dung.</p>
                             </div>
                          ) : (
                             <div className="grid grid-cols-1 gap-6">
                                {formData.lessons.map((lesson, idx) => (
                                   <div key={idx} className="border border-gray-100 rounded-2xl p-6 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative hover:shadow-md transition-shadow group">
                                      <button onClick={() => removeLesson(idx)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                         <Trash2 size={18}/>
                                      </button>
                                      
                                      <div className="mb-5">
                                        <label className="text-[11px] font-black text-[#a3aed1] uppercase tracking-widest block mb-2">Tiêu đề bài học {idx + 1}</label>
                                        <input 
                                          type="text" value={lesson.title} onChange={e => updateLesson(idx, 'title', e.target.value)}
                                          className="w-full text-[16px] font-bold text-[#2b3674] border-b-2 border-gray-50 pb-2 focus:border-[#0050b3] bg-transparent outline-none transition-all"
                                          placeholder="VD: Giới thiệu quy trình an toàn..."
                                        />
                                      </div>
                                      
                                      <div className="bg-[#f8f9fc] rounded-xl p-5 border border-gray-50 flex flex-col gap-4">
                                         {/* Content Type Tabs */}
                                         <div className="flex gap-2 border-b border-gray-100 pb-3">
                                            {['video', 'read', 'infographic'].map((type) => (
                                               <button
                                                  key={type}
                                                  onClick={() => updateLesson(idx, 'activeTab', type)}
                                                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                                                     lesson.activeTab === type 
                                                     ? 'bg-[#0050b3] text-white' 
                                                     : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                                  }`}
                                               >
                                                  {type === 'video' && <Video size={14} />}
                                                  {type === 'read' && <FileText size={14} />}
                                                  {type === 'infographic' && <Image size={14} />}
                                                  {type === 'video' ? 'Video' : type === 'read' ? 'Tài liệu' : 'Infographic'}
                                               </button>
                                            ))}
                                         </div>
                                         
                                         {/* Tab: Video */}
                                         {lesson.activeTab === 'video' && (
                                            <div className="animate-in fade-in duration-300">
                                               {lesson.uploading ? (
                                                 <div className="flex flex-col items-center justify-center py-6 gap-3 text-[#0050b3]">
                                                    <Loader2 className="animate-spin" size={32} />
                                                    <p className="font-bold text-[14px]">Đang tải video...</p>
                                                 </div>
                                               ) : lesson.videoUrl ? (
                                                  <div className="flex items-center gap-4 bg-green-50/50 p-4 border border-green-100 rounded-xl">
                                                     <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
                                                       <Check size={16} strokeWidth={3} />
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                        <p className="text-green-700 font-bold text-[13px]">Video đã sẵn sàng</p>
                                                        <p className="text-green-600/70 text-[11px] truncate">{lesson.videoUrl}</p>
                                                     </div>
                                                     <button onClick={() => updateLesson(idx, 'videoUrl', '')} className="text-red-500 text-[12px] font-bold">Xóa</button>
                                                  </div>
                                               ) : (
                                                 <label className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-white hover:border-[#0050b3] hover:bg-blue-50/30 transition-all">
                                                     <Plus className="text-[#0050b3] mb-1" size={20}/>
                                                     <p className="text-[12px] text-gray-500">Tải lên video bài học (.mp4)</p>
                                                     <input type="file" accept="video/*" className="hidden" 
                                                        onChange={(e) => handleVideoUpload(idx, e.target.files[0])} />
                                                 </label>
                                               )}
                                            </div>
                                         )}

                                         {/* Tab: Read */}
                                         {lesson.activeTab === 'read' && (
                                            <div className="animate-in fade-in duration-300 space-y-3">
                                               <div className="flex justify-between items-center bg-[#e6f7ff] p-3 rounded-xl border border-blue-100 shadow-sm">
                                                  <div className="flex items-center gap-2 text-[#0050b3]">
                                                     <Sparkles size={18} className="animate-pulse" />
                                                     <span className="text-[13px] font-bold">Trợ lý AI đang sẵn sàng</span>
                                                  </div>
                                                  <button 
                                                     onClick={() => handleAiSummarize(idx)}
                                                     disabled={lesson.isSummarizing}
                                                     className="bg-white text-[#0050b3] px-4 py-1.5 rounded-lg text-[12px] font-bold border border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50"
                                                  >
                                                     {lesson.isSummarizing ? (
                                                        <><Loader2 size={14} className="animate-spin" /> Đang tóm tắt...</>
                                                     ) : (
                                                        <><Sparkles size={14} /> Tóm tắt bằng AI</>
                                                     )}
                                                  </button>
                                               </div>
                                               <textarea 
                                                  value={lesson.readingText || ''}
                                                  onChange={e => updateLesson(idx, 'readingText', e.target.value)}
                                                  className="w-full bg-white border border-gray-100 p-4 rounded-xl outline-none focus:border-[#0050b3] font-medium text-[14px] text-[#2b3674] h-[150px] resize-none transition-all focus:shadow-md"
                                                  placeholder="Nhập nội dung văn bản hướng dẫn học tập tại đây..."
                                               ></textarea>
                                            </div>
                                         )}

                                         {/* Tab: Infographic */}
                                         {lesson.activeTab === 'infographic' && (
                                            <div className="animate-in fade-in duration-300">
                                               {lesson.uploading ? (
                                                 <div className="flex flex-col items-center justify-center py-6 gap-3 text-[#0050b3]">
                                                    <Loader2 className="animate-spin" size={32} />
                                                    <p className="font-bold text-[14px]">Đang tải ảnh...</p>
                                                 </div>
                                               ) : lesson.infographicUrl ? (
                                                  <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video group">
                                                     <img src={lesson.infographicUrl} alt="Infographic" className="w-full h-full object-cover" />
                                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button onClick={() => updateLesson(idx, 'infographicUrl', '')} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-[13px] shadow-lg">Xóa ảnh này</button>
                                                     </div>
                                                  </div>
                                               ) : (
                                                 <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-white hover:border-[#0050b3] hover:bg-blue-50/30 transition-all">
                                                     <UploadCloud className="text-[#0050b3] mb-2" size={28}/>
                                                     <p className="text-[12px] text-gray-400">Tải lên sơ đồ / Infographic (JPG, PNG)</p>
                                                     <input type="file" accept="image/*" className="hidden" 
                                                        onChange={(e) => handleInfographicUpload(idx, e.target.files[0])} />
                                                 </label>
                                               )}
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                  )}

                  {/* STEP 3: QUIZ BUILDER */}
                  {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-8">
                             <div>
                                <h3 className="text-[18px] font-bold text-[#2b3674] flex items-center gap-2">
                                   <MessageSquare size={20} className="text-[#0050b3]"/>
                                   3. Cơ sở dữ liệu Câu hỏi
                                </h3>
                                <p className="text-[#a3aed1] text-[13px] mt-1">Thiết lập các câu hỏi đánh giá kiến thức sau khóa học</p>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                  onClick={handleAiGenerateQuestions}
                                  disabled={isGeneratingQuestions}
                                  className="flex items-center gap-2 text-[13px] bg-gradient-to-r from-purple-50 to-blue-50 text-[#6f42c1] font-bold px-4 py-2 rounded-xl hover:from-purple-100 hover:to-blue-100 border border-purple-100 transition-all shadow-sm disabled:opacity-50"
                                >
                                   {isGeneratingQuestions ? (
                                      <><Loader2 size={18} className="animate-spin" /> Đang tạo...</>
                                   ) : (
                                      <><Sparkles size={18}/> AI gợi ý câu hỏi</>
                                   )}
                                </button>
                                <button onClick={themCauHoi} className="flex items-center gap-2 text-[13px] bg-white text-[#0050b3] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all shadow-sm active:scale-95">
                                   <Plus size={18}/> Thêm câu hỏi mới
                                </button>
                             </div>
                          </div>

                          {formData.cauHois.length === 0 ? (
                             <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                  <MessageSquare size={32} />
                               </div>
                               <p className="text-gray-500 font-bold">Chưa có câu hỏi nào</p>
                               <p className="text-gray-400 text-[13px] mt-1">Bắt đầu bằng cách thêm câu hỏi kiểm tra đầu tiên</p>
                             </div>
                          ) : (
                             <div className="space-y-8">
                                {formData.cauHois.map((ch, chIdx) => (
                                   <div key={chIdx} className="relative group bg-white">
                                      {/* Question Header */}
                                      <div className="flex items-start gap-4 mb-4">
                                         <div className="w-8 h-8 bg-[#0050b3] text-white rounded-lg flex items-center justify-center font-bold shrink-0 mt-1">
                                            {chIdx + 1}
                                         </div>
                                         <div className="flex-1 space-y-4">
                                            <div className="relative">
                                               <textarea
                                                  value={ch.text}
                                                  onChange={e => capNhatCauHoi(chIdx, 'text', e.target.value)}
                                                  className="w-full bg-[#f8f9fc] border border-gray-200 p-3 rounded-xl outline-none focus:border-[#0050b3] focus:bg-white font-medium text-[15px] text-[#2b3674] min-h-[40px] resize-none transition-all"
                                                  placeholder="Nhập nội dung câu hỏi tại đây..."
                                                  rows={1}
                                               />
                                               <button onClick={() => xoaCauHoi(chIdx)} className="absolute -right-10 top-2 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                  <Trash2 size={18}/>
                                               </button>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                                               <div className="flex items-center gap-3">
                                                  <span className="text-[12px] font-bold text-[#a3aed1] uppercase tracking-wider">Loại:</span>
                                                  <select 
                                                     className="bg-[#f0f5ff] text-[#0050b3] font-bold text-[12px] px-3 py-1.5 rounded-lg border-0 outline-none focus:ring-2 ring-[#0050b3]/20"
                                                     value={ch.type || 'SINGLE_CHOICE'}
                                                     onChange={e => capNhatCauHoi(chIdx, 'type', e.target.value)}
                                                  >
                                                     <option value="SINGLE_CHOICE">Trắc nghiệm (1 ý)</option>
                                                     <option value="MULTIPLE_CHOICE">Chọn nhiều ý</option>
                                                     <option value="TRUE_FALSE">Đúng / Sai</option>
                                                  </select>
                                               </div>

                                               <div className="flex items-center gap-3">
                                                  <span className="text-[12px] font-bold text-[#a3aed1] uppercase tracking-wider">Độ khó:</span>
                                                  <div className="flex gap-2">
                                                     {['Dễ', 'Trung Bình', 'Khó'].map(level => (
                                                        <button
                                                           key={level}
                                                           onClick={() => capNhatCauHoi(chIdx, 'difficulty', level)}
                                                           className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[12px] font-bold transition-all border ${
                                                              ch.difficulty === level 
                                                              ? 'bg-[#0050b3] text-white border-[#0050b3]' 
                                                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 shadow-sm'
                                                           }`}
                                                        >
                                                           <div className={`w-2 h-2 rounded-full ${
                                                              level === 'Dễ' ? 'bg-green-500' :
                                                              level === 'Trung Bình' ? 'bg-amber-500' : 'bg-red-500'
                                                           } ${ch.difficulty === level ? 'ring-2 ring-white/50' : ''}`} />
                                                           {level}
                                                        </button>
                                                     ))}
                                                  </div>
                                               </div>
                                                <div className="flex items-center gap-3">
                                                   <span className="text-[12px] font-bold text-[#a3aed1] uppercase tracking-wider">Bài học:</span>
                                                   <select 
                                                      className="bg-[#f0f5ff] text-[#0050b3] font-bold text-[12px] px-3 py-1.5 rounded-lg border-0 outline-none focus:ring-2 ring-[#0050b3]/20"
                                                      value={ch.lessonIndex ?? 0}
                                                      onChange={e => capNhatCauHoi(chIdx, 'lessonIndex', parseInt(e.target.value))}
                                                   >
                                                      {formData.lessons.length === 0 ? (
                                                         <option value="0">Chưa có bài học</option>
                                                      ) : (
                                                         formData.lessons.map((ls, idx) => (
                                                            <option key={idx} value={idx}>Bài ${idx + 1}: ${ls.title || 'Không tên'}</option>
                                                         ))
                                                      )}
                                                   </select>
                                                </div>
                                            </div>
                                         </div>
                                      </div>

                                      {/* Options Grid */}
                                      <div className="pl-12 grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                         {ch.options.map((da, daIdx) => (
                                            <div key={daIdx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${da.isCorrect ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-[#f9fbfd] hover:bg-white hover:border-gray-300'}`}>
                                               <button
                                                  onClick={() => capNhatDapAn(chIdx, daIdx, 'isCorrect', true)}
                                                  disabled={ch.type === 'TRUE_FALSE'}
                                                  className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-all ${
                                                     ch.type === 'MULTIPLE_CHOICE' ? 'rounded-md' : 'rounded-full'
                                                  } ${da.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white'}`}
                                               >
                                                  {da.isCorrect && <Check size={12} strokeWidth={4}/>}
                                               </button>
                                               <input
                                                  type="text"
                                                  value={da.text}
                                                  onChange={e => capNhatDapAn(chIdx, daIdx, 'text', e.target.value)}
                                                  className="flex-1 bg-transparent border-0 outline-none text-[14px] font-medium text-[#2b3674] placeholder:text-gray-300"
                                                  placeholder={`Phương án ${String.fromCharCode(65 + daIdx)}...`}
                                               />
                                            </div>
                                         ))}
                                      </div>
                                      
                                      {/* Separator */}
                                      {chIdx < formData.cauHois.length - 1 && (
                                        <div className="h-px bg-gray-100 w-full my-10"></div>
                                      )}
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                  )}
               </div>

               <div className="p-6 border-t bg-white shrink-0 flex justify-between items-center rounded-b-2xl px-10">
                  <div className="text-[#a3aed1] text-[13px] font-medium uppercase tracking-widest">
                     Bước {currentStep} / 3
                  </div>
                  
                  <div className="flex gap-4">
                     {currentStep > 1 && (
                        <button 
                           onClick={() => setCurrentStep(prev => prev - 1)}
                           className="px-6 py-2.5 text-[#2b3674] font-bold rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                           <ArrowLeft size={18} /> Quay lại
                        </button>
                     )}

                     {currentStep < 3 ? (
                        <button 
                           onClick={() => {
                              if (currentStep === 1 && !formData.title) {
                                 alert("Vui lòng nhập tên khóa học!");
                                 return;
                              }
                              setCurrentStep(prev => prev + 1);
                           }}
                           className="px-8 py-2.5 bg-[#0050b3] text-white font-bold rounded-xl shadow-lg hover:bg-[#003a8c] transition-all flex items-center gap-2 active:scale-95"
                        >
                           Tiếp tục
                        </button>
                     ) : (
                        <button 
                           disabled={savingCourse} 
                           onClick={handleSaveCourse} 
                           className="px-8 py-2.5 bg-[#52c41a] text-white font-black rounded-xl shadow-lg hover:bg-[#389e0d] transition-all flex items-center gap-2 active:scale-95 disabled:bg-gray-300"
                        >
                           {savingCourse ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>}
                           HOÀN TẤT & LƯU KHÓA HỌC
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09152b]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] mx-4 overflow-hidden">
            <div className="bg-[#0050b3] p-5 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <LayoutDashboard size={20}/> 
                  {isCatEditMode ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục Mới'}
                </h2>
                <p className="text-blue-100 text-[13px] opacity-80 mt-1">Phân loại lĩnh vực đào tạo cho công nhân</p>
              </div>
              <button onClick={() => setIsCatModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={22}/></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#a3aed1] mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={e => setCatForm({...catForm, name: e.target.value})}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-[#0050b3] bg-[#f9fbfd] font-medium"
                  placeholder="VD: Kỹ Năng Số, An Toàn Lao Động..."
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#a3aed1] mb-1">Mô Tả</label>
                <textarea
                  value={catForm.description}
                  onChange={e => setCatForm({...catForm, description: e.target.value})}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-[#0050b3] bg-[#f9fbfd] h-[80px] resize-none"
                  placeholder="Mô tả ngắn gọn về lĩnh vực này..."
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#a3aed1] mb-1">Danh Mục Cha (nếu là Danh mục con)</label>
                <select
                  value={catForm.parentCategoryId}
                  onChange={e => setCatForm({...catForm, parentCategoryId: e.target.value})}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-[#0050b3] bg-[#f9fbfd]"
                >
                  <option value="">— Không có (Danh mục gốc) —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 border-t bg-[#f9fbfd] flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setIsCatModalOpen(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                Hủy
              </button>
              <button
                disabled={savingCat}
                onClick={handleSaveCategory}
                className="px-6 py-2 bg-[#0050b3] text-white font-bold rounded-lg shadow-md hover:bg-[#003a8c] transition-colors flex items-center gap-2"
              >
                {savingCat ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>}
                Lưu Danh Mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
