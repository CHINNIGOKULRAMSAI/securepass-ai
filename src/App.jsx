import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

function App() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzePassword = async () => {
    setError("");
    setResult(null);

    if (!password) {
      setError("Please enter a password to analyze.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/analyze", { password });
      setResult(res.data);
    } catch (err) {
      setError("Unable to analyze password — check backend or CORS.");
    } finally {
      setLoading(false);
    }
  };

  const strengthPct = () => {
    if (!result) return Math.min(100, Math.max(8, password.length * 8));

    // numeric confidence from model (0-100)
    const conf = (typeof result.confidence === "number") ? Math.min(100, result.confidence) : null;

    // derive a scaled percentage from entropy so very high-entropy passwords can reach 100%
    const entropy = result?.features?.entropy;
    let entropyPct = 0;
    if (typeof entropy === 'number' && !isNaN(entropy)) {
      // map entropy 0..160 -> 0..100 (160 chosen as a reasonable high-entropy cap)
      entropyPct = Math.min(100, (entropy / 160) * 100);
    }

    // prefer the higher signal (either model confidence or entropy-based)
    if (conf !== null) return Math.max(conf, Math.round(entropyPct * 100) / 100);

    // Fallback to mapping predictions
    const p = (result.prediction || "").toString().toLowerCase();
    if (p.includes("strong")) return 95;
    if (p.includes("moderate") || p.includes("medium")) return 65;
    return 28;
  };

  const strengthColor = () => {
    const v = strengthPct();
    if (v >= 80) return "bg-emerald-400";
    if (v >= 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  // Display confidence as the same percentage used for the strength bar
  const displayConfidence = () => Math.round(strengthPct() * 100) / 100;

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-900/60 backdrop-blur rounded-2xl p-8 shadow-xl border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold">PW</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Password Strength Checker</h1>
              <div className="text-xs text-gray-400">Instant analysis with model-backed recommendations</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">v1.0</div>
            <button
              onClick={() => {
                const next = document.documentElement.classList.toggle('light');
                try { localStorage.setItem('theme_light', next ? '1' : '0'); } catch {}
              }}
              className="px-3 py-1 rounded bg-gray-800/60 hover:bg-gray-700 text-sm text-gray-200 border border-gray-700"
              aria-label="Toggle theme"
            >
              Theme
            </button>
          </div>
        </div>

        <p className="text-gray-300 mb-6">Type a password to get instant analysis and recommendations.</p>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1">
            <label className="sr-only">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg text-gray-900 text-lg"
              aria-label="Password input"
            />
          </div>

          <button
            onClick={() => setShowPassword((s) => !s)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700"
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={analyzePassword}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            Check
          </button>
          <button
            onClick={() => { setPassword(''); setResult(null); setError(''); }}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            Clear
          </button>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`${strengthColor()} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${strengthPct()}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Length: {password.length}</span>
            <span>{Math.round(strengthPct())}%</span>
          </div>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-3 text-gray-200">
            <div className="spinner w-5 h-5" />
            <span>Analyzing...</span>
          </div>
        )}

        {error && <div className="mt-4 text-red-300">{error}</div>}

        {result && !error && (
          <div className="mt-6 bg-gray-800 p-5 rounded-lg text-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Analysis Result</h2>
                <p className="text-sm text-gray-400">Prediction: {result.prediction || "-"} • Confidence: {displayConfidence()}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div><strong>Entropy:</strong> {result?.features?.entropy ?? "-"}</div>
              <div><strong>Length:</strong> {result?.features?.length ?? password.length}</div>
              <div><strong>Uppercase:</strong> {result?.features?.uppercase ?? 0}</div>
              <div><strong>Lowercase:</strong> {result?.features?.lowercase ?? 0}</div>
              <div><strong>Digits:</strong> {result?.features?.digits ?? 0}</div>
              <div><strong>Symbols:</strong> {result?.features?.symbols ?? 0}</div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Recommendations</h3>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-200">
                {(result?.recommendations ?? []).length === 0 && <li>No recommendations.</li>}
                {(result?.recommendations ?? []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;