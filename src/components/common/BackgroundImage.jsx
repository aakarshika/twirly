import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Circle, 
  Square, 
  Triangle,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
const BackgroundImage = () => {
  // Array of icons to display
  const icons = [
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Circle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Square, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Star, color: 'rgba(234, 234, 234, 0.6)' },
    { Icon: Heart, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Triangle, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sparkles, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Moon, color: 'rgba(230, 230, 230, 0.6)' },
    { Icon: Sun, color: 'rgba(230, 230, 230, 0.6)' },
  ];

  const { currentTheme } = useTheme();
  // Calculate grid positions
  const generateGridIcons = () => {
    const numCols = 8; // Number of columns in the grid
    const numRows = Math.ceil(icons.length / numCols); // Calculate rows needed
    
    return icons.map(({ Icon, color }, index) => {
      const col = index % numCols;
      const row = Math.floor(index / numCols);
      
      // Calculate position with some padding
      const x = (col * (100 / (numCols - 1)) + (5 * (row%2 == 1))); // Distribute across width
      const y = (row * (100 / (numRows - 1)) + (5 * (col%2 == 0))); // Distribute across height
      
      // Vary the size slightly for visual interest
      const size = Math.random() * 15 + 25; // Sizes: 20, 30, or 40
      
      // Alternate rotation directions for visual interest
      const rotation = (index % 2 === 0 ? 15 : -15);
      
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: ['Light', 'Sunset', 'Ocean', 'Forest'].includes(currentTheme.name) ? 1 : 0.1 }}
          transition={{
            duration: 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${rotation}deg)`,
            color: color,
          }}
        >
          <Icon size={size} />
        </motion.div>
      );
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:   ['Light', 'Sunset', 'Ocean', 'Forest'].includes(currentTheme.name) ? 
        'linear-gradient(135deg,rgb(237, 237, 251) 0%,rgb(251, 253, 239) 50%,rgb(230, 251, 250) 100%)' 
        : 'linear-gradient(135deg,rgb(47, 47, 81) 0%,rgb(26, 50, 89) 50%,rgb(86, 53, 127) 100%)',
        overflow: 'hidden',
        zIndex: 0, // Ensure background stays behind all content
      }}
    >
      {generateGridIcons()}
    </div>
  );
};

export default BackgroundImage; 