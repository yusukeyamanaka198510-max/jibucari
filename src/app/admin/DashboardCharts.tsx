import type { MonthlyUserPoint, MonthlyAccessPoint, EduSegment } from "@/lib/adminMockData";

// ── Utility ───────────────────────────────────────────────────────────────────

function fmtMonth(m: string) {
  const mo = m.split("-")[1] ?? "0";
  return `${parseInt(mo)}月`;
}

// ── User Registration Trend (line + bar combo) ────────────────────────────────

export function UserTrendChart({ data }: { data: MonthlyUserPoint[] }) {
  const VW = 500, VH = 200;
  const PL = 36, PR = 14, PT = 28, PB = 30;
  const CW = VW - PL - PR; // 450
  const CH = VH - PT - PB; // 142

  if (!data.length) return null;

  const n = data.length;
  const maxCum = Math.max(...data.map((d) => d.cumulative), 1);
  const maxNew = Math.max(...data.map((d) => d.new), 1);

  const xOf = (i: number) =>
    n === 1 ? PL + CW / 2 : PL + (i / (n - 1)) * CW;
  const yCum = (v: number) => PT + (1 - v / maxCum) * CH;

  const BAR_MAX_H = CH * 0.30;
  const yBarTop = (v: number) => PT + CH - (v / maxNew) * BAR_MAX_H;
  const hBar = (v: number) => (v / maxNew) * BAR_MAX_H;
  const BW = Math.min((CW / n) * 0.5, 44);

  const linePts = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yCum(d.cumulative).toFixed(1)}`)
    .join(" ");
  const areaPts = `${linePts} L${xOf(n - 1).toFixed(1)},${(PT + CH).toFixed(1)} L${xOf(0).toFixed(1)},${(PT + CH).toFixed(1)} Z`;

  const gridVals = [0, Math.round(maxCum / 2), maxCum];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full">
      <defs>
        <linearGradient id="userAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines + Y labels */}
      {gridVals.map((v, idx) => (
        <g key={idx}>
          <line
            x1={PL} y1={yCum(v)} x2={VW - PR} y2={yCum(v)}
            stroke="#f1f5f9" strokeWidth="1"
          />
          <text x={PL - 5} y={yCum(v) + 3.5} textAnchor="end" fontSize="9.5" fill="#cbd5e1">
            {v}
          </text>
        </g>
      ))}

      {/* New-user bars */}
      {data.map((d, i) => (
        <g key={`bar${i}`}>
          <rect
            x={xOf(i) - BW / 2}
            y={yBarTop(d.new)}
            width={BW}
            height={hBar(d.new)}
            fill="#c7d2fe"
            rx="3"
            opacity="0.85"
          />
          {d.new > 0 && (
            <text
              x={xOf(i)}
              y={yBarTop(d.new) - 3}
              textAnchor="middle"
              fontSize="9"
              fill="#a5b4fc"
            >
              +{d.new}
            </text>
          )}
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPts} fill="url(#userAreaGrad)" />

      {/* Line */}
      <path
        d={linePts}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots + value labels */}
      {data.map((d, i) => (
        <g key={`pt${i}`}>
          <circle
            cx={xOf(i)} cy={yCum(d.cumulative)}
            r="4.5" fill="#6366f1" stroke="white" strokeWidth="2"
          />
          <text
            x={xOf(i)} y={yCum(d.cumulative) - 9}
            textAnchor="middle" fontSize="11" fontWeight="600" fill="#4338ca"
          >
            {d.cumulative}
          </text>
        </g>
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={`xl${i}`} x={xOf(i)} y={VH - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
          {fmtMonth(d.month)}
        </text>
      ))}
    </svg>
  );
}

// ── Access Count Trend (stacked bar) ─────────────────────────────────────────

export function AccessTrendChart({ data }: { data: MonthlyAccessPoint[] }) {
  const VW = 500, VH = 200;
  const PL = 36, PR = 14, PT = 20, PB = 30;
  const CW = VW - PL - PR;
  const CH = VH - PT - PB;

  if (!data.length) return null;

  const n = data.length;
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const BW = Math.min((CW / n) * 0.62, 56);
  const xCenter = (i: number) => PL + (i + 0.5) * (CW / n);
  const toH = (v: number) => (v / maxTotal) * CH;

  const base = PT + CH;
  const gridVals = [0, Math.round(maxTotal / 2), maxTotal];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full">
      {/* Grid lines + Y labels */}
      {gridVals.map((v, idx) => {
        const gy = PT + (1 - v / maxTotal) * CH;
        return (
          <g key={idx}>
            <line x1={PL} y1={gy} x2={VW - PR} y2={gy} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PL - 5} y={gy + 3.5} textAnchor="end" fontSize="9.5" fill="#cbd5e1">
              {v}
            </text>
          </g>
        );
      })}

      {/* Stacked bars */}
      {data.map((d, i) => {
        const cx = xCenter(i);
        const bx = cx - BW / 2;

        const otherCount = d.total - d.pdf - d.interview - d.resume;
        const pdfH = toH(d.pdf);
        const intH = toH(d.interview);
        const resH = toH(d.resume);
        const othH = toH(Math.max(otherCount, 0));
        const totalH = toH(d.total);

        // Stack from bottom: pdf → interview → resume → other
        const pdfY = base - pdfH;
        const intY = pdfY - intH;
        const resY = intY - resH;
        const othY = resY - othH;
        const topY = base - totalH;

        return (
          <g key={`bar${i}`}>
            {d.pdf > 0 && (
              <rect x={bx} y={pdfY} width={BW} height={pdfH} fill="#6366f1" />
            )}
            {d.interview > 0 && (
              <rect x={bx} y={intY} width={BW} height={intH} fill="#a855f7" />
            )}
            {d.resume > 0 && (
              <rect x={bx} y={resY} width={BW} height={resH} fill="#10b981" />
            )}
            {othH > 0 && (
              <rect x={bx} y={othY} width={BW} height={othH} fill="#e2e8f0" rx="2" />
            )}
            {/* Rounded top cap */}
            {d.total > 0 && (
              <rect x={bx} y={topY} width={BW} height={4} fill={othH > 0 ? "#e2e8f0" : resH > 0 ? "#10b981" : intH > 0 ? "#a855f7" : "#6366f1"} rx="2" />
            )}
            {/* Total label */}
            {d.total > 0 && (
              <text
                x={cx} y={topY - 5}
                textAnchor="middle" fontSize="10" fontWeight="600" fill="#475569"
              >
                {d.total}
              </text>
            )}
          </g>
        );
      })}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={`xl${i}`} x={xCenter(i)} y={VH - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
          {fmtMonth(d.month)}
        </text>
      ))}
    </svg>
  );
}

// ── Education Segment (horizontal bars) ──────────────────────────────────────

export function EducationSegmentChart({ data }: { data: EduSegment[] }) {
  return (
    <div className="space-y-4">
      {data.map((seg) => (
        <div key={seg.key}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-sm font-medium text-slate-700 truncate">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 ml-2">
              <span className="text-xs text-slate-400">{seg.count}人</span>
              <span
                className="text-sm font-bold w-10 text-right"
                style={{ color: seg.color }}
              >
                {seg.percent}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
