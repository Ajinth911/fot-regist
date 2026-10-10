import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { RollingNumber } from '../common/RollingNumber';
import { IconRefresh } from '../../lib/icons';

interface MetricsData {
  totalRegistrations: number;
  totalAttendees: number;
  soloAttendees: number;
  teamAttendees: number;
  teamGroupsCount: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  rejectedRegistrations: number;
  totalRevenue: number;
  checkedInCount: number;
}

interface TimelinePoint {
  dateLabel: string;
  count: number;
  cumulative: number;
}

export const OverviewView: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getStatsOverview()
      .then((data) => {
        setMetrics(data.metrics);
        setTimeline(data.timeline || []);
      })
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="py-20 text-center text-sm text-[#8C8C85]">
        Loading event analytics...
      </div>
    );
  }

  const m = metrics || {
    totalRegistrations: 0,
    totalAttendees: 0,
    soloAttendees: 0,
    teamAttendees: 0,
    teamGroupsCount: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
    rejectedRegistrations: 0,
    totalRevenue: 0,
    checkedInCount: 0,
  };

  // SVG calculations for velocity line chart
  const maxCumulative = Math.max(...timeline.map((t) => t.cumulative), 1);
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = timeline.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(timeline.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (pt.cumulative / maxCumulative) * (chartHeight - paddingY * 2);
    return { x, y, pt };
  });

  const svgPointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E6DF] pb-6">
        <div>
          <span className="text-xs text-[#8C8C85] font-mono uppercase tracking-wider font-bold block mb-1">
            Realtime Analytics
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
            Overview
          </h1>
          <p className="text-xs text-[#55554F] mt-1 font-medium">
            Live registration velocity, revenue, and gate check-in statistics.
          </p>
        </div>

        <button
          onClick={loadData}
          className="h-10 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-xs font-bold text-[#0A0A0A] inline-flex items-center gap-2 self-start sm:self-auto shadow-sm transition-colors cursor-pointer"
        >
          <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh metrics</span>
        </button>
      </div>

      {/* Primary Stat Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registrations */}
        <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio flex flex-col justify-between">
          <span className="text-xs text-[#8C8C85] font-bold block mb-2 font-mono uppercase">
            Total Registrations
          </span>
          <div className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] font-mono">
            <RollingNumber value={m.totalRegistrations} />
          </div>
          <span className="text-xs text-[#0A0A0A] font-semibold mt-3 block">
            {m.totalAttendees} total attendees
          </span>
        </div>

        {/* Confirmed Passes */}
        <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio flex flex-col justify-between">
          <span className="text-xs text-[#8C8C85] font-bold block mb-2 font-mono uppercase">
            Confirmed Passes
          </span>
          <div className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] font-mono">
            <RollingNumber value={m.confirmedRegistrations} />
          </div>
          <span className="text-xs text-[#55554F] mt-3 block">
            {m.pendingRegistrations} pending verification
          </span>
        </div>

        {/* Total Revenue */}
        <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio flex flex-col justify-between">
          <span className="text-xs text-[#8C8C85] font-bold block mb-2 font-mono uppercase">
            Total Revenue
          </span>
          <div className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] font-mono">
            <RollingNumber value={m.totalRevenue} prefix="₹" />
          </div>
          <span className="text-xs text-[#55554F] mt-3 block">
            Settled via direct UPI
          </span>
        </div>

        {/* Gate Check-Ins */}
        <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio flex flex-col justify-between">
          <span className="text-xs text-[#8C8C85] font-bold block mb-2 font-mono uppercase">
            Checked-in Attendees
          </span>
          <div className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] font-mono">
            <RollingNumber value={m.checkedInCount} />
          </div>
          <span className="text-xs text-[#55554F] mt-3 block">
            Verified on-site
          </span>
        </div>
      </div>

      {/* Secondary Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-card-subtle flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8C8C85] font-semibold block">Solo Attendees</span>
            <span className="text-2xl font-bold text-[#0A0A0A] mt-1 font-mono">{m.soloAttendees}</span>
          </div>
          <span className="text-xs text-[#0A0A0A] font-bold px-3 py-1 bg-[#F2F2EC] rounded-full border border-[#E6E6DF]">
            Individual
          </span>
        </div>

        <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-card-subtle flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8C8C85] font-semibold block">Team Attendees</span>
            <span className="text-2xl font-bold text-[#0A0A0A] mt-1 font-mono">{m.teamAttendees}</span>
          </div>
          <span className="text-xs text-[#0A0A0A] font-bold px-3 py-1 bg-[#F2F2EC] rounded-full border border-[#E6E6DF]">
            {m.teamGroupsCount} 2-Person Teams
          </span>
        </div>

        <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-card-subtle flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8C8C85] font-semibold block">Rejected Proofs</span>
            <span className="text-2xl font-bold text-[#E53935] mt-1 font-mono">{m.rejectedRegistrations}</span>
          </div>
          <span className="text-xs text-[#E53935] font-bold px-3 py-1 bg-[#FFF5F5] rounded-full border border-[#E53935]/20">
            Unverified
          </span>
        </div>
      </div>

      {/* Registration Curve Chart */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio">
        <div className="flex items-center justify-between mb-6 border-b border-[#E6E6DF] pb-4">
          <div>
            <span className="text-xs text-[#8C8C85] font-mono uppercase tracking-wider font-bold block mb-0.5">
              Registration Activity
            </span>
            <h3 className="text-lg font-bold text-[#0A0A0A]">
              Cumulative Registrations Over Time
            </h3>
          </div>
          <span className="text-xs text-[#8C8C85] font-medium">
            Timeline progression
          </span>
        </div>

        {/* SVG Line Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] h-64 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] p-4 relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#E6E6DF" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#E6E6DF" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#0A0A0A" strokeWidth="1" />

              {/* Area gradient */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C2E600" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#C2E600" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {points.length > 1 && (
                <polygon
                  points={`${points[0].x},${chartHeight - paddingY} ${svgPointsString} ${points[points.length - 1].x},${chartHeight - paddingY}`}
                  fill="url(#chartGradient)"
                />
              )}

              {/* Polyline */}
              <motion.polyline
                fill="none"
                stroke="#0A0A0A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgPointsString}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#C2E600" stroke="#0A0A0A" strokeWidth="2" />
                  <text
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fill="#8C8C85"
                    fontSize="10"
                    fontFamily="inherit"
                    fontWeight="600"
                  >
                    {p.pt.dateLabel}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#0A0A0A"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {p.pt.cumulative}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
