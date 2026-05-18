import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Area, ScatterChart, Scatter,
} from 'recharts';

// ──────────────────────────────────────────────────────────────
// Inline icon components (replaces lucide-react)
// ──────────────────────────────────────────────────────────────
const IconBase = ({ size = 16, color, fill, stroke, style, children, ...rest }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill !== undefined ? fill : 'none'}
    stroke={stroke !== undefined ? stroke : (color || 'currentColor')}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={style} {...rest}
  >{children}</svg>
);
const Circle = (p) => <IconBase {...p}><circle cx="12" cy="12" r="10" /></IconBase>;
const ArrowUpRight = (p) => <IconBase {...p}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></IconBase>;
const ArrowDownRight = (p) => <IconBase {...p}><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></IconBase>;
const ChevronRight = (p) => <IconBase {...p}><polyline points="9 18 15 12 9 6"/></IconBase>;
const FileText = (p) => <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></IconBase>;
const Lock = (p) => <IconBase {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>;

// ──────────────────────────────────────────────────────────────
// Design tokens — refined clinical palette
// ──────────────────────────────────────────────────────────────
const ink = '#0F1F33';
const ink2 = '#2C3E50';
const muted = '#6B7A8F';
const fade = '#9BA8B8';
const line = '#E4E2DC';
const lineSoft = '#EDEBE5';
const bg = '#FAF8F3';
const bgCard = '#FFFFFF';
const teal = '#3B7A7A';
const critical = '#A8312E';
const warn = '#B8761A';
const ok = '#3D7A4E';
const goldLine = '#C4A562';

// ──────────────────────────────────────────────────────────────
// Mock data
// ──────────────────────────────────────────────────────────────
const suiteBTrend = [
  { wk: 'W-3', avg: 142, peak: 198, threshold: 250 },
  { wk: 'W-2', avg: 167, peak: 223, threshold: 250 },
  { wk: 'W-1', avg: 189, peak: 241, threshold: 250 },
  { wk: 'Now', avg: 218, peak: 247, threshold: 250 },
];

const suites = [
  { id: 'A', name: 'Suite A · Recovery', risk: 18, status: 'ok', flags: 0 },
  { id: 'B', name: 'Suite B · Processing', risk: 64, status: 'warn', flags: 3 },
  { id: 'C', name: 'Suite C · Processing', risk: 22, status: 'ok', flags: 0 },
  { id: 'D', name: 'Suite D · ISO 5 Clean', risk: 12, status: 'ok', flags: 0 },
  { id: 'E', name: 'Suite E · Packaging', risk: 28, status: 'ok', flags: 1 },
  { id: 'F', name: 'Suite F · Decon', risk: 34, status: 'warn', flags: 1 },
  { id: 'G', name: 'Suite G · QC Lab', risk: 14, status: 'ok', flags: 0 },
  { id: 'H', name: 'Suite H · Cryostorage', risk: 41, status: 'warn', flags: 2 },
];

const dataSources = [
  { name: 'ATP luminometer', status: 'live', count: '1,247 readings · 7d', latency: 'real-time' },
  { name: 'Culture lab reports', status: 'live', count: '23 incubating · 7 reading', latency: '4–6 wk' },
  { name: 'Cleaning & disinfection logs', status: 'live', count: '184 cleans · 7d', latency: 'per shift' },
  { name: 'HVAC & particle counts', status: 'live', count: '8 zones · continuous', latency: 'real-time' },
  { name: 'Personnel monitoring', status: 'live', count: '47 gowning checks · 7d', latency: 'per entry' },
  { name: 'Production schedule', status: 'live', count: '12 suites · 24/7', latency: 'live sync' },
  { name: 'Deviations & CAPAs', status: 'live', count: '6 open · 2 new', latency: 'on event' },
];

const driftPattern = [
  { day: 'D-21', val: 138 }, { day: 'D-18', val: 144 }, { day: 'D-15', val: 152 },
  { day: 'D-12', val: 158 }, { day: 'D-9', val: 169 }, { day: 'D-6', val: 184 },
  { day: 'D-3', val: 201 }, { day: 'Now', val: 218 },
];

const volumeCorr = [
  { cases: 6, atp: 110 }, { cases: 8, atp: 134 }, { cases: 10, atp: 158 },
  { cases: 12, atp: 178 }, { cases: 14, atp: 195 }, { cases: 16, atp: 224 },
  { cases: 18, atp: 251 }, { cases: 20, atp: 287 }, { cases: 22, atp: 318 },
];

const recurringOrgs = [
  { loc: 'Suite B · table 2', org: 'S. epidermidis', occ: 4, days: '128d' },
  { loc: 'Suite B · door handle', org: 'M. luteus', occ: 3, days: '94d' },
  { loc: 'Suite H · anteroom', org: 'B. cereus', occ: 3, days: '76d' },
  { loc: 'Suite F · drain', org: 'P. aeruginosa', occ: 2, days: '52d' },
];

const cleaningMismatch = [
  { suite: 'Suite B', cleans: 18, atpHigh: 6, mismatch: 33 },
  { suite: 'Suite C', cleans: 16, atpHigh: 1, mismatch: 6 },
  { suite: 'Suite F', cleans: 14, atpHigh: 3, mismatch: 21 },
  { suite: 'Suite H', cleans: 12, atpHigh: 4, mismatch: 33 },
];

const alerts = [
  { id: 1, level: 'critical', loc: 'Suite B · Processing', text: 'ATP drift 3 weeks · pattern preceded last 2 culture positives · same evening crew', time: '47 min ago' },
  { id: 2, level: 'warn', loc: 'Suite H · Cryostorage', text: 'Organism recurrence: B. cereus, 3rd positive at anteroom', time: '2h ago' },
  { id: 3, level: 'warn', loc: 'Suite F · Decon', text: 'Cleaning logged 14:00 — ATP elevated at 14:32 same surface', time: '5h ago' },
  { id: 4, level: 'info', loc: 'Suite C · Processing', text: 'Culture result returned (28d): no growth — within limits', time: '8h ago' },
];

const samplingPlan = [
  { rank: 1, loc: 'Suite B · table 2 surface', risk: 'High', info: 0.94, reason: '3-week ATP drift, organism recurrence' },
  { rank: 2, loc: 'Suite H · anteroom door handle', risk: 'High', info: 0.89, reason: 'B. cereus pattern, 3rd positive zone' },
  { rank: 3, loc: 'Suite F · drain', risk: 'Med', info: 0.81, reason: 'Cleaning mismatch flagged' },
  { rank: 4, loc: 'Suite B · HEPA return', risk: 'Med', info: 0.72, reason: 'Connected zone to drift location' },
  { rank: 5, loc: 'Suite E · packaging line', risk: 'Low', info: 0.58, reason: 'Volume spike forecast Thu' },
  { rank: 6, loc: 'Suite A · workstation 3', risk: 'Low', info: 0.41, reason: 'Routine confirmation interval' },
];

const capaQueue = [
  { id: 'CAPA-2026-0163', title: 'Suite B · ATP drift + crew pattern', age: '0d', status: 'Drafted by system', owner: 'Pending review' },
  { id: 'CAPA-2026-0151', title: 'Suite H · organism recurrence', age: '9d', status: 'In progress', owner: 'J. Thomas' },
  { id: 'CAPA-2026-0142', title: 'Suite F · cleaning mismatch', age: '14d', status: 'In progress', owner: 'M. Reef' },
];

const aatbCategories = [
  { name: 'EM trending & analysis', score: 96 },
  { name: 'Excursion documentation', score: 100 },
  { name: 'CAPA timeliness', score: 88 },
  { name: 'Audit trail completeness', score: 100 },
  { name: 'Cleaning verification', score: 92 },
  { name: 'Personnel monitoring', score: 94 },
];

// ──────────────────────────────────────────────────────────────
// Primitives
// ──────────────────────────────────────────────────────────────
const statusColor = (s) => s === 'critical' ? critical : s === 'warn' ? warn : ok;
const statusBg = (s) => s === 'critical' ? '#FBEEED' : s === 'warn' ? '#FBF4E8' : '#EFF5F0';

const SectionLabel = ({ children, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${line}` }}>
    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: muted, fontWeight: 500 }}>{children}</div>
    {right && <div style={{ fontSize: 11, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>{right}</div>}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background: bgCard, border: `1px solid ${line}`, padding: 22, ...style }}>{children}</div>
);

const Kpi = ({ label, value, unit, delta, deltaDir, sublabel }) => (
  <div style={{ background: bgCard, border: `1px solid ${line}`, padding: '20px 22px' }}>
    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 12 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 400, color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      {unit && <div style={{ fontSize: 13, color: muted, fontFamily: 'JetBrains Mono, monospace' }}>{unit}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: deltaDir === 'up' ? critical : deltaDir === 'down' ? ok : muted, fontFamily: 'JetBrains Mono, monospace' }}>
      {deltaDir === 'up' && <ArrowUpRight size={12} />}
      {deltaDir === 'down' && <ArrowDownRight size={12} />}
      <span>{delta}</span>
      <span style={{ color: fade }}>· {sublabel}</span>
    </div>
  </div>
);

const Pill = ({ children, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color, border: `1px solid ${color}33`, background: `${color}0C` }}>
    <Circle size={6} fill={color} stroke="none" />
    {children}
  </span>
);

// ──────────────────────────────────────────────────────────────
// Operations tab
// ──────────────────────────────────────────────────────────────
const OperationsTab = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card style={{ background: ink, color: '#fff', border: 'none', padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: goldLine }}>Monday morning · 08:47</div>
          <Pill color={critical}>Action required</Pill>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, lineHeight: 1.3, fontWeight: 400, marginBottom: 18, maxWidth: 720 }}>
          Suite B · ATP trending upward over <span style={{ fontStyle: 'italic', color: goldLine }}>three weeks</span>. Every reading still within limits — but this pattern preceded the last two culture positives in this suite.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, paddingTop: 16, borderTop: '1px solid #ffffff15' }}>
          <div>
            <div style={{ fontSize: 10, color: '#9BA8B8', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Cleaning logs</div>
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>Same evening crew · all 3 weeks</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#9BA8B8', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Auto-drafted</div>
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>CAPA-2026-0163 · awaiting review</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#9BA8B8', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Next case in Suite B</div>
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>Tomorrow · 06:30</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel right="3-week rolling · ATP avg">Suite B drift pattern</SectionLabel>
        <div style={{ height: 200 }}>
          <ResponsiveContainer>
            <ComposedChart data={suiteBTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={lineSoft} vertical={false} />
              <XAxis dataKey="wk" tick={{ fontSize: 10, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: line }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} domain={[0, 300]} />
              <Tooltip contentStyle={{ background: ink, border: 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
              <ReferenceLine y={250} stroke={critical} strokeDasharray="2 3" strokeWidth={1} label={{ value: 'Action limit', fontSize: 9, fill: critical, position: 'right' }} />
              <Area type="monotone" dataKey="peak" stroke={teal} strokeWidth={1} fill={teal} fillOpacity={0.08} />
              <Line type="monotone" dataKey="avg" stroke={warn} strokeWidth={2.5} dot={{ r: 4, fill: warn }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 11, color: muted, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
          Every reading within limits. Drift detection caught the slope.
        </div>
      </Card>

      <Card>
        <SectionLabel right="Live · risk-weighted">All suites</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {suites.map(s => (
            <div key={s.id} style={{ padding: 12, border: `1px solid ${line}`, background: statusBg(s.status), minHeight: 84 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: ink, fontWeight: 500 }}>Suite {s.id}</div>
                <Circle size={8} fill={statusColor(s.status)} stroke="none" />
              </div>
              <div style={{ fontSize: 10, color: muted, marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>{s.name.split('·')[1].trim()}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: statusColor(s.status), fontWeight: 500 }}>{s.risk}<span style={{ fontSize: 10, color: muted, marginLeft: 2 }}>%</span></div>
                <div style={{ fontSize: 10, color: s.flags > 0 ? critical : fade, fontFamily: 'JetBrains Mono, monospace' }}>{s.flags > 0 ? `${s.flags} flag${s.flags > 1 ? 's' : ''}` : '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <SectionLabel right="Auto-refresh · 60s">Active signals</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {alerts.map((a, i) => (
            <div key={a.id} style={{ padding: '14px 0', borderTop: i === 0 ? 'none' : `1px solid ${lineSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Pill color={a.level === 'critical' ? critical : a.level === 'warn' ? warn : teal}>{a.level}</Pill>
                <div style={{ fontSize: 10, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>{a.time}</div>
              </div>
              <div style={{ fontSize: 12, color: ink, fontWeight: 500, marginBottom: 4 }}>{a.loc}</div>
              <div style={{ fontSize: 12, color: ink2, lineHeight: 1.4 }}>{a.text}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel right="All 7 connected">Data sources</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dataSources.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: i === dataSources.length - 1 ? 'none' : `1px solid ${lineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Circle size={6} fill={ok} stroke="none" />
                <div>
                  <div style={{ fontSize: 12, color: ink, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: muted, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{s.count}</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>{s.latency}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// AI Patterns tab
// ──────────────────────────────────────────────────────────────
const PatternsTab = () => (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <Pill color={critical}>Drift detected</Pill>
          <div style={{ fontSize: 10, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>PATTERN 1 / 4</div>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: ink, fontWeight: 400, marginTop: 12, marginBottom: 6, lineHeight: 1.2 }}>
          Slow drift before limits cross
        </div>
        <div style={{ fontSize: 12, color: muted, lineHeight: 1.5, marginBottom: 14 }}>Suite B · 21 days · ATP avg climbed from 138 → 218 RLU. Every reading still under the 250 action limit. Slope detected at +5.7 RLU/week, p&lt;0.01.</div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer>
            <LineChart data={driftPattern} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={lineSoft} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: line }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} domain={[100, 280]} />
              <ReferenceLine y={250} stroke={critical} strokeDasharray="2 3" strokeWidth={1} />
              <Line type="monotone" dataKey="val" stroke={warn} strokeWidth={2.5} dot={{ r: 3, fill: warn }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <Pill color={warn}>Correlation strong</Pill>
          <div style={{ fontSize: 10, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>PATTERN 2 / 4</div>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: ink, fontWeight: 400, marginTop: 12, marginBottom: 6, lineHeight: 1.2 }}>
          Volume drives contamination
        </div>
        <div style={{ fontSize: 12, color: muted, lineHeight: 1.5, marginBottom: 14 }}>Strong linear relationship between daily case volume and peak ATP. r=0.94. Forecast for Thursday (21 cases): peak ATP ~310 RLU — escalate cleaning frequency in advance.</div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={lineSoft} />
              <XAxis dataKey="cases" type="number" tick={{ fontSize: 9, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: line }} tickLine={false} domain={[4, 24]} />
              <YAxis dataKey="atp" type="number" tick={{ fontSize: 9, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} domain={[80, 340]} />
              <Scatter data={volumeCorr} fill={teal} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <Pill color={critical}>4 locations</Pill>
          <div style={{ fontSize: 10, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>PATTERN 3 / 4</div>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: ink, fontWeight: 400, marginTop: 12, marginBottom: 6, lineHeight: 1.2 }}>
          Organism recurrence by location
        </div>
        <div style={{ fontSize: 12, color: muted, lineHeight: 1.5, marginBottom: 14 }}>Same organism returning to the same physical location across cleaning cycles. Suggests biofilm or environmental reservoir, not random recontamination.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recurringOrgs.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px 60px', gap: 12, alignItems: 'center', paddingBottom: 6, borderBottom: i === recurringOrgs.length - 1 ? 'none' : `1px solid ${lineSoft}` }}>
              <div style={{ fontSize: 11, color: ink, fontWeight: 500 }}>{r.loc}</div>
              <div style={{ fontSize: 11, color: ink2, fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>{r.org}</div>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: critical, textAlign: 'right' }}>×{r.occ}</div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: fade, textAlign: 'right' }}>{r.days}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <Pill color={warn}>2 suites flagged</Pill>
          <div style={{ fontSize: 10, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>PATTERN 4 / 4</div>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: ink, fontWeight: 400, marginTop: 12, marginBottom: 6, lineHeight: 1.2 }}>
          Cleaning logs vs. observed ATP
        </div>
        <div style={{ fontSize: 12, color: muted, lineHeight: 1.5, marginBottom: 14 }}>Surfaces logged as cleaned but showing elevated ATP within 60 minutes. Could indicate technique, agent dilution, or documentation drift.</div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer>
            <BarChart data={cleaningMismatch} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={lineSoft} vertical={false} />
              <XAxis dataKey="suite" tick={{ fontSize: 9, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: line }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: muted, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: ink, border: 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
              <Bar dataKey="mismatch" fill={warn} name="Mismatch %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

    <Card style={{ background: bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 6 }}>Where rules end, AI begins</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: ink, fontWeight: 400, lineHeight: 1.4, maxWidth: 720 }}>
            Patterns a single threshold check would miss. Every flag traces back to its source readings and the rule that triggered it.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: muted }}>
          <div><div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: ink }}>14</div><div style={{ marginTop: 4 }}>patterns / 90d</div></div>
          <div><div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: ok }}>−38d</div><div style={{ marginTop: 4 }}>avg lead time</div></div>
          <div><div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: ink }}>87%</div><div style={{ marginTop: 4 }}>confirmed</div></div>
        </div>
      </div>
    </Card>
  </div>
);

// ──────────────────────────────────────────────────────────────
// Sampling tab
// ──────────────────────────────────────────────────────────────
const SamplingTab = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
    <Card>
      <SectionLabel right="Week of 18 May · auto-generated">Ranked sampling plan</SectionLabel>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px', gap: 16, padding: '8px 0 12px', borderBottom: `1px solid ${line}`, fontSize: 10, color: muted, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <div>#</div><div>Location / surface</div><div>Risk</div><div style={{ textAlign: 'right' }}>Info value</div>
        </div>
        {samplingPlan.map(s => (
          <div key={s.rank} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px', gap: 16, padding: '16px 0', borderBottom: `1px solid ${lineSoft}`, alignItems: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: s.rank <= 3 ? ink : fade }}>{String(s.rank).padStart(2, '0')}</div>
            <div>
              <div style={{ fontSize: 13, color: ink, fontWeight: 500, marginBottom: 2 }}>{s.loc}</div>
              <div style={{ fontSize: 11, color: muted, fontStyle: 'italic' }}>{s.reason}</div>
            </div>
            <div><Pill color={s.risk === 'High' ? critical : s.risk === 'Med' ? warn : ok}>{s.risk}</Pill></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: ink, fontWeight: 500 }}>{s.info.toFixed(2)}</div>
              <div style={{ marginTop: 4, height: 3, background: lineSoft }}>
                <div style={{ height: '100%', width: `${s.info * 100}%`, background: s.risk === 'High' ? critical : s.risk === 'Med' ? warn : ok, marginLeft: 'auto' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card style={{ background: bg }}>
        <SectionLabel>Allocation comparison</SectionLabel>
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: muted, marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>Fixed monthly schedule</span><span>12 plates</span>
          </div>
          <div style={{ height: 8, background: '#fff', border: `1px solid ${line}`, display: 'flex' }}>
            <div style={{ flex: 4, background: ok, opacity: 0.5 }} />
            <div style={{ flex: 4, background: ok, opacity: 0.5, borderLeft: `1px solid ${line}` }} />
            <div style={{ flex: 4, background: ok, opacity: 0.5, borderLeft: `1px solid ${line}` }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: muted, marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>DonorIQ EM optimized</span><span>12 plates</span>
          </div>
          <div style={{ height: 8, background: '#fff', border: `1px solid ${line}`, display: 'flex' }}>
            <div style={{ flex: 1, background: ok }} />
            <div style={{ flex: 3, background: warn, borderLeft: `1px solid ${line}` }} />
            <div style={{ flex: 8, background: critical, borderLeft: `1px solid ${line}` }} />
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${line}`, marginTop: 18, paddingTop: 14, fontSize: 12, color: ink2, lineHeight: 1.5 }}>
          Same budget. <strong style={{ color: ink }}>+34% expected information yield.</strong> Probability of catching next excursion before clinical impact: <strong style={{ color: ok }}>0.81</strong> vs. <strong style={{ color: critical }}>0.42</strong>.
        </div>
      </Card>

      <Card>
        <SectionLabel>Lab queue</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div><div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: ink }}>23</div><div style={{ fontSize: 10, color: muted, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Incubating</div></div>
          <div><div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: ink }}>7</div><div style={{ fontSize: 10, color: muted, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Reading wk</div></div>
          <div><div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: critical }}>2</div><div style={{ fontSize: 10, color: muted, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Out of spec</div></div>
        </div>
      </Card>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// Reports & Audit tab
// ──────────────────────────────────────────────────────────────
const ReportsTab = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
    <Card>
      <SectionLabel right="Next inspection · 87d">AATB readiness</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 56, color: ok, fontWeight: 400, lineHeight: 1 }}>95</div>
        <div style={{ fontSize: 14, color: muted, fontFamily: 'JetBrains Mono, monospace' }}>/100</div>
        <Pill color={ok}>Inspection ready</Pill>
      </div>
      <div style={{ fontSize: 12, color: muted, marginBottom: 22 }}>Across 6 inspection-critical categories</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {aatbCategories.map((c, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: ink, fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: c.score < 90 ? warn : ok }}>{c.score}%</span>
            </div>
            <div style={{ height: 4, background: lineSoft }}>
              <div style={{ height: '100%', width: `${c.score}%`, background: c.score < 90 ? warn : ok }} />
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <SectionLabel right="Auto-opened by AI patterns">CAPA queue</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {capaQueue.map((c, i) => (
          <div key={i} style={{ padding: 14, border: `1px solid ${line}`, background: bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: fade, letterSpacing: '0.05em' }}>{c.id} · {c.age}</div>
              <Pill color={c.status.includes('Drafted') ? warn : teal}>{c.status}</Pill>
            </div>
            <div style={{ fontSize: 13, color: ink, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: muted, fontFamily: 'JetBrains Mono, monospace' }}>Owner: {c.owner}</div>
          </div>
        ))}
      </div>
    </Card>

    <Card style={{ gridColumn: 'span 2' }}>
      <SectionLabel right="One-click generation">Inspection package</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { name: 'EM trending summary', period: 'Q1 2026', pages: 14 },
          { name: 'Excursion log + CAPA links', period: 'Q1 2026', pages: 8 },
          { name: 'Cleaning verification report', period: 'Q1 2026', pages: 11 },
          { name: 'Full audit trail export', period: 'All time', pages: '—' },
        ].map((r, i) => (
          <div key={i} style={{ padding: 16, border: `1px solid ${line}`, background: bgCard, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <FileText size={18} color={muted} />
            <div style={{ fontSize: 13, color: ink, fontWeight: 500, lineHeight: 1.3, marginTop: 4 }}>{r.name}</div>
            <div style={{ fontSize: 11, color: fade, fontFamily: 'JetBrains Mono, monospace', marginTop: 'auto' }}>{r.period} · {r.pages}{typeof r.pages === 'number' ? ' pp' : ''}</div>
            <div style={{ fontSize: 11, color: teal, fontWeight: 500, paddingTop: 4, borderTop: `1px solid ${lineSoft}`, marginTop: 4 }}>Generate →</div>
          </div>
        ))}
      </div>
    </Card>

    <Card style={{ gridColumn: 'span 2', background: ink, color: '#fff', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Lock size={20} color={goldLine} />
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: goldLine, marginBottom: 6 }}>Audit trail</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 400, lineHeight: 1.3 }}>Every reading, every flag, every action. Traceable to source, immutable, exportable.</div>
          </div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9BA8B8', textAlign: 'right' }}>
          <div>2,148,632 events logged</div>
          <div style={{ marginTop: 4 }}>since 18 Mar 2025</div>
        </div>
      </div>
    </Card>
  </div>
);

