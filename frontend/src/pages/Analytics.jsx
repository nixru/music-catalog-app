import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { getLibraryStats, getLibraryInsights } from '../api/client';
import { Link } from 'react-router-dom';

const PALETTE = ['#D9A441', '#4E9791', '#8C4A45', '#6FB3AB', '#E3B45F', '#2E2822', '#B8842D', '#3B7873'];

const tooltipStyle = {
  contentStyle: { background: '#211D18', border: '1px solid #2E2822', borderRadius: 6, fontSize: 12, color: '#EDE6D5' },
  labelStyle: { color: '#DCD3BE' },
  itemStyle: { color: '#EDE6D5' },
};

function ChartCard({ title, subtitle, children, tall }) {
  return (
    <div className="bg-ink-900 border border-ink-700 rounded-lg p-5">
      <h3 className="font-display text-lg text-paper-100 mb-0.5">{title}</h3>
      {subtitle && <p className="text-xs text-paper-300/50 mb-4">{subtitle}</p>}
      <div className={`${tall ? 'h-80' : 'h-64'} mt-2`}>{children}</div>
    </div>
  );
}

function toEntries(obj) {
  return Object.entries(obj || {}).map(([name, value]) => ({ name, value: Number(value) }));
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getLibraryStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const loadInsights = () => {
    setInsightsLoading(true);
    getLibraryInsights()
      .then(({ data }) => setInsights(data))
      .catch(() => setInsights({ summary: 'Could not generate insights right now.', source: 'error' }))
      .finally(() => setInsightsLoading(false));
  };

  useEffect(() => { if (stats && stats.totalAlbums > 0) loadInsights(); }, [stats]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-ink-900 border border-ink-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="max-w-6xl mx-auto px-6 py-10 text-wine-500 text-sm">{error}</div>;
  }

  if (!stats || stats.totalAlbums === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-paper-100 mb-6">Analytics</h1>
        <div className="text-center py-20 text-paper-300/40 border border-dashed border-ink-700 rounded-lg">
          <p className="font-display text-xl mb-2 text-paper-300/70">No data yet</p>
          <p className="text-sm mb-4">Save a few albums to your library to see analytics here.</p>
          <Link to="/search" className="inline-block px-4 py-2 bg-gold-500 text-ink-950 rounded font-medium hover:bg-gold-400">
            Search albums
          </Link>
        </div>
      </div>
    );
  }

  const genreData = toEntries(stats.genreCounts);
  const yearData = toEntries(stats.releasesByYear).sort((a, b) => a.name.localeCompare(b.name));
  const artistData = toEntries(
    Object.fromEntries((stats.topArtists || []).map((a) => [a.artistName, a.count]))
  ).sort((a, b) => b.value - a.value);
  const ratingData = toEntries(stats.ratingDistribution).map((d) => ({ ...d, name: `${d.name} ★` }));
  const decadeData = toEntries(stats.decadeCounts).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-paper-100 mb-1">Analytics</h1>
          <p className="text-paper-300/60 text-sm">
            {stats.totalAlbums} albums · {stats.ratedCount} rated · avg {stats.averageRating.toFixed(1)}★
          </p>
        </div>
      </div>

      {/* AI Insights card */}
      <div className="bg-ink-900 border border-gold-500/30 rounded-lg p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg text-paper-100">AI trend summary</h3>
          <button
            onClick={loadInsights}
            disabled={insightsLoading}
            className="text-xs px-2.5 py-1 border border-ink-700 rounded text-paper-300/70 hover:border-gold-500 hover:text-gold-400 disabled:opacity-50"
          >
            {insightsLoading ? 'Thinking…' : 'Regenerate'}
          </button>
        </div>
        {insightsLoading && !insights ? (
          <div className="h-4 bg-ink-800 rounded animate-pulse w-3/4" />
        ) : (
          <>
            <p className="text-paper-200 text-sm leading-relaxed">{insights?.summary}</p>
            {insights?.source && (
              <p className="text-[10px] font-mono text-paper-300/40 mt-3 uppercase tracking-wide">
                Source: {insights.source}
              </p>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard title="Releases by year" subtitle="How your saved albums are spread across release years">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData}>
              <CartesianGrid stroke="#2E2822" vertical={false} />
              <XAxis dataKey="name" stroke="#DCD3BE" fontSize={11} tickLine={false} />
              <YAxis stroke="#DCD3BE" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="#D9A441" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Genre breakdown" subtitle="Share of your library by genre">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={genreData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {genreData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#161310" />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#DCD3BE' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top artists" subtitle="Artists with the most albums saved" tall>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={artistData} layout="vertical" margin={{ left: 10, right: 20 }} barCategoryGap={10}>
              <CartesianGrid stroke="#2E2822" horizontal={false} />
              <XAxis type="number" stroke="#DCD3BE" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#DCD3BE"
                fontSize={11}
                width={130}
                tickLine={false}
                axisLine={false}
                interval={0}
                tickFormatter={(name) => (name.length > 20 ? name.slice(0, 19) + '…' : name)}
              />
              <Tooltip {...tooltipStyle} formatter={(value, _name, props) => [value, props.payload.name]} />
              <Bar dataKey="value" fill="#4E9791" radius={[0, 3, 3, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rating distribution" subtitle="How you've rated albums in your library">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingData}>
              <CartesianGrid stroke="#2E2822" vertical={false} />
              <XAxis dataKey="name" stroke="#DCD3BE" fontSize={11} tickLine={false} />
              <YAxis stroke="#DCD3BE" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="#8C4A45" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Decade breakdown" subtitle="Which eras your library leans toward" >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={decadeData}>
              <CartesianGrid stroke="#2E2822" vertical={false} />
              <XAxis dataKey="name" stroke="#DCD3BE" fontSize={11} tickLine={false} />
              <YAxis stroke="#DCD3BE" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="linear" dataKey="value" stroke="#E3B45F" strokeWidth={2} dot={{ fill: '#E3B45F', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
