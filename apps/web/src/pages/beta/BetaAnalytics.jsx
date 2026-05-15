import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Layers, Zap } from 'lucide-react';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { useBetaTesting } from '../../contexts/BetaTestingContext';

const EASE = [0.16, 1, 0.3, 1];

// Stub data — replace with real analytics endpoint when available
const STUB_DATA = {
  userActions: [
    { time: '00:00', actions: 10 },
    { time: '04:00', actions: 5 },
    { time: '08:00', actions: 20 },
    { time: '12:00', actions: 30 },
    { time: '16:00', actions: 25 },
    { time: '20:00', actions: 15 },
  ],
  errorRates: [
    { time: '00:00', errors: 2 },
    { time: '04:00', errors: 1 },
    { time: '08:00', errors: 3 },
    { time: '12:00', errors: 4 },
    { time: '16:00', errors: 2 },
    { time: '20:00', errors: 1 },
  ],
  featureUsage: [
    { name: 'Comparisons', value: 40 },
    { name: 'Votes', value: 30 },
    { name: 'Reviews', value: 20 },
    { name: 'Profile', value: 10 },
  ],
  userEngagement: [
    { time: '00:00', engagement: 15 },
    { time: '04:00', engagement: 10 },
    { time: '08:00', engagement: 25 },
    { time: '12:00', engagement: 35 },
    { time: '16:00', engagement: 30 },
    { time: '20:00', engagement: 20 },
  ],
};

const chartAxisProps = t => ({
  tick: { fontFamily: '"Fraunces", serif', fontSize: 10, fill: t.ink, fillOpacity: 0.55 },
  axisLine: false,
  tickLine: false,
});

const tooltipStyle = t => ({
  contentStyle: {
    background: t.bg,
    border: `1.5px solid ${t.ink}`,
    borderRadius: 6,
    fontFamily: '"Fraunces", serif',
    fontSize: 13,
    color: t.ink,
    boxShadow: 'none',
  },
  cursor: { stroke: `${t.ink}18` },
});

const SectionHeader = ({ icon: Icon, title, accent }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
    <Icon size={14} style={{ color: accent }} strokeWidth={2} />
    <h2
      style={{
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        fontSize: 20,
        color: 'inherit',
        margin: 0,
      }}
    >
      {title}
    </h2>
  </div>
);

const ChartShell = ({ children, t }) => (
  <div
    style={{
      background: t.bgDeep,
      border: `1.5px solid ${t.ink}15`,
      borderRadius: 8,
      padding: '16px 8px 8px',
      height: 220,
    }}
  >
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

const BetaAnalytics = () => {
  const { isBetaMode } = useBetaTesting();
  const { themeId } = useTheme();
  const t = themes[themeId];

  const pieColors = useMemo(
    () => [t.red, t.blue, t.purple, t.mustard],
    [t.red, t.blue, t.purple, t.mustard],
  );

  if (!isBetaMode) {
    return (
      <div
        style={{
          background: t.bg,
          color: t.ink,
          minHeight: '100vh',
          fontFamily: '"Fraunces", serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ opacity: 0.5, fontSize: 15 }}>Beta mode is not enabled.</p>
      </div>
    );
  }

  const axis = chartAxisProps(t);
  const tt = tooltipStyle(t);

  return (
    <div
      style={{
        background: t.bg,
        color: t.ink,
        minHeight: '100vh',
        fontFamily: '"Fraunces", serif',
      }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      <div className="relative z-10 px-5 sm:px-10 pt-24 pb-16 max-w-screen-xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ marginBottom: 32 }}
        >
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 18,
              color: t.ink,
              opacity: 0.5,
              marginBottom: 4,
            }}
          >
            simulated — wire real endpoint when ready
          </p>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(32px, 7vw, 52px)',
              lineHeight: 0.96,
              color: t.ink,
              margin: 0,
            }}
          >
            Analytics
          </h1>
        </motion.div>

        {/* User Actions */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
          style={{ marginBottom: 36 }}
        >
          <SectionHeader icon={TrendingUp} title="User actions" accent={t.blue} />
          <ChartShell t={t}>
            <LineChart data={STUB_DATA.userActions} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${t.ink}12`} vertical={false} />
              <XAxis dataKey="time" {...axis} />
              <YAxis {...axis} width={32} />
              <Tooltip {...tt} formatter={v => [v, 'actions']} />
              <Line
                type="monotone"
                dataKey="actions"
                stroke={t.blue}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: t.blue, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartShell>
        </motion.section>

        {/* Error Rates */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          style={{ marginBottom: 36 }}
        >
          <SectionHeader icon={AlertTriangle} title="Error rates" accent={t.red} />
          <ChartShell t={t}>
            <LineChart data={STUB_DATA.errorRates} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${t.ink}12`} vertical={false} />
              <XAxis dataKey="time" {...axis} />
              <YAxis {...axis} width={32} />
              <Tooltip {...tt} formatter={v => [v, 'errors']} />
              <Line
                type="monotone"
                dataKey="errors"
                stroke={t.red}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: t.red, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartShell>
        </motion.section>

        {/* Feature Usage */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
          style={{ marginBottom: 36 }}
        >
          <SectionHeader icon={Layers} title="Feature usage" accent={t.purple} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <ChartShell t={t}>
              <PieChart>
                <Pie
                  data={STUB_DATA.featureUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {STUB_DATA.featureUsage.map((entry, i) => (
                    <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: t.bg,
                    border: `1.5px solid ${t.ink}`,
                    borderRadius: 6,
                    fontFamily: '"Fraunces", serif',
                    fontSize: 13,
                    color: t.ink,
                    boxShadow: 'none',
                  }}
                  formatter={(v, name) => [`${v}%`, name]}
                />
              </PieChart>
            </ChartShell>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STUB_DATA.featureUsage.map((entry, i) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: pieColors[i % pieColors.length],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, flex: 1 }}>
                    {entry.name}
                  </span>
                  <span
                    style={{
                      fontFamily: '"DM Serif Display", serif',
                      fontSize: 16,
                      color: t.ink,
                    }}
                  >
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* User Engagement */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36, ease: EASE }}
          style={{ marginBottom: 36 }}
        >
          <SectionHeader icon={Zap} title="User engagement" accent={t.mustard} />
          <ChartShell t={t}>
            <LineChart data={STUB_DATA.userEngagement} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${t.ink}12`} vertical={false} />
              <XAxis dataKey="time" {...axis} />
              <YAxis {...axis} width={32} />
              <Tooltip {...tt} formatter={v => [v, 'engagement']} />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke={t.mustard}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: t.mustard, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartShell>
        </motion.section>

      </div>
    </div>
  );
};

export default BetaAnalytics;
