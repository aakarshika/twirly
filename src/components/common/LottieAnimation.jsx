import React from 'react';
import Lottie from 'lottie-react';
import { useTheme } from '../../contexts/ThemeContext';

const LottieAnimation = ({
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  style = {},
  speed = 1,
  height,
  width,
  onComplete,
  onLoopComplete,
  onEnterFrame,
  onSegmentStart,
  onDestroy,
  rendererSettings = {
    preserveAspectRatio: 'xMidYMid slice'
  }
}) => {
  const { currentTheme } = useTheme();

  const defaultStyle = {
    width: width || '100%',
    height: height || '100%',
    ...style
  };

  return (
    <div className={className} style={defaultStyle}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        rendererSettings={rendererSettings}
        onComplete={onComplete}
        onLoopComplete={onLoopComplete}
        onEnterFrame={onEnterFrame}
        onSegmentStart={onSegmentStart}
        onDestroy={onDestroy}
      />
    </div>
  );
};

export default LottieAnimation; 