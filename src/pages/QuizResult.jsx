import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, ArrowLeft, RotateCcw, 
  Home, Trophy, Star, ChevronRight, Award, FileText, Search,
  Check
} from 'lucide-react';

const QuizResult = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const score = location.state?.score || 0;
  const courseTitle = location.state?.courseTitle || 'Khóa học';
  const answers = location.state?.answers || {};
  const shuffledQuestions = location.state?.shuffledQuestions || [];
  
  const PASS_THRESHOLD = 80;
  const isPassed = score >= PASS_THRESHOLD;

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-[14px] flex flex-col items-center py-12 px-4">
      
      <div className="w-full max-w-[900px] bg-white border border-[#e0e0e0] shadow-sm flex flex-col animate-in fade-in duration-700">
        
        {/* Header Section with Trophy */}
        <div className="py-12 border-b border-[#eeeeee] flex flex-col items-center">
          <div className="mb-6 text-[#008080]">
            <Trophy size={80} strokeWidth={1.5} />
          </div>
          
          <h2 className="text-[22px] font-bold text-[#333] uppercase tracking-[0.1em] mb-8">
             CHÚC MỪNG BẠN ĐÃ ĐẾN CUỐI KHÓA HỌC
          </h2>

          <div className="flex flex-col items-center gap-2">
            <h1 className={`text-[24px] font-bold uppercase ${isPassed ? 'text-[#008080]' : 'text-[#ff4d4f]'}`}>
              {isPassed ? 'BẠN ĐÃ ĐẠT MÔN HỌC' : 'BẠN CHƯA ĐẠT MÔN HỌC'}
            </h1>
            <div className="flex items-center gap-2 text-[20px] font-medium text-[#333]">
              ĐIỂM CỦA BẠN: <span className="font-bold text-[28px]">{score}/100</span>
            </div>
          </div>
        </div>

        {/* Course Overview Table - NA NA THEO ANH */}
        <div className="p-8 md:p-12">
          <div className="mb-10">
            <h3 className="text-[14px] font-bold text-[#333] mb-4">Tổng quan điểm khóa học</h3>
            <div className="border border-[#d9d9d9]">
              <div className="flex bg-[#f0f9f9]">
                <div className="w-1/3 px-4 py-3 border-r border-[#d9d9d9] font-medium text-[#595959] text-[13px]">Điểm</div>
                <div className="flex-1 px-4 py-3 text-[13px] font-bold text-[#333]">{score}/100</div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-[14px] font-bold text-[#333] mb-4">Chi tiết kết quả</h3>
            <div className="w-full border border-[#d9d9d9] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f9f9] text-[#595959] text-[12px] uppercase">
                    <th className="px-4 py-3 font-bold border-r border-[#d9d9d9]">Tên tiêu chí</th>
                    <th className="px-4 py-3 font-bold border-r border-[#d9d9d9] text-center w-24">Điểm (/100)</th>
                    <th className="px-4 py-3 font-bold text-center w-24">Đạt</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#333]">
                  <tr className="border-t border-[#d9d9d9]">
                    <td className="px-4 py-4 border-r border-[#d9d9d9] font-medium">BÀI TẬP TRẮC NGHIỆM CUỐI KHÓA</td>
                    <td className="px-4 py-4 border-r border-[#d9d9d9] text-center font-bold">{score}</td>
                    <td className="px-4 py-4 flex justify-center items-center">
                      {isPassed ? (
                        <Check size={18} className="text-[#008080] font-bold" strokeWidth={3} />
                      ) : (
                        <XCircle size={18} className="text-[#ff4d4f]" />
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-[#d9d9d9] bg-[#fafafa]">
                    <td className="px-4 py-4 border-r border-[#d9d9d9] font-medium">TỔNG KẾT KHÓA HỌC: {courseTitle}</td>
                    <td className="px-4 py-4 border-r border-[#d9d9d9] text-center font-bold">{score}</td>
                    <td className="px-4 py-4 flex justify-center items-center">
                      {isPassed ? (
                        <Check size={18} className="text-[#008080]" strokeWidth={3} />
                      ) : (
                        <XCircle size={18} className="text-[#ff4d4f]" />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 pt-6">
            <button 
              onClick={() => navigate(`/quiz/${id}`, { 
                state: { 
                  mode: 'review', 
                  answers, 
                  shuffledQuestions,
                  score: score
                } 
              })}
              className="px-8 py-3.5 border-2 border-[#008080] text-[#008080] font-bold text-[14px] hover:bg-[#008080] hover:text-white transition-all flex items-center gap-2 rounded-sm"
            >
              <Search size={18} />
              XEM LẠI BÀI LÀM
            </button>
            
            <button 
              onClick={() => navigate(`/quiz/${id}`)}
              className="px-8 py-3.5 bg-[#008080] text-white font-bold text-[14px] hover:bg-[#006666] transition-all flex items-center gap-2 rounded-sm"
            >
              <RotateCcw size={18} />
              LÀM LẠI BÀI THI
            </button>

            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3.5 bg-[#595959] text-white font-bold text-[14px] hover:bg-[#333] transition-all flex items-center gap-2 rounded-sm"
            >
              <Home size={18} />
              TRANG CHỦ
            </button>
          </div>
        </div>

        {/* Subdued Footer */}
        <div className="py-4 bg-[#f9f9f9] text-center border-t border-[#eeeeee]">
           <p className="text-[11px] text-[#999] uppercase tracking-wider font-medium">
              KẾT QUẢ ĐÃ ĐƯỢC GHI NHẬN VÀO HỆ THỐNG ĐÀO TẠO • {new Date().toLocaleDateString('vi-VN')}
           </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
