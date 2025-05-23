import { useTheme } from '../../../contexts/ThemeContext';
import TrendingCard from './TrendingCard';

const TrendingCardCommon = ({set, from}) => {
  const { currentTheme } = useTheme();

  return (
    <div>
    <div className="sm:hidden">
    <div
      key={set.id}
      onClick={() => handleSetClick(set)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
    > 
      <TrendingCard set={set} from={from} />
    </div>
    </div>

    <div className="hidden sm:block max-w-2xl mx-auto" style={{
      marginLeft: 'auto',
      marginRight: 'auto',
      padding: '0 1rem'
    }}>
    <div
      key={set.id}
      onClick={() => handleSetClick(set)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      style={{
        borderColor: currentTheme.colors.border,
        border: '2px solid ' + currentTheme.colors.border,
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}
    >
      <TrendingCard set={set} from={from} />
    </div>
    </div>
    </div>
    
  )
};

export default TrendingCardCommon; 