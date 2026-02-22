# 🔧 TypeScript Type Fixes — Before & After

Every type error in the dashboard, explained with before/after comparisons.

---

## Fix 1: `sumField` — Generic Function with Typed Field

### ❌ Before

```ts
function sumField(data, field) {
  return data.reduce((acc, item) => acc + item[field], 0);
}
```

**Problems:**

- `data` has no type → TypeScript has no idea what's inside the array
- `field` has no type → you could pass `"banana"` and TypeScript wouldn't complain
- `item[field]` could be a string → `"699000" + "333000"` = `"699000333000"` (string concat, not addition)
- If `data` is `undefined`, calling `.reduce` crashes immediately

### ✅ After

```ts
function sumField<T>(data: T[] | undefined, field: keyof T): number {
  if (!data || data.length === 0) return 0;
  return data.reduce((acc, item) => acc + Number(item[field]), 0);
}
```

**What changed:**

- `<T>` — a **generic** type placeholder. When you call `sumField(curr, "sales")`, TypeScript automatically figures out `T = MonthlySale`
- `data: T[] | undefined` — data is either an array of T, or undefined (safe either way)
- `field: keyof T` — field must be an actual key that exists on T. Pass `"banana"` on a `MonthlySale` → TypeScript error immediately
- `Number(item[field])` — converts string `"699000"` to real number `699000` before adding
- Guard at top → returns `0` if data is missing instead of crashing

---

## Fix 2: `calcGrowth` — Typed Parameters and Return

### ❌ Before

```ts
function calcGrowth(current, previous) {
  if (previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}
```

**Problems:**

- Both params are implicitly `any` → you could pass a string, an object, anything
- No return type declared → TypeScript has to guess

### ✅ After

```ts
function calcGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}
```

**What changed:**

- `current: number, previous: number` — both must be real numbers, no accidents
- `: number` at the end — the return value is guaranteed to be a number

---

## Fix 3: `fmtCompact` and `fmtFull` — Typed Input and Output

### ❌ Before

```ts
function fmtCompact(n) { ... }
function fmtFull(n) { ... }
```

**Problem:** `n` is `any`. Could receive a string like `"699000"` and silently format it wrong.

### ✅ After

```ts
function fmtCompact(n: number): string { ... }
function fmtFull(n: number): string { ... }
```

**What changed:**

- `n: number` — only accepts real numbers
- `: string` — TypeScript knows these functions return text

---

## Fix 4: `sharedOptions` — Chart Type Safety

### ❌ Before

```ts
function sharedOptions(yLabel = "Revenue") {
  return { ... }
}
```

**Problems:**

- Return type is inferred as a plain object
- When passed to `<Bar>` or `<Line>`, TypeScript can't verify the options are valid for that chart type
- The `callback: (val) => ...` in ticks had `val` typed as `any`

### ✅ After

```ts
function sharedOptions(yLabel = "Revenue"): ChartOptions<"line"> {
  return {
    ...
    ticks: {
      callback: (val) =>
        `$${new Intl.NumberFormat("en-US", { notation: "compact" }).format(val as number)}`,
    },
  };
}
```

**What changed:**

- `: ChartOptions<"line">` — explicitly tells TypeScript this object matches Chart.js's expected shape for a line chart
- `val as number` — the tick callback receives `string | number`, we assert it's a number since our Y axis is always numeric

---

## Fix 5: `StatCard` Props Interface

### ❌ Before

```ts
const StatCard = ({ title, current, previous, prefix, glowClass, barClass, icon }) => {
```

**Problem:** All props are `any`. TypeScript can't warn you if you forget a required prop or pass the wrong type.

### ✅ After

```ts
interface StatCardProps {
  title: string;
  current: number;
  previous: number;
  prefix?: string;      // ← the ? means optional (defaults to "$")
  glowClass: string;
  barClass: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ ... }) => {
```

**What changed:**

- Every prop now has a declared type
- `prefix?: string` — the `?` means optional. If you don't pass it, it uses the default `"$"`
- `React.FC<StatCardProps>` — tells React this component accepts exactly these props

---

## Fix 6: `ChartCard` Props Interface

### ❌ Before

```ts
const ChartCard = ({ title, subtitle, children, className }) => (
```

**Problem:** Same as above — all `any`.

### ✅ After

```ts
interface ChartCardProps {
  title: string;
  subtitle?: string;           // optional
  children: React.ReactNode;   // anything React can render
  className?: string;          // optional CSS classes
}

const ChartCard: React.FC<ChartCardProps> = ({ ... }) => (
```

