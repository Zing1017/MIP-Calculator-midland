import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  Calendar,
  DollarSign,
  Info,
  ShieldCheck
} from 'lucide-react';

// --- 資料庫：內置 HKMC 按揭保費表 (節錄自 2024年10月 費率表) ---
const ratesData = {
  // 表1: <= 600萬, 首置, 無未償還按揭 (Max 90%)
  T1: {
    maxLtv: 90,
    Float: {
      75: { s: [0, 0, 0, 0, 0] },
      80: {
        s: [0.5, 0.6, 0.76, 0.83, 0.92],
        a1: [0.45, 0.55, 0.65, 0.7, 0.8],
        ar: [0.22, 0.22, 0.22, 0.22, 0.22]
      },
      85: {
        s: [0.86, 1.02, 1.25, 1.35, 1.41],
        a1: [0.65, 0.75, 0.85, 0.95, 1.05],
        ar: [0.43, 0.43, 0.43, 0.43, 0.43]
      },
      90: {
        s: [1.25, 1.48, 1.79, 2.03, 2.16],
        a1: [0.85, 1.04, 1.23, 1.41, 1.6],
        ar: [0.61, 0.61, 0.61, 0.61, 0.61]
      }
    },
    Fixed: {
      75: { s: [0, 0, 0, 0, 0] },
      80: { s: [0.47, 0.57, 0.73, 0.79, 0.86] },
      85: { s: [0.76, 0.96, 1.12, 1.18, 1.28] },
      90: { s: [1.16, 1.37, 1.7, 1.92, 2.05] }
    }
  },
  // 表2: <= 600萬, 非首置, 無未償還按揭 (Max 80%)
  T2: {
    maxLtv: 80,
    Float: {
      75: { s: [0.15, 0.15, 0.15, 0.15, 0.15] },
      80: {
        s: [0.65, 0.75, 0.91, 0.98, 1.07],
        a1: [0.24, 0.24, 0.24, 0.24, 0.24],
        ar: [0.5, 0.6, 0.7, 0.75, 0.85]
      }
    },
    Fixed: {
      75: { s: [0.15, 0.15, 0.15, 0.15, 0.15] },
      80: { s: [0.62, 0.72, 0.88, 0.94, 1.01] }
    }
  },
  // 表3: 600萬-1500萬, 首置, 無未償還按揭 (Max 90%)
  T3: {
    maxLtv: 90,
    Float: {
      75: { s: [0, 0, 0, 0, 0] },
      80: {
        s: [0.6, 0.71, 0.9, 0.97, 1.09],
        a1: [0.53, 0.64, 0.76, 0.81, 0.93],
        ar: [0.26, 0.26, 0.26, 0.26, 0.26]
      },
      85: {
        s: [1.01, 1.2, 1.46, 1.57, 1.64],
        a1: [0.76, 0.87, 0.99, 1.1, 1.22],
        ar: [0.5, 0.5, 0.5, 0.5, 0.5]
      },
      90: {
        s: [1.46, 1.72, 2.08, 2.35, 2.5],
        a1: [0.99, 1.2, 1.42, 1.63, 1.85],
        ar: [0.7, 0.7, 0.7, 0.7, 0.7]
      }
    },
    Fixed: {
      75: { s: [0, 0, 0, 0, 0] },
      80: { s: [0.56, 0.68, 0.86, 0.94, 1.01] },
      85: { s: [0.9, 1.12, 1.31, 1.38, 1.49] },
      90: { s: [1.35, 1.6, 1.98, 2.23, 2.38] }
    }
  },
  // 表4: 600萬-1715萬, 非首置, 無未償還按揭 (Max 80%)
  T4: {
    maxLtv: 80,
    Float: {
      75: { s: [0.15, 0.15, 0.15, 0.15, 0.15] },
      80: {
        s: [0.75, 0.86, 1.05, 1.12, 1.24],
        a1: [0.58, 0.69, 0.81, 0.86, 0.98],
        ar: [0.28, 0.28, 0.28, 0.28, 0.28]
      }
    },
    Fixed: {
      75: { s: [0.15, 0.15, 0.15, 0.15, 0.15] },
      80: { s: [0.71, 0.83, 1.01, 1.09, 1.16] }
    }
  },
  // 表9: >1500萬 - 3000萬, Max 80% (首置及非首置通用)
  T9: {
    maxLtv: 80,
    Float: {
      70: { s: [0.3, 0.3, 0.3, 0.3, 0.3] },
      75: { s: [0.45, 0.45, 0.45, 0.45, 0.45] },
      80: {
        s: [0.86, 1.12, 1.38, 1.5, 1.61],
        a1: [0.67, 0.91, 1.07, 1.15, 1.28],
        ar: [0.32, 0.32, 0.32, 0.32, 0.32]
      }
    },
    Fixed: {
      70: { s: [0.3, 0.3, 0.3, 0.3, 0.3] },
      75: { s: [0.45, 0.45, 0.45, 0.45, 0.45] },
      80: { s: [0.83, 1.08, 1.34, 1.45, 1.51] }
    }
  }
};

