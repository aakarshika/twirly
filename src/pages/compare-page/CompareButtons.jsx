import { Heart, Share, ThumbsUp } from 'lucide-react';
import React from 'react';

const Heading = ({ totalVotes }) => (
  <div className="flex text-sm flex-row justify-between gap-2 p-2 bg-white">
    <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2">
      <span className=" inline-block mr-2" ><Heart size={20} /></span>
      <span className="font-semibold">Likes</span>
    </div>
    <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2">
      <span className=" inline-block mr-2" ><ThumbsUp size={20} /></span>
      <span className="font-semibold">{totalVotes} Votes</span>
    </div>
    <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2">
      <span className=" inline-block mr-2" ><Share size={20} /></span>
      <span className="font-semibold">Share</span>
    </div>
  </div>
);

export default Heading; 