**What changed:**

- `children: React.ReactNode` — this is the correct type for "anything you can put inside a JSX tag" (text, other components, etc.)
- Both `subtitle` and `className` are optional with `?`

---

## Fix 7: `DashboardData` State — Allow `undefined`

### ❌ Before

```ts
const [dashboardData, setDashboardData] = useState<DashboardData>();
```

**Problem:** TypeScript infers the state as `DashboardData | undefined` but the code didn't consistently handle the `undefined` case, leading to potential crashes on access.

### ✅ After

```ts
const [dashboardData, setDashboardData] = useState<DashboardData | undefined>(
  undefined,
);
```

**What changed:**

- The `| undefined` is now **explicit** in the type — makes it crystal clear to anyone reading the code that this can be empty
- The initial value `undefined` is also explicit — no ambiguity
- All downstream accesses use `??` fallbacks:
  ```ts
  const monthly = dashboardData?.monthly ?? [];
  //                            ^           ^
  //                     optional chain    fallback to empty array
  ```

---

## Fix 8: `borderSkipped` — Literal Type

### ❌ Before

```ts
borderSkipped: false,
```

**Problem:** TypeScript widens `false` to `boolean`. Chart.js expects the literal type `false`, not just any boolean. This causes a type mismatch error.

### ✅ After

```ts
borderSkipped: false as const,
```

**What changed:**

- `as const` tells TypeScript "this is literally the value `false`, not just any boolean"
- Now matches Chart.js's expected type exactly

---

## Fix 9: `barOpts` — Bar Chart Type Cast

### ❌ Before

```ts
const barOpts = useMemo(() => sharedOptions("Revenue ($)"), []);
// then passed directly to <Bar data={...} options={barOpts} />
```

**Problem:** `sharedOptions` returns `ChartOptions<"line">`. A `<Bar>` chart expects `ChartOptions<"bar">`. These are different types and TypeScript complains.

### ✅ After

```ts
const barOpts = useMemo(
  () => sharedOptions("Revenue ($)") as unknown as ChartOptions<"bar">,
  [],
);
```

**What changed:**

- `as unknown as ChartOptions<"bar">` — a double cast. We first cast to `unknown` (wiping the type), then assert it's a bar chart options object
- This is valid here because the actual option properties are compatible — we just need to tell TypeScript to trust us
- `horizBarOpts` gets its type directly: `const horizBarOpts: ChartOptions<"bar"> = useMemo(...)`

---

## Fix 10: `ScriptableContext` for Gradient Background

### ❌ Before

```ts
backgroundColor: (ctx) => {
  const { ctx: c, chartArea } = ctx.chart;
  ...
},
```

**Problem:** `ctx` is `any`. TypeScript doesn't know what properties it has, so no autocomplete and no error checking.

### ✅ After

```ts
backgroundColor: (ctx: ScriptableContext<"line">) => {
  const { ctx: c, chartArea } = ctx.chart;
  ...
},
```

**What changed:**

- `ScriptableContext<"line">` is Chart.js's type for the context object passed to scriptable (function) options
- Now TypeScript knows exactly what `ctx.chart`, `ctx.chart.ctx`, and `ctx.chart.chartArea` are

---

## 📋 Quick Reference Table

| #   | What              | Before                            | After                               | Why                            |
| --- | ----------------- | --------------------------------- | ----------------------------------- | ------------------------------ |
| 1   | `sumField`        | untyped params, string concat bug | `<T>`, `keyof T`, `Number()`        | Safety + correct math          |
| 2   | `calcGrowth`      | implicit `any` params             | `number, number): number`           | Prevents wrong input           |
| 3   | `fmtCompact/Full` | untyped `n`                       | `n: number): string`                | Clear contract                 |
| 4   | `sharedOptions`   | plain object return               | `: ChartOptions<"line">`            | Validates chart config         |
| 5   | `StatCard`        | destructured `any`                | `interface StatCardProps`           | Catches missing props          |
| 6   | `ChartCard`       | destructured `any`                | `interface ChartCardProps`          | `React.ReactNode` for children |
| 7   | `useState`        | implicit `undefined`              | explicit `\| undefined` + `??`      | Safe access everywhere         |
| 8   | `borderSkipped`   | `false` (boolean)                 | `false as const` (literal)          | Matches Chart.js exactly       |
| 9   | `barOpts`         | wrong chart type                  | `as unknown as ChartOptions<"bar">` | Line → Bar type cast           |
| 10  | Gradient `ctx`    | `any`                             | `ScriptableContext<"line">`         | Typed Chart.js context         |
