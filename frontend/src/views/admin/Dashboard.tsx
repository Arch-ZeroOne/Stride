import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ScriptableContext,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import client from "../../axiosClient";

/*
 ! Dashboard Issues
 ! Weekly trend not formatted into actual week string format
 ! Bar line in amount sold lighting up (maybe because of incorrect calculation)
 

*/
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export interface MonthlySale {
  label: string;
  sales: string;
  income: string;
}

export interface WeeklySale {
  weekly: string;
  label: string;
  total_sales: string;
  income: string;
}

export interface DailySale {
  daily: string;
  label: string;
  sales: string;
  income: string;
}

export interface TopProduct {
  name: string;
  unitssold: string;
  revenue: string;
}
export interface totalQuantity {
  count: number;
}
export interface DashboardData {
  monthly: MonthlySale[];
  weekly: WeeklySale[];
  daily: DailySale[];
  topProducts: TopProduct[];
  totalQuantity?: totalQuantity[];
}

// ── helpers ───────────────────────────────────────────────────────────────────

function sumField<T>(data: T[] | undefined, field: keyof T): number {
  if (!data || data.length === 0) return 0;
  console.log(data);
  return data.reduce((acc, item) => acc + Number(item[field]), 0);
}

function calcGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

function fmtCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function fmtFull(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

const P = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#fbbf24",
  pink: "#f472b6",
  border: "rgba(255,255,255,0.06)",
  muted: "#6b7280",
  text: "#f1f5f9",
};

function sharedOptions(yLabel = "Revenue"): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: P.muted,
          font: { family: "Inter, sans-serif", size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: P.text,
        bodyColor: P.muted,
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const y = ctx.parsed.y ?? 0; // fallback to 0 if null
            return ` ${ctx.dataset.label}: ₱${fmtFull(y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: P.border },
        ticks: {
          color: P.muted,
          font: { family: "Inter, sans-serif", size: 11 },
        },
      },
      y: {
        grid: { color: P.border },
        title: {
          display: true,
          text: yLabel,
          color: P.muted,
          font: { size: 11 },
        },
        ticks: {
          color: P.muted,
          font: { family: "Inter, sans-serif", size: 11 },
          callback: (val) =>
            `₱${new Intl.NumberFormat("en-US", { notation: "compact" }).format(val as number)}`,
        },
      },
    },
  };
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  current: number;
  previous: number;
  prefix?: string;
  glowClass: string;
  barClass: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  current,
  previous,
  prefix = "₱",
  glowClass,
  barClass,
  icon,
}) => {
  const growth = calcGrowth(current, previous);
  const up = growth >= 0;
  const barPct =
    previous > 0 ? Math.min(100, (current / (previous * 1.5)) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900 p-5">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${glowClass}`}
      />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            up
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {up ? "↑" : "↓"} {Math.abs(growth)}%
        </span>
      </div>
      <div className="mb-0.5 text-3xl font-bold tracking-tight text-slate-100">
        {prefix}
        {fmtCompact(current)}
      </div>
      <div className="mb-3 text-sm text-gray-400">{title}</div>
      <div className="mb-2 text-xs text-gray-500">
        vs prev period:{" "}
        <span className={up ? "text-emerald-400" : "text-red-400"}>
          {up ? "+" : ""}
          {growth}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
};

