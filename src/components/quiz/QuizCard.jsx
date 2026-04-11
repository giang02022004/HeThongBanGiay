import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

const QuizCard = ({ quiz, onStart }) => {
  return (
    <Card className="flex flex-col h-full bg-white transition-all duration-300">
      <div className="flex-1">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold mb-4 uppercase tracking-widest">
          {quiz.category || 'General'}
        </div>
        <h3 className="text-3xl font-extrabold mb-3 text-gray-900 leading-snug tracking-tight">{quiz.title}</h3>
        <p className="text-gray-500 mb-8 font-medium leading-relaxed line-clamp-3">{quiz.description}</p>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-gray-600 font-bold">
            <Clock size={20} strokeWidth={2} className="text-primary" />
            <span>{quiz.timeLimit}m</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 font-bold">
            < BookOpen size={20} strokeWidth={2} className="text-secondary" />
            <span>{quiz.questions?.length || 0}Q</span>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => onStart(quiz.id)} 
        className="w-full flex items-center justify-center gap-2 group"
      >
        START LEARNING
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </Card>
  );
};

export default QuizCard;
