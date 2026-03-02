import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ScriptableContext,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import client from "../../axiosClient";
import * as dateUtil from "../../util/dateutil";
import {
  ChevronDown,
  CalendarDays,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  Tag,
  PieChart,
  BarChart2,
  Calculator,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
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

type Expense = {
  expense_id: number;
  amount: number;
  expense_category: string;
  expense_date: string;
  updated_at: string;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function sumField<T>(data: T[] | undefined, field: keyof T): number {
  if (!data || data.length === 0) return 0;
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

const EXPENSE_PALETTE = [
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#60a5fa",
  "#fb923c",
  "#4ade80",
];

const inputStyle: React.CSSProperties = {
  background: "#1a2035",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#e2e8f0",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  fontFamily: "Inter, sans-serif",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#475569",
  marginBottom: "6px",
  display: "block",
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
            const y = ctx.parsed.y ?? 0;
            if (ctx.dataset.label === "Income") {
              return `${ctx.dataset.label}: ₱${fmtFull(y)}`;
            }
            return `${ctx.dataset.label}: ${fmtFull(y)}`;
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
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${up ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
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

const EmptyChart: React.FC<{ message?: string }> = ({
  message = "No data for this month",
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-2">
    <span className="text-3xl opacity-30">📭</span>
    <p className="text-xs text-gray-500">{message}</p>
  </div>
);

// ── Capital Calculator ────────────────────────────────────────────────────────

const CapitalCalculator: React.FC<{
  totalExpenses: number;
  thisMonthExpenses: number;
}> = ({ totalExpenses, thisMonthExpenses }) => {
  const [revenue, setRevenue] = useState<string>("");
  const [capital, setCapital] = useState<string>("");

  const revenueNum = parseFloat(revenue) || 0;
  const capitalNum = parseFloat(capital) || 0;
  const net = revenueNum - thisMonthExpenses;
  const isProfit = net >= 0;
  const roi =
    capitalNum > 0
      ? ((revenueNum - capitalNum - thisMonthExpenses) / capitalNum) * 100
      : null;
  const roiPositive = roi !== null && roi >= 0;

  const focusGreen = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.border = "1px solid rgba(16,185,129,0.4)");
  const blurGray = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)");

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gray-900 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Calculator size={15} style={{ color: "#10b981" }} />
        <span className="text-sm font-semibold text-slate-200">
          Capital & Profit Calculator
        </span>
      </div>
      <p className="text-xs mb-5 text-gray-500">
        Enter this month's revenue and capital to see your net result
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <span style={labelStyle}>Monthly Revenue (₱)</span>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{ color: "#10b981" }}
            >
              ₱
            </span>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="e.g. 150000"
              min="0"
              style={{ ...inputStyle, paddingLeft: "28px" }}
              onFocus={focusGreen}
              onBlur={blurGray}
            />
          </div>
        </div>
        <div>
          <span style={labelStyle}>Starting Capital (₱)</span>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{ color: "#a78bfa" }}
            >
              ₱
            </span>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="e.g. 100000"
              min="0"
              style={{ ...inputStyle, paddingLeft: "28px" }}
              onFocus={focusGreen}
              onBlur={blurGray}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown size={12} style={{ color: "#ef4444" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#ef4444" }}
            >
              This Month
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            ₱{fmtCompact(thisMonthExpenses)}
          </div>
          <div className="text-[10px] mt-0.5 text-gray-500">Total expenses</div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(251,191,36,0.07)",
            border: "1px solid rgba(251,191,36,0.15)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Wallet size={12} style={{ color: "#fbbf24" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#fbbf24" }}
            >
              All Time
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            ₱{fmtCompact(totalExpenses)}
          </div>
          <div className="text-[10px] mt-0.5 text-gray-500">Total spent</div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: isProfit
              ? "rgba(16,185,129,0.07)"
              : "rgba(239,68,68,0.07)",
            border: `1px solid ${isProfit ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            {isProfit ? (
              <TrendingUp size={12} style={{ color: "#10b981" }} />
            ) : (
              <TrendingDown size={12} style={{ color: "#ef4444" }} />
            )}
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: isProfit ? "#10b981" : "#ef4444" }}
            >
              Net {isProfit ? "Profit" : "Loss"}
            </span>
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: isProfit ? "#10b981" : "#ef4444" }}
          >
            {revenueNum > 0
              ? `${isProfit ? "+" : ""}₱${fmtCompact(Math.abs(net))}`
              : "—"}
          </div>
          <div className="text-[10px] mt-0.5 text-gray-500">
            Revenue − expenses
          </div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: roiPositive
              ? "rgba(99,102,241,0.07)"
              : "rgba(239,68,68,0.07)",
            border: `1px solid ${roiPositive ? "rgba(99,102,241,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp
              size={12}
              style={{ color: roiPositive ? "#818cf8" : "#ef4444" }}
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: roiPositive ? "#818cf8" : "#ef4444" }}
            >
              ROI
            </span>
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: roiPositive ? "#818cf8" : "#ef4444" }}
          >
            {roi !== null ? `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] mt-0.5 text-gray-500">
            Return on capital
          </div>
        </div>
      </div>

      {revenueNum > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-[10px] mb-1.5 text-gray-500">
            <span>Expenses vs Revenue</span>
            <span style={{ color: isProfit ? "#10b981" : "#ef4444" }}>
              {`${Math.min(100, (thisMonthExpenses / revenueNum) * 100).toFixed(1)}% spent`}
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (thisMonthExpenses / revenueNum) * 100)}%`,
                background: isProfit
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #ef4444, #f87171)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Expense Analytics Section ─────────────────────────────────────────────────

const ExpenseAnalytics: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.expense_category] =
        (map[e.expense_category] || 0) + Number(e.amount);
    });
    return map;
  }, [expenses]);

  const categoryLabels = Object.keys(categoryTotals);
  const categoryValues = categoryLabels.map((k) => categoryTotals[k]);

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: EXPENSE_PALETTE.slice(0, categoryLabels.length).map(
          (c) => `${c}bb`,
        ),
        borderColor: EXPENSE_PALETTE.slice(0, categoryLabels.length),
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOpts: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: P.muted,
          font: { family: "Inter, sans-serif", size: 10 },
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 12,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: P.text,
        bodyColor: P.muted,
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
        callbacks: { label: (ctx) => ` ₱${fmtFull(ctx.parsed)}` },
      },
    },
  };

  const monthlyTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const d = new Date(e.expense_date);
      const key = d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
      });
      map[key] = (map[key] || 0) + Number(e.amount);
    });
    return Object.entries(map).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );
  }, [expenses]);

  const barData = {
    labels: monthlyTotals.map(([k]) => k),
    datasets: [
      {
        label: "Total Expenses",
        data: monthlyTotals.map(([, v]) => v),
        backgroundColor: monthlyTotals.map(
          (_, i) => `${EXPENSE_PALETTE[i % EXPENSE_PALETTE.length]}66`,
        ),
        borderColor: monthlyTotals.map(
          (_, i) => EXPENSE_PALETTE[i % EXPENSE_PALETTE.length],
        ),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false as const,
      },
    ],
  };

  const expenseBarOpts: ChartOptions<"bar"> = {
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
        padding: 10,
        callbacks: {
          label: (ctx) => {
            if (ctx) {
              return ` ₱${fmtFull(Number(ctx.parsed.y))}`;
            }

            return String(0);
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
        ticks: {
          color: P.muted,
          font: { family: "Inter, sans-serif", size: 11 },
          callback: (val) =>
            `₱${new Intl.NumberFormat("en-US", { notation: "compact" }).format(val as number)}`,
        },
      },
    },
  };

  const totalAll = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount), 0),
    [expenses],
  );

  const thisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.expense_date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, e) => s + Number(e.amount), 0);
  }, [expenses]);

  const empty = expenses.length === 0;

  return (
    <div className="mt-10">
      {/* ── Section divider ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <Receipt size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Expense Overview
            </h2>
            <p className="text-xs text-gray-500">
              Breakdown of all recorded business expenses
            </p>
          </div>
        </div>
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      </div>

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Records",
            value: expenses.length.toString(),
            color: "#22d3ee",
            icon: <Receipt size={13} />,
          },
          {
            label: "Total Spent",
            value: `₱${fmtCompact(totalAll)}`,
            color: "#f472b6",
            icon: <Wallet size={13} />,
          },
          {
            label: "This Month",
            value: `₱${fmtCompact(thisMonth)}`,
            color: "#fbbf24",
            icon: <CalendarDays size={13} />,
          },
          {
            label: "Categories",
            value: categoryLabels.length.toString(),
            color: "#a78bfa",
            icon: <Tag size={13} />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 flex items-center gap-3 border border-white/[0.06] bg-gray-900"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}18`, color: s.color }}
            >
              {s.icon}
            </div>
            <div>
              <div className="text-base font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Expense charts ── */}
      {empty ? (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 gap-3 border border-white/[0.06] bg-gray-900">
          <span className="text-4xl opacity-20">📊</span>
          <p className="text-sm text-gray-500">
            No expense data to display yet
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
            {/* Doughnut */}
            <div className="rounded-2xl border border-white/[0.06] bg-gray-900 p-5">
              <div className="flex items-center gap-2 mb-1">
                <PieChart size={14} style={{ color: "#10b981" }} />
                <span className="text-sm font-semibold text-slate-200">
                  Expenses by Category
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Distribution of spend across categories
              </p>
              <div className="relative h-64 w-full">
                {categoryLabels.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <Doughnut data={doughnutData} options={doughnutOpts} />
                )}
              </div>
            </div>

            {/* Monthly bar */}
            <div className="rounded-2xl border border-white/[0.06] bg-gray-900 p-5">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 size={14} style={{ color: "#10b981" }} />
                <span className="text-sm font-semibold text-slate-200">
                  Monthly Expense Trend
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Total spending per month
              </p>
              <div className="relative h-64 w-full">
                {monthlyTotals.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <Bar data={barData} options={expenseBarOpts} />
                )}
              </div>
            </div>
          </div>

          {/* Capital Calculator — full width */}
          <CapitalCalculator
            totalExpenses={totalAll}
            thisMonthExpenses={thisMonth}
          />
        </>
      )}
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | undefined>(
    undefined,
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await client.get("/sales/total");
      setDashboardData(response.data.sales);
    };
    const fetchExpenses = async () => {
      try {
        const res = await client.get("/expenses");
        setExpenses(res.data);
      } catch {
        // expenses section will show empty state
      }
    };
    fetchData();
    fetchExpenses();
  }, []);

  // ── Month filter ──────────────────────────────────────────────────────
  const availableMonths = useMemo(() => {
    const monthly = dashboardData?.monthly ?? [];
    return monthly
      .filter((m) => Number(m.sales) > 0 || Number(m.income) > 0)
      .map((m) => m.label);
  }, [dashboardData?.monthly]);

  const filteredMonthly = useMemo(() => {
    const monthly = dashboardData?.monthly ?? [];
    if (selectedMonth === "all") return monthly;
    return monthly.filter((m) => m.label === selectedMonth);
  }, [dashboardData?.monthly, selectedMonth]);

  const filteredWeekly = useMemo(() => {
    const weekly = dashboardData?.weekly ?? [];
    if (selectedMonth === "all") return weekly;
    return weekly.filter((w) => w.label.includes(selectedMonth));
  }, [dashboardData?.weekly, selectedMonth]);

  const filteredDaily = useMemo(() => {
    const daily = dashboardData?.daily ?? [];
    if (selectedMonth === "all") return daily;
    return daily.filter((d) => d.label.includes(selectedMonth));
  }, [dashboardData?.daily, selectedMonth]);

  const filteredTopProducts = useMemo(
    () => dashboardData?.topProducts ?? [],
    [dashboardData?.topProducts],
  );

  // ── Stat card values ──────────────────────────────────────────────────
  const monthly = dashboardData?.monthly ?? [];
  const half = Math.floor(monthly.length / 2);
  const curr = monthly.slice(half);
  const prev = monthly.slice(0, half);
  const statMonthly = selectedMonth === "all" ? monthly : filteredMonthly;

  const currSales = useMemo(() => {
    if (selectedMonth === "all") return sumField(curr, "income");
    return sumField(filteredMonthly, "income");
  }, [curr, filteredMonthly, selectedMonth]);

  const prevSales = useMemo(() => {
    if (selectedMonth === "all") return sumField(prev, "income");
    const idx = monthly.findIndex((m) => m.label === selectedMonth);
    const prevMonth = idx > 0 ? [monthly[idx - 1]] : [];
    return sumField(prevMonth, "income");
  }, [prev, monthly, selectedMonth]);

  const totalQuantity = useMemo(
    () => statMonthly.reduce((acc, m) => Number(m.sales) + acc, 0),
    [statMonthly],
  );

  const previousQuantity = useMemo(() => {
    if (selectedMonth === "all") return 0;
    const idx = monthly.findIndex((m) => m.label === selectedMonth);
    return idx > 0 ? Number(monthly[idx - 1].sales) : 0;
  }, [monthly, selectedMonth]);

  const avgCurr =
    filteredMonthly.length > 0
      ? Math.round(currSales / filteredMonthly.length)
      : 0;
  const avgPrev = prev.length > 0 ? Math.round(prevSales / prev.length) : 0;

  // ── Chart data ────────────────────────────────────────────────────────
  const monthlySalesData = useMemo(
    () => ({
      labels: filteredMonthly.map((d) => d.label),
      datasets: [
        {
          label: "Quantity Sold",
          data: filteredMonthly.map((d) => Number(d.sales)),
          backgroundColor: `${P.cyan}44`,
          borderColor: P.cyan,
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false as const,
        },
        {
          label: "Income",
          data: filteredMonthly.map((d) => Number(d.income)),
          backgroundColor: `${P.violet}44`,
          borderColor: P.violet,
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false as const,
        },
      ],
    }),
    [filteredMonthly],
  );

  const weeklyLineData = useMemo(
    () => ({
      labels: filteredWeekly.map((d) => d.label),
      datasets: [
        {
          label: "Quantity Sold",
          data: filteredWeekly.map((d) => Number(d.total_sales)),
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
          data: filteredWeekly.map((d) => Number(d.income)),
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
    [filteredWeekly],
  );

  const dailyGradientData = useMemo(
    () => ({
      labels: filteredDaily.map((d) => d.label),
      datasets: [
        {
          label: "Daily Income",
          data: filteredDaily.map((d) => Number(d.income)),
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
    [filteredDaily],
  );

  const topProductsData = useMemo(
    () => ({
      labels: filteredTopProducts.map((p) => p.name),
      datasets: [
        {
          label: "Units Sold",
          data: filteredTopProducts.map((p) => Number(p.unitssold)),
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
    [filteredTopProducts],
  );

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

  const selectedLabel = selectedMonth === "all" ? "All Months" : selectedMonth;

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-slate-100">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Real-time performance overview · {dateUtil.currentMonth()}
          </p>
        </div>

        {/* Month filter */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-gray-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-white/[0.14] hover:bg-gray-800"
          >
            <CalendarDays size={14} className="text-cyan-400" />
            {selectedLabel}
            <ChevronDown
              size={13}
              className={`ml-1 text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-gray-900 shadow-2xl"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            >
              <button
                onClick={() => {
                  setSelectedMonth("all");
                  setDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.05]"
                style={{
                  color: selectedMonth === "all" ? P.cyan : "#94a3b8",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                All Months
                {selectedMonth === "all" && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: P.cyan }}
                  />
                )}
              </button>
              {availableMonths.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-600">
                  No sales data yet
                </div>
              ) : (
                availableMonths.map((month) => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(month);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.05]"
                    style={{
                      color: selectedMonth === month ? P.cyan : "#94a3b8",
                    }}
                  >
                    {month}
                    {selectedMonth === month && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: P.cyan }}
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active filter pill */}
      {selectedMonth !== "all" && (
        <div className="mb-5 flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtering by:</span>
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "rgba(34,211,238,0.1)",
              color: P.cyan,
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            <CalendarDays size={10} />
            {selectedMonth}
            <button
              onClick={() => setSelectedMonth("all")}
              className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </span>
        </div>
      )}

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

      {/* Sales Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Monthly Sales vs Income"
          subtitle={
            selectedMonth === "all" ? "Full year overview" : selectedMonth
          }
        >
          {filteredMonthly.length === 0 ? (
            <EmptyChart />
          ) : (
            <Bar data={monthlySalesData} options={barOpts} />
          )}
        </ChartCard>
        <ChartCard
          title="Weekly Trend"
          subtitle={
            selectedMonth === "all" ? "8-week rolling view" : selectedMonth
          }
        >
          {filteredWeekly.length === 0 ? (
            <EmptyChart />
          ) : (
            <Line data={weeklyLineData} options={lineOpts} />
          )}
        </ChartCard>
        <ChartCard
          title="Daily Income"
          subtitle={selectedMonth === "all" ? "This week" : selectedMonth}
        >
          {filteredDaily.length === 0 ? (
            <EmptyChart />
          ) : (
            <Line data={dailyGradientData} options={lineOpts} />
          )}
        </ChartCard>
        <div className="rounded-2xl border border-white/[0.06] bg-gray-900 p-5">
          <div className="mb-1 text-sm font-semibold text-slate-200">
            Top Products
          </div>
          <div className="mb-4 text-xs text-gray-500">By units sold</div>
          <div className="relative h-64 w-full">
            {filteredTopProducts.length === 0 ? (
              <EmptyChart />
            ) : (
              <Bar data={topProductsData} options={horizBarOpts} />
            )}
          </div>
        </div>
      </div>

      {/* ── Expense Analytics ── */}
      <ExpenseAnalytics expenses={expenses} />

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-600">
        Data refreshed · Feb 2026 · Analytics Dashboard v1.0
      </div>
    </div>
  );
};

export default Dashboard;