// ── ChartCard ─────────────────────────────────────────────────────────────────

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className = "",
}) => (
  <div
    className={`rounded-2xl border border-white/[0.06] bg-gray-900 p-5 ${className}`}
  >
    <div className="mb-1 text-sm font-semibold text-slate-200">{title}</div>
    {subtitle && <div className="mb-4 text-xs text-gray-500">{subtitle}</div>}
    <div className="relative h-64 w-full">{children}</div>
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | undefined>(
    undefined,
  );

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      const response = await client.get("/sales/total");

      setDashboardData(response.data.sales);
    };
    fetchData();
  }, []);

  // ── Stat card values ────────────────────────────────────────────────────────
  const monthly = dashboardData?.monthly ?? [];
  const half = Math.floor(monthly.length / 2);

  const curr = monthly.slice(half);
  const prev = monthly.slice(0, half);

  const currSales = useMemo(() => sumField(curr, "income"), [curr]);
  const prevSales = useMemo(() => sumField(prev, "income"), [prev]);
  const totalQuantity = monthly.reduce(
    (acc, curr) => Number(curr.sales) + acc,
    0,
  );

  const previousQuantity = monthly.reduce((acc, curr) => {
    const today = new Date();
    const localDateString = today.toLocaleString("default", { month: "long" });
    const split = localDateString.split(" ");
    const month = split[0];

    if (curr.label !== month) {
      return Number(curr.sales) + acc;
    }

    return acc;
  }, 0);

  const avgCurr = curr.length > 0 ? Math.round(currSales / curr.length) : 0;
  const avgPrev = prev.length > 0 ? Math.round(prevSales / prev.length) : 0;

  // ── Chart data ──────────────────────────────────────────────────────────────
  const monthlySalesData = useMemo(
    () => ({
      labels: (dashboardData?.monthly ?? []).map((d) => d.label),
      datasets: [
        {
          label: "Quantity Sold",
          data: (dashboardData?.monthly ?? []).map((d) => Number(d.sales)),
          backgroundColor: `${P.cyan}44`,
          borderColor: P.cyan,
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false as const,
        },
        {
          label: "Income",
          data: (dashboardData?.monthly ?? []).map((d) => Number(d.income)),
          backgroundColor: `${P.violet}44`,
          borderColor: P.violet,
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false as const,
        },
      ],
    }),
    [dashboardData?.monthly],
  );

  const weeklyLineData = useMemo(
    () => ({
      labels: (dashboardData?.weekly ?? []).map((d) => d.label),
      datasets: [
        {
          label: "Quantity Sold",
          data: (dashboardData?.weekly ?? []).map((d) => Number(d.total_sales)),
          borderColor: P.emerald,
          backgroundColor: `${P.emerald}22`,
          pointBackgroundColor: P.emerald,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Income",
          data: (dashboardData?.weekly ?? []).map((d) => Number(d.income)),
          borderColor: P.amber,
          backgroundColor: `${P.amber}22`,
          pointBackgroundColor: P.amber,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    }),
    [dashboardData?.weekly],
  );

  const dailyGradientData = useMemo(
    () => ({
      labels: (dashboardData?.daily ?? []).map((d) => d.label),
      datasets: [
        {
          label: "Daily Income",
          data: (dashboardData?.daily ?? []).map((d) => Number(d.income)),
          borderColor: P.pink,
          backgroundColor: (ctx: ScriptableContext<"line">) => {
            const { ctx: c, chartArea } = ctx.chart;
            if (!chartArea) return `${P.pink}33`;
            const g = c.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            g.addColorStop(0, `${P.pink}99`);
            g.addColorStop(1, `${P.pink}00`);
            return g;
          },
          fill: true,
          pointBackgroundColor: P.pink,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.45,
          borderWidth: 2.5,
        },
      ],
    }),
    [dashboardData?.daily],
  );

  const topProductsData = useMemo(
    () => ({
      labels: (dashboardData?.topProducts ?? []).map((p) => p.name),
      datasets: [
        {
          label: "Units Sold",
          data: (dashboardData?.topProducts ?? []).map((p) =>
            Number(p.unitssold),
          ),
          backgroundColor: [
            `${P.cyan}bb`,
            `${P.violet}bb`,
            `${P.emerald}bb`,
            `${P.amber}bb`,
            `${P.pink}bb`,
            `${P.cyan}66`,
          ],
          borderColor: [P.cyan, P.violet, P.emerald, P.amber, P.pink, P.cyan],
          borderWidth: 1.5,
          borderRadius: 4,
        },
      ],
    }),
    [dashboardData?.topProducts],
  );

  // ── Chart options ───────────────────────────────────────────────────────────
  const lineOpts = useMemo(() => sharedOptions("Revenue (₱)"), []);
  const barOpts = useMemo(
    () => sharedOptions("Revenue (₱)") as unknown as ChartOptions<"bar">,
    [],
  );
  const horizBarOpts: ChartOptions<"bar"> = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          titleColor: P.text,
          bodyColor: P.muted,
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: { color: P.border },
          ticks: {
            color: P.muted,
            font: { family: "Inter, sans-serif", size: 11 },
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: P.text,
            font: { family: "Inter, sans-serif", size: 11 },
          },
        },
      },
    }),
    [],
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 p-6 text-slate-100">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Real-time performance overview · February 2026
          </p>
        </div>
        <div className="relative">
          <label className="sr-only">View Period</label>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Sales"
          current={currSales}
          previous={prevSales}
          glowClass="bg-cyan-500/10"
          barClass="bg-cyan-400"
          icon="💰"
        />
        <StatCard
          title="Avg Order Value"
          current={avgCurr}
          previous={avgPrev}
          glowClass="bg-emerald-500/10"
          barClass="bg-emerald-400"
          icon="🛒"
        />
        <StatCard
          title="Total Amount Sold"
          current={totalQuantity}
          previous={previousQuantity}
          prefix=""
          glowClass="bg-amber-500/10"
          barClass="bg-amber-400"
          icon="📊"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Monthly Sales vs Income"
          subtitle="Full year overview"
        >
          <Bar data={monthlySalesData} options={barOpts} />
        </ChartCard>

        <ChartCard title="Weekly Trend" subtitle="8-week rolling view">
          <Line data={weeklyLineData} options={lineOpts} />
        </ChartCard>

        <ChartCard title="Daily Income" subtitle="This week">
          <Line data={dailyGradientData} options={lineOpts} />
        </ChartCard>

        <div className="rounded-2xl border border-white/[0.06] bg-gray-900 p-5">
          <div className="mb-1 text-sm font-semibold text-slate-200">
            Top Products
          </div>
          <div className="mb-4 text-xs text-gray-500">By units sold</div>
          <div className="relative h-64 w-full">
            <Bar data={topProductsData} options={horizBarOpts} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-600">
        Data refreshed · Feb 2026 · Analytics Dashboard v1.0
      </div>
    </div>
  );
};

export default Dashboard;
