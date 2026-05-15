import { useState, useEffect } from 'react';
import { Check, Trash2, Pencil } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const PLACEHOLDERS = [
  'how bright the screen is',
  'how fast the processor is',
  'how much battery it has',
  'whether the camera is good',
  'how much it costs',
  'your favorite feature',
  'what you care about most',
  'the thing that seals the deal',
];

const AspectForm = ({
  aspect,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  aspectData,
  setAspectData,
}) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    if (!isEditing) return;
    const iv = setInterval(
      () => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length),
      3000,
    );
    return () => clearInterval(iv);
  }, [isEditing]);

  if (!isEditing) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: t.bgDeep,
          border: `1.5px solid ${t.ink}15`,
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 14,
            color: t.ink,
            flex: 1,
          }}
        >
          {aspect.metric_name}
        </span>
        <button
          onClick={onEdit}
          aria-label="Edit aspect"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: t.ink,
            opacity: 0.35,
            display: 'flex',
            alignItems: 'center',
            minHeight: 36,
            minWidth: 36,
            justifyContent: 'center',
          }}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete aspect"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: t.red,
            opacity: 0.65,
            display: 'flex',
            alignItems: 'center',
            minHeight: 36,
            minWidth: 36,
            justifyContent: 'center',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  }

  const canSave = aspectData.metric_name?.trim();

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input
        type="text"
        autoFocus
        value={aspectData.metric_name}
        onChange={e => setAspectData(prev => ({ ...prev, metric_name: e.target.value }))}
        onKeyDown={e => { if (e.key === 'Enter' && canSave) onSave(); }}
        placeholder={PLACEHOLDERS[placeholderIdx]}
        style={{
          flex: 1,
          fontFamily: '"Fraunces", serif',
          fontSize: 14,
          color: t.ink,
          background: t.bgDeep,
          border: `1.5px solid ${t.ink}28`,
          borderRadius: 6,
          padding: '8px 12px',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = `${t.ink}55`; }}
        onBlur={e => { e.target.style.borderColor = `${t.ink}28`; }}
      />
      <button
        onClick={onSave}
        disabled={!canSave}
        aria-label="Save aspect"
        style={{
          background: canSave ? t.ink : `${t.ink}30`,
          color: t.bg,
          border: 'none',
          borderRadius: 6,
          padding: '8px 14px',
          cursor: canSave ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
          minHeight: 36,
          minWidth: 36,
        }}
      >
        <Check size={15} />
      </button>
    </div>
  );
};

export default AspectForm;
