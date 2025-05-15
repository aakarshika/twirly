
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

    <div className="hidden sm:block" style={{
      maxWidth: '1000px',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: '10px',
      paddingRight: '10px'
    }}>
    <div
      key={set.id}
      onClick={() => handleSetClick(set)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      style={{
        borderColor: currentTheme.colors.border,
        border: '2px solid ' + currentTheme.colors.border
      }}
    >
      <TrendingCard set={set} from={from} />
    </div>
    </div>
    </div>
    
  )
};

export default TrendingCardCommon; 