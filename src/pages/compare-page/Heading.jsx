import React from 'react';
import { getPublicUrl } from '../../lib/utils';
import Avatar from '../../components/common/Avatar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Heading = ({ setData }) => {
  const navigate = useNavigate(); 
  const question = (setData?.name).endsWith('?') ? setData?.name.slice(0, -1) : setData?.name;
  return (
  <div className="flex flex-col mt-8 gap-2 p-4">
    <div className="flex gap-2"  onClick={() => navigate(`/user/${setData?.user_name}`)}>
      {/* <span className="w-4 h-4 rounded-full bg-green-300 inline-block" /> */}
      <Avatar
                            profileImageUrl={setData?.user_profile_image_url ? getPublicUrl(setData?.user_profile_image_url) : null}
                            displayName={setData?.user_name}
                            size="sm"
                            className="w-4 h-4 rounded-full bg-green-300 inline-block mr-2"
                        />
      <span className="font-semibold">{setData?.user_name}</span>
    </div>
    <div className="flex items-center gap-2">
      <motion.span initial={{ opacity: 0, scale: 0, rotate: 180 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} 
      transition={{ duration: 0.5 }} className="ml-2 text-2xl">?</motion.span>
      <span className="ml-2 font-medium">{question}</span>
      </div>
  </div>
)};

export default Heading; 