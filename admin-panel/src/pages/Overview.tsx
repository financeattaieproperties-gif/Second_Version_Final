import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Lead, type Project, type Property, type SubmissionPost, type VisitRequest } from '../api';
import { V1, V1_STYLES, v1BadgeStyle } from '../components/variant1';

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const safe = points.length >= 2 ? points : [2, 3, 2, 4, 3, 5];
  const max = Math.max(...safe, 1);
  const min = Math.min(...safe, 0);
  const span = Math.max(max - min, 1);
  const width = 92;
  const height = 28;
  const coords = safe.map((v, i) => {
    const x = (i / (safe.length - 1)) * width;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords.join(' ')}
      />
    </svg>
  );
}

function DualAreaChart({
  labels,
  primary,
  secondary,
}: {
  labels: string[];
  primary: number[];
  secondary: number[];
}) {
  const w = 560;
  const h = 190;
  const padX = 28;
  const padY = 16;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const maxVal = Math.max(...primary, ...secondary, 4);

  const toPoints = (vals: number[]) =>
    vals.map((v, i) => {
      const x = padX + (vals.length > 1 ? (i / (vals.length - 1)) * innerW : innerW / 2);
      const y = padY + innerH - (v / maxVal) * innerH;
      return { x, y };
    });

  const pPts = toPoints(primary);
  const sPts = toPoints(secondary);

  const linePath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const areaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    const base = padY + innerH;
    return `${linePath(pts)} L ${pts[pts.length - 1].x.toFixed(1)} ${base} L ${pts[0].x.toFixed(1)} ${base} Z`;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h + 22}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
          const y = padY + innerH * (1 - t);
          return (
            <g key={idx}>
              <line x1={padX} y1={y} x2={w - padX} y2={y} stroke={V1.border} strokeWidth="1" />
              <text x={4} y={y + 3} fontSize="10" fill={V1.slate} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(maxVal * t)}
              </text>
            </g>
          );
        })}

        <path d={areaPath(pPts)} fill={V1.blue} fillOpacity="0.12" />
        <path d={linePath(pPts)} fill="none" stroke={V1.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        <path d={areaPath(sPts)} fill={V1.green} fillOpacity="0.12" />
        <path d={linePath(sPts)} fill="none" stroke={V1.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {pPts.map((p, i) => (
          <circle key={`p-${i}`} cx={p.x} cy={p.y} r="3" fill={V1.blue} />
        ))}
        {sPts.map((p, i) => (
          <circle key={`s-${i}`} cx={p.x} cy={p.y} r="3" fill={V1.green} />
        ))}

        {labels.map((lbl, i) => {
          const x = padX + (labels.length > 1 ? (i / (labels.length - 1)) * innerW : innerW / 2);
          return (
            <text
              key={lbl}
              x={x}
              y={h + 14}
              textAnchor="middle"
              fontSize="10.5"
              fill={V1.slate}
              fontWeight="600"
            >
              {lbl}
            </text>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.78rem', color: V1.slate }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: V1.blue, display: 'inline-block' }} />
          New Leads
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: V1.green, display: 'inline-block' }} />
          Site Visits &amp; Listings
        </span>
      </div>
    </div>
  );
}

function ChannelDonut({ segments }: { segments: Array<{ label: string; value: number; color: string }> }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <svg width="144" height="144" viewBox="0 0 144 144" style={{ flexShrink: 0 }}>
        <circle cx="72" cy="72" r={r} fill="none" stroke={V1.slateSoft} strokeWidth="18" />
        {total > 0 &&
          segments.map((seg) => {
            const dash = (seg.value / total) * c;
            const el = (
              <circle
                key={seg.label}
                cx="72"
                cy="72"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 72 72)"
              />
            );
            offset += dash;
            return el;
          })}
        <text x="72" y="68" textAnchor="middle" fontSize="20" fontWeight="700" fill={V1.ink} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {total}
        </text>
        <text x="72" y="85" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={V1.slate}>
          Total Leads
        </text>
      </svg>

      <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={seg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: V1.ink, fontWeight: 500 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: seg.color, display: 'inline-block' }} />
                {seg.label}
              </span>
              <span style={{ color: V1.slate, fontWeight: 600 }}>
                {seg.value} <span style={{ fontSize: '0.74rem' }}>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Overview() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProperties().catch(() => []),
      api.getProjects().catch(() => []),
      api.getLeads().catch(() => []),
      api.getVisitRequests().catch(() => []),
      api.getSubmissions().catch(() => []),
    ])
      .then(([propsRes, projRes, leadsRes, visitsRes, subRes]) => {
        setProperties(Array.isArray(propsRes) ? propsRes : []);
        setProjects(Array.isArray(projRes) ? projRes : []);
        setLeads(Array.isArray(leadsRes) ? leadsRes : []);
        setVisits(Array.isArray(visitsRes) ? visitsRes : []);
        setSubmissions(Array.isArray(subRes) ? subRes : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const availableProps = useMemo(() => properties.filter((p) => p.status === 'available').length, [properties]);
  const activeProjects = useMemo(() => projects.filter((p) => p.status !== 'Sold Out').length, [projects]);
  const pendingVisits = useMemo(() => visits.filter((v) => v.status === 'pending' || v.status === 'confirmed').length, [visits]);
  const pendingSubmissions = useMemo(() => submissions.filter((s) => s.submission_status === 'Submitted').length, [submissions]);

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months: Array<{ key: string; label: string; leads: number; activity: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      months.push({ key, label, leads: 0, activity: 0 });
    }
    const byKey = new Map(months.map((m) => [m.key, m]));
    for (const l of leads) {
      const k = (l.created_at || '').slice(0, 7);
      const bucket = byKey.get(k);
      if (bucket) bucket.leads += 1;
    }
    for (const v of visits) {
      const k = (v.requested_at || '').slice(0, 7);
      const bucket = byKey.get(k);
      if (bucket) bucket.activity += 1;
    }
    for (const p of properties) {
      const k = (p.created_at || '').slice(0, 7);
      const bucket = byKey.get(k);
      if (bucket) bucket.activity += 1;
    }
    return months;
  }, [leads, visits, properties]);

  const channelSegments = useMemo(() => {
    const counts = { Website: 0, WhatsApp: 0, 'Call Center': 0, 'Direct / Other': 0 };
    for (const l of leads) {
      const src = (l.source || 'Website').toLowerCase();
      if (src.includes('whatsapp')) counts.WhatsApp += 1;
      else if (src.includes('call') || src.includes('phone')) counts['Call Center'] += 1;
      else if (src.includes('web') || src === '') counts.Website += 1;
      else counts['Direct / Other'] += 1;
    }
    return [
      { label: 'Website', value: counts.Website, color: V1.blue },
      { label: 'WhatsApp', value: counts.WhatsApp, color: V1.green },
      { label: 'Call Center', value: counts['Call Center'], color: V1.slate },
      { label: 'Direct / Other', value: counts['Direct / Other'], color: '#CBD5E1' },
    ];
  }, [leads]);

  const kpis = [
    {
      label: 'Total Properties',
      value: properties.length,
      delta: `${availableProps} available`,
      tone: 'green' as const,
      points: [4, 6, 5, 8, 9, Math.max(properties.length, 1)],
      color: V1.green,
      to: '/properties',
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      delta: `${projects.length} total`,
      tone: 'blue' as const,
      points: [2, 2, 3, 3, 4, Math.max(activeProjects, 1)],
      color: V1.blue,
      to: '/projects',
    },
    {
      label: 'CRM Leads',
      value: leads.length,
      delta: `${leads.filter((l) => l.stage === 'new' || !l.stage).length} new`,
      tone: 'green' as const,
      points: monthlySeries.map((m) => m.leads || 1),
      color: V1.green,
      to: '/leads',
    },
    {
      label: 'Site Visits',
      value: visits.length,
      delta: `${pendingVisits} active`,
      tone: 'slate' as const,
      points: monthlySeries.map((m) => m.activity || 1),
      color: V1.blue,
      to: '/visits',
    },
  ];

  if (loading) {
    return <p style={{ padding: '2rem', color: V1.slate }}>Loading Admin Overview…</p>;
  }

  return (
    <div>
      <div style={V1_STYLES.header}>
        <div>
          <h1 style={V1_STYLES.title}>Admin Overview</h1>
          <p style={V1_STYLES.subtitle}>
            Live portfolio inventory, CRM lead pipeline, and channel attribution across Attaie Properties.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" style={V1_STYLES.secondaryBtn} onClick={() => navigate('/leads')}>
            View Leads ({leads.length})
          </button>
          <button type="button" style={V1_STYLES.primaryBtn} onClick={() => navigate('/properties/new')}>
            + New Property
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => navigate(kpi.to)}
            style={{
              ...V1_STYLES.card,
              padding: '1.1rem 1.2rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: V1.slate, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {kpi.label}
              </span>
              <span style={v1BadgeStyle(kpi.tone)}>{kpi.delta}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: V1.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {kpi.value.toLocaleString()}
              </span>
              <Sparkline points={kpi.points} color={kpi.color} />
            </div>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ ...V1_STYLES.card, padding: '1.2rem 1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: V1.ink }}>
                6-Month Lead &amp; Activity Trend
              </h2>
              <p style={{ margin: '0.18rem 0 0', fontSize: '0.78rem', color: V1.slate }}>
                Monthly CRM lead intake vs. scheduled visits &amp; new listings
              </p>
            </div>
          </div>
          <DualAreaChart
            labels={monthlySeries.map((m) => m.label)}
            primary={monthlySeries.map((m) => m.leads)}
            secondary={monthlySeries.map((m) => m.activity)}
          />
        </div>

        <div style={{ ...V1_STYLES.card, padding: '1.2rem 1.35rem' }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: V1.ink }}>
              Channel Breakdown
            </h2>
            <p style={{ margin: '0.18rem 0 0', fontSize: '0.78rem', color: V1.slate }}>
              Lead acquisition share by source channel
            </p>
          </div>
          <ChannelDonut segments={channelSegments} />
        </div>
      </div>

      {/* Quick Operational Queue */}
      <div style={{ ...V1_STYLES.card, padding: '1.15rem 1.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: V1.ink }}>
            Marketing &amp; Publishing Queue
          </div>
          <div style={{ fontSize: '0.8rem', color: V1.slate, marginTop: '0.2rem' }}>
            {pendingSubmissions} submission{pendingSubmissions === 1 ? '' : 's'} awaiting admin review before publishing.
          </div>
        </div>
        <button type="button" style={V1_STYLES.secondaryBtn} onClick={() => navigate('/tasks')}>
          Open Submissions Queue →
        </button>
      </div>
    </div>
  );
}
