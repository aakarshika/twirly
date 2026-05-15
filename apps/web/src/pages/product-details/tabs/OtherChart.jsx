import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const ACCENT_KEYS = ['red', 'blue', 'purple', 'mustard'];

const OtherChart = ({ allitems = [], totalVotes = 0 }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const data = allitems.map((si, i) => ({
    name: si.items?.name ?? `Item ${i + 1}`,
    pct: totalVotes > 0
      ? Math.round((si.items?.votes?.length ?? 0) / totalVotes * 100)
      : 0,
    fill: t[ACCENT_KEYS[i % ACCENT_KEYS.length]],
  }));

  return (
    <ResponsiveContainer width="100%" height={data.length * 36 + 16}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={96}
          tick={{ fontFamily: '"Fraunces", serif', fontSize: 12, fill: t.ink }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={v => [`${v}%`, 'vote share']}
          contentStyle={{
            fontFamily: '"Fraunces", serif',
            fontSize: 12,
            background: t.bg,
            border: `1px solid ${t.ink}25`,
            borderRadius: 6,
          }}
        />
        <Bar dataKey="pct" radius={3}>
          {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export { OtherChart };
export default OtherChart;
