import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import Avatar from '@components/common/Avatar';
import { getPublicUrl } from '@utils/utils';

const EASE = [0.16, 1, 0.3, 1];

const Heading = ({ setData }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const navigate = useNavigate();

  const question = setData?.name?.endsWith('?')
    ? setData.name.slice(0, -1)
    : (setData?.name ?? '');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="px-4 pt-4 pb-2"
    >
      {/* Creator + categories row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Avatar
          profileImageUrl={setData?.user_profile_image_url ? getPublicUrl(setData.user_profile_image_url) : null}
          displayName={setData?.user_name}
          size="sm"
          onClick={() => navigate(`/user/${setData?.user_name}`)}
        />
        <button
          onClick={() => navigate(`/user/${setData?.user_name}`)}
          style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color: t.ink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {setData?.user_name}
        </button>

        <div className="flex gap-1 ml-auto flex-wrap">
          {setData?.set_categories?.map((cat, i) => (
            <span
              key={i}
              style={{
                fontFamily: '"Caveat", cursive',
                fontSize: 12,
                color: t.mustard,
                background: `${t.mustard}18`,
                border: `1px solid ${t.mustard}55`,
                borderRadius: 20,
                padding: '1px 8px',
              }}
            >
              {cat?.categories?.name}
            </span>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="flex items-start gap-2">
        <motion.span
          initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: 24,
            color: t.red,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ?
        </motion.span>
        <h2 style={{
          fontFamily: '"DM Serif Display", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(17px, 4vw, 22px)',
          lineHeight: 1.2,
          color: t.ink,
          margin: 0,
        }}>
          {question}
        </h2>
      </div>
    </motion.div>
  );
};

export default Heading;
