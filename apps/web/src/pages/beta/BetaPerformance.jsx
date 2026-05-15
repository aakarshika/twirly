import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Wifi, ArrowRight } from 'lucide-react';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { useBetaTesting } from '../../contexts/BetaTestingContext';
import { getPerformanceReport } from '../../utils/analytics';

const EASE = [0.16, 1, 0.3, 1];
const POLL_MS = 5000;

const shortUrl = url => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

const formatBytes = bytes => {
  if (bytes == null) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const StatCard = ({ icon: Icon, label, value, accent, t, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.12 + index * 0.08, ease: EASE }}
    style={{
      background: t.bgDeep,
      border: `1.5px solid ${t.ink}20`,
      borderRadius: 8,
      padding: '16px 18px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <Icon size={14} style={{ color: accent }} strokeWidth={2} />
      <span
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 12,
          color: t.ink,
          opacity: 0.55,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
    </div>
    <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: 30, color: t.ink, lineHeight: 1 }}>
      {value}
    </p>
  </motion.div>
);

const EmptyChart = ({ t }) => (
  <div
    style={{
      background: t.bgDeep,
      border: `1.5px dashed ${t.ink}25`,
      borderRadius: 8,
      padding: '28px 20px',
      textAlign: 'center',
    }}
  >
    <p style={{ fontFamily: '"Caveat", cursive', fontSize: 17, color: t.ink, opacity: 0.4 }}>
      no data yet — trigger some actions first
    </p>
  </div>
);

const ApiChart = ({ data, t, index }) => (
  <motion.section
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: EASE }}
    style={{ marginBottom: 36 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <Wifi size={15} style={{ color: t.red }} strokeWidth={2} />
      <h2
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontStyle: 'italic',
          fontSize: 20,
          color: t.ink,
          margin: 0,
        }}
      >
        API response times
      </h2>
    </div>

    {data.length === 0 ? (
      <EmptyChart t={t} />
    ) : (
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
          <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${t.ink}12`} vertical={false} />
            <XAxis
              dataKey="endpoint"
              tick={{ fontFamily: '"Fraunces", serif', fontSize: 10, fill: t.ink, fillOpacity: 0.55 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontFamily: '"Fraunces", serif', fontSize: 10, fill: t.ink, fillOpacity: 0.55 }}
              axisLine={false}
              tickLine={false}
              unit="ms"
              width={42}
            />
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
              cursor={{ fill: `${t.red}12` }}
              formatter={v => [`${Math.round(v)} ms`, 'avg']}
            />
            <Bar dataKey="time" fill={t.red} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </motion.section>
);

const TransitionLog = ({ transitions, t, index }) => (
  <motion.section
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: EASE }}
    style={{ marginBottom: 36 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <ArrowRight size={15} style={{ color: t.blue }} strokeWidth={2} />
      <h2
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontStyle: 'italic',
          fontSize: 20,
          color: t.ink,
          margin: 0,
        }}
      >
        Screen transitions
      </h2>
    </div>

    {transitions.length === 0 ? (
      <EmptyChart t={t} />
    ) : (
      <div
        style={{
          background: t.bgDeep,
          border: `1.5px solid ${t.ink}15`,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {transitions.map(({ route, ms }, i) => (
          <div
            key={route}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: i < transitions.length - 1 ? `1px solid ${t.ink}12` : 'none',
            }}
          >
            <span
              style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink, opacity: 0.8 }}
            >
              {route}
            </span>
            <span
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 13,
                color: t.blue,
              }}
            >
              {ms.toFixed(0)} ms
            </span>
          </div>
        ))}
      </div>
    )}
  </motion.section>
);

const BetaPerformance = () => {
  const { isBetaMode } = useBetaTesting();
  const { themeId } = useTheme();
  const t = themes[themeId];
  const [report, setReport] = useState(() => getPerformanceReport());

  useEffect(() => {
    const id = setInterval(() => setReport(getPerformanceReport()), POLL_MS);
    return () => clearInterval(id);
  }, []);

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

  const apiData = Object.entries(report.averageApiResponseTimes).map(([url, time]) => ({
    endpoint: shortUrl(url),
    time,
  }));

  const transitionList = Object.entries(report.screenTransitionTimes).map(([route, ms]) => ({
    route,
    ms,
  }));

  const launchMs =
    report.appLaunchTime != null ? `${Math.round(report.appLaunchTime)} ms` : '—';

  const memoryStr = formatBytes(report.resourceUsage?.memory);

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

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ marginBottom: 28 }}
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
            live — refreshes every 5s
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
            Performance
          </h1>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          <StatCard icon={Activity} label="App launch" value={launchMs} accent={t.red} t={t} index={0} />
          <StatCard icon={Cpu} label="JS heap" value={memoryStr} accent={t.blue} t={t} index={1} />
        </div>

        <ApiChart data={apiData} t={t} index={0} />
        <TransitionLog transitions={transitionList} t={t} index={1} />

      </div>
    </div>
  );
};

export default BetaPerformance;
