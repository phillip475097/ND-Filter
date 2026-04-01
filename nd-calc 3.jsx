import { useState, useMemo } from "react";

const SHUTTERS = [
  "1/24","1/25","1/30","1/40","1/48","1/50","1/60","1/80","1/100","1/120",
  "1/125","1/160","1/200","1/250","1/320","1/400","1/500","1/640","1/800",
  "1/1000","1/1250","1/1600","1/2000","1/2500","1/3200","1/4000","1/5000",
  "1/6400","1/8000"
];

const DRONE_DATA = {
  "DJI Neo": {
    fps: [24, 25, 30, 48, 50, 60],
    iso: [100, 200, 400, 800, 1600, 3200]
  },
  "DJI Mini 4 Pro": {
    fps: [24, 25, 30, 48, 50, 60, 120],
    iso: [100, 200, 400, 800, 1600, 3200, 6400]
  }
};

const NDS = [
  { n: "ND2", s: 1 }, { n: "ND4", s: 2 }, { n: "ND8", s: 3 }, { n: "ND16", s: 4 }, { n: "ND32", s: 5 },
  { n: "ND64", s: 6 }, { n: "ND128", s: 7 }, { n: "ND256", s: 8 }, { n: "ND400", s: 8.6 }, { n: "ND1000", s: 10 },
];

const toSec = (str) => {
  if (str.includes('/')) {
    const [num, den] = str.split('/');
    return parseInt(num) / parseInt(den);
  }
  return parseFloat(str);
};

export default function NDCalc() {
  const [drone, setDrone] = useState("DJI Neo");
  const [fps, setFps] = useState(24);
  const [iso, setIso] = useState(100);
  const [shutStr, setShutStr] = useState("1/1000");

  const { tgtLabel, stops, needs, best } = useMemo(() => {
    const targetVal = 1 / (2 * fps);
    const currentVal = toSec(shutStr);
    const stopsNeeded = Math.log2(targetVal / currentVal);
    const isNeeded = stopsNeeded > 0.05;

    let bestFilter = null;
    if (isNeeded) {
      bestFilter = NDS.reduce((prev, curr) =>
        Math.abs(curr.s - stopsNeeded) < Math.abs(prev.s - stopsNeeded) ? curr : prev
      );
    }

    return {
      tgtLabel: `1/${Math.round(1 / targetVal)}`,
      stops: stopsNeeded,
      needs: isNeeded,
      best: bestFilter
    };
  }, [fps, shutStr]);

  const handleDroneChange = (name) => {
    setDrone(name);
    setFps(DRONE_DATA[name].fps[0]);
    setIso(DRONE_DATA[name].iso[0]);
  };

  const selStyle = {
    width: "100%", padding: "10px", marginTop: 5,
    border: "1.5px solid #d1d5db", borderRadius: 8,
    fontSize: 16, fontWeight: 600, color: "#111", background: "#f9fafb",
    appearance: "none",
  };

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", padding: 16, background: "#f3f4f6", minHeight: "100vh" }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>

        <header style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>ND Filter Calculator</div>
          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase" }}>180° shutter rule · DJI drones</div>
        </header>

        {/* Drone Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {Object.keys(DRONE_DATA).map(name => (
            <button key={name} onClick={() => handleDroneChange(name)} style={{
              flex: 1, padding: "10px 6px", borderRadius: 10, cursor: "pointer",
              border: `2px solid ${drone === name ? "#2563eb" : "#d1d5db"}`,
              background: drone === name ? "#2563eb" : "#fff",
              color: drone === name ? "#fff" : "#555",
              fontWeight: 600, fontSize: 13,
            }}>{name}</button>
          ))}
        </div>

        {/* Inputs Panel */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>FRAME RATE</label>
              <select value={fps} onChange={(e) => setFps(parseInt(e.target.value))} style={selStyle}>
                {DRONE_DATA[drone].fps.map(v => <option key={v} value={v}>{v} fps</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ISO</label>
              <select value={iso} onChange={(e) => setIso(parseInt(e.target.value))} style={selStyle}>
                {DRONE_DATA[drone].iso.map(v => <option key={v} value={v}>ISO {v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>METERED SHUTTER (NO FILTER)</label>
            <select value={shutStr} onChange={(e) => setShutStr(e.target.value)} style={selStyle}>
              {SHUTTERS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
            <div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Target Shutter</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{tgtLabel}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Stops Needed</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {needs ? `${stops.toFixed(1)} stops` : "None"}
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px 16px", marginBottom: 12, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8 }}>RECOMMENDED FILTER</div>
          <div style={{ fontSize: needs ? 58 : 34, fontWeight: 800, color: needs ? "#2563eb" : "#d1d5db" }}>
            {needs && best ? best.n : "NONE"}
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>
            {needs && best ? `${best.s} stop reduction · ${fps}fps · ISO ${iso}` : `Shutter is fine at ${tgtLabel}`}
          </div>
        </div>

        {/* Reference Grid */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 10 }}>ND FILTER REFERENCE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
            {NDS.map(f => {
              const active = best?.n === f.n;
              return (
                <div key={f.n} style={{
                  padding: "8px 2px", borderRadius: 8, textAlign: "center",
                  border: `1.5px solid ${active ? "#2563eb" : "#e5e7eb"}`,
                  background: active ? "#eff6ff" : "#f9fafb",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? "#1d4ed8" : "#6b7280" }}>{f.n}</div>
                  <div style={{ fontSize: 10, color: "#d1d5db" }}>{f.s} stops</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.7, padding: "12px 14px", background: "#fff", borderRadius: 10 }}>
          <strong style={{ color: "#6b7280" }}>How to use:</strong> Remove all filters. Set your drone to auto-exposure and note the shutter speed it picks for correct exposure. Select that shutter speed above to see which ND filter to attach.
        </div>

      </div>
    </div>
  );
}
