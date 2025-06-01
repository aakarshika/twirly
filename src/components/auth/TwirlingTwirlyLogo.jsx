import { motion } from 'framer-motion';
export default function TwirlingTwirlyLogo() {
    return (
        <div className="flex items-center justify-center">
      <motion.div 
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 15, ease: 'linear', repeat: Infinity }}
      >
      <img src={'/public_logo_transparent.png'} alt="Twirly Logo" 
           className="w-44 h-44 transition-transform duration-300" />
  
      </motion.div>
      </div>
    );
  };