const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const parseNumber = (str) => {
  const parsed = parseInt(String(str).replace(/,/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toCurrency = (num) => `$${formatNumber(Math.round(num))}`;

const getTenorIndex = (tenor) => {
  const map = { 10: 0, 15: 1, 20: 2, 25: 3, 30: 4 };
  return map[tenor] !== undefined ? map[tenor] : -1;
};

const getLtvBracket = (ltv) => {
  if (ltv <= 60) return 0;
  if (ltv <= 70) return 70;
  if (ltv <= 75) return 75;
  if (ltv <= 80) return 80;
  if (ltv <= 85) return 85;
  if (ltv <= 90) return 90;
  return 999;
};

const ToggleGroup = ({ options, active, onChange }) => (
  <div className="flex rounded-lg bg-slate-200/60 p-1">
    {options.map((opt) => (
      <button
        key={String(opt.value)}
        onClick={() => onChange(opt.value)}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
          active === opt.value
            ? 'bg-white text-yellow-600 shadow-sm'
            : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default function App() {
  const [propertyValue, setPropertyValue] = useState(6000000);
  const [loanAmount, setLoanAmount] = useState(4800000);
  const [tenor, setTenor] = useState(30);
  const [isFloating, setIsFloating] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [discount, setDiscount] = useState(35);

  const handlePropertyChange = (newVal) => {
    const currentLtv = propertyValue > 0 ? loanAmount / propertyValue : 0.8;
    setPropertyValue(newVal);
    setLoanAmount(Math.round(newVal * currentLtv));
  };

  const setQuickLtv = (targetLtv) => {
    setLoanAmount(Math.round((propertyValue * targetLtv) / 100));
  };

  const result = useMemo(() => {
    const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
    const bracket = getLtvBracket(ltv);
    const tIndex = getTenorIndex(tenor);

    let tableKey = null;
    if (isFirstTime) {
      if (propertyValue <= 6000000) tableKey = 'T1';
      else if (propertyValue <= 15000000) tableKey = 'T3';
      else if (propertyValue <= 30000000) tableKey = 'T9';
    } else {
      if (propertyValue <= 6000000) tableKey = 'T2';
      else if (propertyValue <= 17150000) tableKey = 'T4';
      else if (propertyValue <= 30000000) tableKey = 'T9';
    }

    if (!tableKey) {
      return { ltv, error: '超出計算器支援的物業價格範圍 (上限為3,000萬港元)' };
    }

    const tableData = ratesData[tableKey];
    if (ltv > tableData.maxLtv) {
      return { ltv, error: `在此物業價格及買家身份下，最高按揭成數限制為 ${tableData.maxLtv}%` };
    }

    if (bracket === 0 || (bracket === 70 && tableKey !== 'T9')) {
      return { ltv, info: '按揭成數 70% 或以下，一般情況下無需購買按揭保險。' };
    }

    const modeKey = isFloating ? 'Float' : 'Fixed';
    const rates = tableData[modeKey][bracket];

    if (!rates) {
      return { ltv, error: '找不到對應的保費率，請檢查按揭成數設定。' };
    }

    const sRate = rates.s ? rates.s[tIndex] : null;
    const a1Rate = rates.a1 ? rates.a1[tIndex] : null;
    const arRate = rates.ar ? rates.ar[tIndex] : null;

    const basePremium = (loanAmount * sRate) / 100;
    const finalPremium = basePremium * (1 - discount / 100);

    return {
      ltv,
      tableKey,
      sRate,
      basePremium,
      finalPremium,
      a1Rate,
      a1Amount: a1Rate ? (loanAmount * a1Rate) / 100 : null,
      arRate,
      arAmount: arRate ? (loanAmount * arRate) / 100 : null
    };
  }, [propertyValue, loanAmount, tenor, isFloating, isFirstTime, discount]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-yellow-500 p-3 shadow-lg">
            <Calculator className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">按揭保險費計算器</h1>
            <p className="text-sm text-slate-500">基於 HKMC 按揭保費一覽表 (2024年10月修訂)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-7">
            <h2 className="mb-6 border-b pb-4 text-lg font-bold text-slate-800">按揭基本資料</h2>

            <div className="mb-8">
              <div className="mb-2 flex items-end justify-between">
                <label className="text-sm font-semibold text-slate-700">物業價格</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">$</span>
                  <input
                    type="text"
                    className="w-40 rounded-lg border border-slate-300 px-3 py-2 pl-8 text-right font-semibold focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formatNumber(propertyValue)}
                    onChange={(e) => handlePropertyChange(parseNumber(e.target.value))}
                  />
                </div>
              </div>
              <input
                type="range"
                min={1000000}
                max={30000000}
                step={100000}
                value={propertyValue}
                onChange={(e) => handlePropertyChange(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-yellow-500"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>100萬</span>
                <span>1500萬</span>
                <span>3000萬</span>
              </div>
            </div>

            <div className="mb-8 border-b border-slate-100 pb-8">
              <div className="mb-2 flex items-end justify-between">
                <label className="text-sm font-semibold text-slate-700">按揭貸款金額</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">$</span>
                  <input
                    type="text"
                    className="w-40 rounded-lg border border-slate-300 px-3 py-2 pl-8 text-right font-semibold focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formatNumber(loanAmount)}
                    onChange={(e) => {
                      let val = parseNumber(e.target.value);
                      if (val > propertyValue) val = propertyValue;
                      setLoanAmount(val);
                    }}
                  />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={propertyValue}
                step={10000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseInt(e.target.value, 10))}
                className="mb-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-yellow-500"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {[70, 80, 90].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setQuickLtv(pct)}
                      className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition hover:bg-yellow-100"
                    >
                      {pct}% 按揭
                    </button>
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">
                  當前 LTV:{' '}
                  <span className={result.ltv > 90 ? 'text-red-500' : 'text-yellow-600'}>
                    {result.ltv.toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">首次置業人士</label>
                <ToggleGroup
                  options={[
                    { label: '是 (首置)', value: true },
                    { label: '否', value: false }
                  ]}
                  active={isFirstTime}
                  onChange={setIsFirstTime}
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-400">
                  涉及未償還按揭
                  <Info
                    size={14}
                    className="cursor-help"
                    title="此示範版本暫不支援未完全償還按揭之特定費率計算"
                  />
                </label>
                <div className="flex cursor-not-allowed rounded-lg bg-slate-100 p-1 opacity-60">
                  <button className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-slate-400">是</button>
                  <button className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">否</button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">按揭種類</label>
                <ToggleGroup
                  options={[
                    { label: '浮息按揭 (H按/P按)', value: true },
                    { label: '定息按揭 (HKMC計劃)', value: false }
                  ]}
                  active={isFloating}
                  onChange={setIsFloating}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">按揭年期 (年)</label>
                <ToggleGroup
                  options={[
                    { label: '10年', value: 10 },
                    { label: '15年', value: 15 },
                    { label: '20年', value: 20 },
                    { label: '25年', value: 25 },
                    { label: '30年', value: 30 }
                  ]}
                  active={tenor}
                  onChange={setTenor}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-semibold text-slate-700">保費折扣 (銀行回贈優惠)</label>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-600">
                  {discount}% Off
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value, 10))}
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-500"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span className="font-medium text-slate-500">常見銀行折扣: 33% - 35%</span>
                <span>50%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-8 flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
              <h2 className="mb-6 flex items-center gap-2 border-b pb-4 text-xl font-bold text-slate-800">
                <ShieldCheck className="text-yellow-500" />
                計算結果
              </h2>

              <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="font-medium text-slate-600">實際按揭成數 (LTV)</span>
                <span
                  className={`text-2xl font-bold ${
                    result.ltv > 90 ? 'text-red-500' : result.ltv > 80 ? 'text-amber-500' : 'text-emerald-500'
                  }`}
                >
                  {result.ltv.toFixed(2)}%
                </span>
              </div>

              {result.error ? (
                <div className="animate-pulse flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
                  <AlertTriangle className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">{result.error}</p>
                </div>
              ) : result.info ? (
                <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                  <Info className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">{result.info}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 p-6 text-amber-950 shadow-md">
                    <DollarSign className="absolute -bottom-4 -right-4 text-amber-900/10" size={120} />

                    <div className="relative z-10 mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-amber-900">一次付清保費</h3>
                      <span className="rounded bg-amber-900/10 px-2 py-1 text-xs font-medium">
                        基本費率: {result.sRate}%
                      </span>
                    </div>

                    <div className="relative z-10 mb-2 text-4xl font-bold">{toCurrency(result.finalPremium)}</div>

                    {discount > 0 ? (
                      <div className="relative z-10 mt-4 flex justify-between border-t border-amber-900/10 pt-3 text-sm text-amber-800">
                        <span>折扣前: {toCurrency(result.basePremium)}</span>
                        <span className="font-medium text-emerald-700">
                          節省: {toCurrency(result.basePremium - result.finalPremium)}
                        </span>
                      </div>
                    ) : (
                      <div className="relative z-10 mt-4 border-t border-amber-900/10 pt-3 text-sm text-amber-800">
                        標準保費，未包含任何銀行折扣。
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar size={16} className="text-slate-400" /> 按年支付保費方案 (可選)
                    </h3>

                    {!result.a1Amount || result.a1Amount === 0 ? (
                      <p className="rounded-lg border border-slate-100 bg-white p-3 text-sm italic text-slate-500">
                        此按揭成數不提供按年支付選項，或不適用於定息按揭計劃。
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                          <p className="mb-1 text-xs text-slate-500">首年保費 ({result.a1Rate}%)</p>
                          <p className="text-lg font-bold text-slate-800">{toCurrency(result.a1Amount)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                          <p className="mb-1 text-xs text-slate-500">其後每年續保 ({result.arRate}%)</p>
                          <p className="text-lg font-bold text-slate-800">{toCurrency(result.arAmount)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 text-center text-xs text-slate-400">
                計算結果僅供參考。保費以貸款金額為基礎計算。最終保費金額以香港按揭證券有限公司 (HKMC)
                及相關銀行之最終批核為準。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
