import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComparisonHeader = ({ nextPollId }) => {
  const navigate = useNavigate();

  const handleNextPoll = () => {
    if (nextPollId) {
      navigate(`/comparison/${nextPollId}`);
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} />
        Back
      </button>
      
      {nextPollId && (
        <button
          onClick={handleNextPoll}
          className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
        >
          Next Poll
          <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
};

export default ComparisonHeader; 