// ──────────────────────────────────────────────────────────────
// App shell
// ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('operations');
  const tabs = [
    { id: 'operations', label: 'Operations' },
    { id: 'patterns', label: 'AI patterns' },
    { id: 'sampling', label: 'Sampling plan' },
    { id: 'reports', label: 'Reports & audit' },
  ];

  return (
    <div style={{ background: bg, minHeight: '100vh', color: ink, paddingBottom: 40 }}>
      <div style={{ background: ink, color: '#fff' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, letterSpacing: '-0.01em', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/donoriq-logo.svg"
                alt="DonorIQ"
                style={{ height: 26, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
              />
              <span style={{ color: goldLine, alignSelf: 'baseline' }}>·</span>
              <span style={{ fontStyle: 'italic', fontWeight: 400, alignSelf: 'baseline' }}>EM</span>
              <span style={{ fontSize: 10, color: '#9BA8B8', fontFamily: 'JetBrains Mono, monospace', fontStyle: 'normal', letterSpacing: '0.1em', marginLeft: 4, alignSelf: 'baseline' }}>BY IGNITEC</span>
            </div>
            <div style={{ height: 16, width: 1, background: '#ffffff22' }} />
            <div style={{ fontSize: 11, color: '#9BA8B8', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
              7 SOURCES · 12 SUITES · 247 SENSORS
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 11, color: '#9BA8B8', fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Circle size={6} fill={ok} stroke="none" /> All sources live</span>
            <span>18 MAY 2026 · 08:47 EST</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 28px 24px' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 12 }}>Environmental monitoring · operational view</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 44, fontWeight: 400, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Aseptic integrity, <span style={{ fontStyle: 'italic', color: teal }}>in real time</span>.
            </h1>
            <p style={{ color: muted, fontSize: 14, marginTop: 12, maxWidth: 680, lineHeight: 1.5 }}>
              Seven monitoring streams. One operational picture. Patterns surfaced before the next culture confirms them.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: muted }}>
            <span>WK 20 · 2026</span><ChevronRight size={14} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          <Kpi label="Facility risk score" value="34" unit="/100" delta="+6.2%" deltaDir="up" sublabel="vs. 7d avg" />
          <Kpi label="Open flags" value="04" delta="1 new · 47m" deltaDir="up" sublabel="from AI patterns" />
          <Kpi label="Sources connected" value="7/7" delta="all live" deltaDir="flat" sublabel="0 stale" />
          <Kpi label="Next AATB review" value="87" unit="d" delta="95/100 ready" deltaDir="down" sublabel="auto-generated" />
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${line}`, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none',
              borderBottom: tab === t.id ? `2px solid ${ink}` : '2px solid transparent',
              padding: '14px 22px', fontSize: 13, fontFamily: 'Geist, system-ui, sans-serif',
              color: tab === t.id ? ink : muted, fontWeight: tab === t.id ? 500 : 400,
              cursor: 'pointer', letterSpacing: '0.01em',
            }}>
              {t.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', padding: '14px 0', fontSize: 11, color: fade, fontFamily: 'JetBrains Mono, monospace' }}>
            v0.9.1 · build 2026.05.18
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
        {tab === 'operations' && <OperationsTab />}
        {tab === 'patterns' && <PatternsTab />}
        {tab === 'sampling' && <SamplingTab />}
        {tab === 'reports' && <ReportsTab />}
      </div>

    </div>
  );
}
