import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { LayoutDashboard, PlusCircle, ClipboardCheck, GitCompareArrows, ChevronDown, ChevronUp, Trash2, Edit3, ArrowLeft, TrendingUp, Users, Rocket, Briefcase, MapPin, Euro, Star, AlertTriangle, CheckCircle2, XCircle, Target } from "lucide-react";

// ─── Sample Data ───
const SAMPLE_EVENTS = [
  {
    id: 1, nom: "Mêlée Numérique", territoire: "Toulouse", type: "événement",
    organisateur: "La Mêlée", date: "2025-09-25", budget: 15000,
    scoring: { innovation: 85, recrutement: 60, influence: 90, business: 70, cout: 65 },
    resultats: { contacts: 120, contactsQualifies: 45, startupsRencontrees: 18, startupsPertinentes: 8, pocLances: 2, projetsDeployes: 1, candidatsRencontres: 15, recrutements: 1, rdvMetiers: 8, projetsInities: 3 },
    done: true
  },
  {
    id: 2, nom: "Salon Data & IA", territoire: "Nantes", type: "événement",
    organisateur: "ADN Ouest", date: "2025-11-14", budget: 12000,
    scoring: { innovation: 90, recrutement: 75, influence: 70, business: 80, cout: 70 },
    resultats: { contacts: 95, contactsQualifies: 38, startupsRencontrees: 22, startupsPertinentes: 12, pocLances: 3, projetsDeployes: 0, candidatsRencontres: 20, recrutements: 2, rdvMetiers: 12, projetsInities: 4 },
    done: true
  },
  {
    id: 3, nom: "Tech & Fest", territoire: "Grenoble", type: "événement",
    organisateur: "ebra", date: "2025-06-05", budget: 8000,
    scoring: { innovation: 70, recrutement: 80, influence: 60, business: 55, cout: 80 },
    resultats: { contacts: 60, contactsQualifies: 22, startupsRencontrees: 10, startupsPertinentes: 4, pocLances: 1, projetsDeployes: 0, candidatsRencontres: 25, recrutements: 1, rdvMetiers: 5, projetsInities: 1 },
    done: true
  },
  {
    id: 4, nom: "French Tech Nantes", territoire: "Nantes", type: "adhésion",
    organisateur: "French Tech Nantes", date: "2025-01-01", budget: 5000,
    scoring: { innovation: 75, recrutement: 50, influence: 85, business: 60, cout: 85 },
    resultats: { contacts: 40, contactsQualifies: 18, startupsRencontrees: 15, startupsPertinentes: 6, pocLances: 1, projetsDeployes: 1, candidatsRencontres: 5, recrutements: 0, rdvMetiers: 6, projetsInities: 2 },
    done: true
  },
  {
    id: 5, nom: "Web2Day", territoire: "Nantes", type: "événement",
    organisateur: "Web2Day", date: "2026-06-04", budget: 18000,
    scoring: { innovation: 80, recrutement: 85, influence: 95, business: 65, cout: 55 },
    resultats: null,
    done: false
  },
  {
    id: 6, nom: "Digital Change", territoire: "Nantes", type: "événement",
    organisateur: "Shift", date: "2026-04-10", budget: 10000,
    scoring: { innovation: 65, recrutement: 55, influence: 70, business: 75, cout: 75 },
    resultats: null,
    done: false
  }
];

const TERRITORIES = ["Tous", "Nantes", "Toulouse", "Rennes", "Grenoble", "Lyon", "Bordeaux"];
const TYPES = ["Tous", "événement", "adhésion", "partenariat"];
const COLORS = { primary: "#0C1E3C", accent: "#E94E1B", accent2: "#00A86B", accent3: "#2D7DD2", accent4: "#F5A623", bg: "#F7F8FA", card: "#FFFFFF", muted: "#8896A7", border: "#E2E6EC" };
const PALETTE = ["#E94E1B", "#2D7DD2", "#00A86B", "#F5A623", "#8B5CF6", "#EC4899"];

function calcScoreGlobal(s) {
  if (!s) return 0;
  return Math.round((s.innovation * 0.25 + s.recrutement * 0.2 + s.influence * 0.2 + s.business * 0.2 + s.cout * 0.15));
}
function getRecommandation(score) {
  if (score >= 80) return { label: "Stratégique", color: "#00A86B", icon: <CheckCircle2 size={16} /> };
  if (score >= 65) return { label: "Pertinent", color: "#2D7DD2", icon: <Target size={16} /> };
  if (score >= 50) return { label: "À optimiser", color: "#F5A623", icon: <AlertTriangle size={16} /> };
  return { label: "À arrêter", color: "#E94E1B", icon: <XCircle size={16} /> };
}
function calcROI(e) {
  if (!e.resultats || !e.budget) return null;
  const r = e.resultats;
  const value = (r.contactsQualifies * 50) + (r.startupsPertinentes * 500) + (r.pocLances * 5000) + (r.projetsDeployes * 20000) + (r.recrutements * 10000) + (r.projetsInities * 2000);
  return Math.round(((value - e.budget) / e.budget) * 100);
}

// ─── Components ───

function Badge({ children, color = COLORS.accent }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, background: color + "18", color }}>{children}</span>;
}

function KPICard({ label, value, icon, color = COLORS.primary, sub }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${COLORS.border}`, flex: "1 1 160px", minWidth: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.primary, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ScoreGauge({ score, size = 90 }) {
  const r = getRecommandation(score);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke={COLORS.border} strokeWidth="6" />
        <circle cx="40" cy="40" r="36" fill="none" stroke={r.color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        <text x="40" y="36" textAnchor="middle" fontSize="18" fontWeight="800" fill={COLORS.primary} fontFamily="'DM Sans', sans-serif">{score}</text>
        <text x="40" y="50" textAnchor="middle" fontSize="8" fill={COLORS.muted}>/100</text>
      </svg>
      <Badge color={r.color}>{r.icon}{r.label}</Badge>
    </div>
  );
}

function Tabs({ items, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, background: COLORS.primary + "0A", borderRadius: 10, padding: 3 }}>
      {items.map((item) => (
        <button key={item.key} onClick={() => onChange(item.key)} style={{
          padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
          background: active === item.key ? COLORS.card : "transparent", color: active === item.key ? COLORS.primary : COLORS.muted,
          boxShadow: active === item.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 6
        }}>
          {item.icon}{item.label}
        </button>
      ))}
    </div>
  );
}

function Select({ value, onChange, options, label }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>
      {label}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13,
        color: COLORS.primary, background: COLORS.card, fontWeight: 500, cursor: "pointer"
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function SliderInput({ label, value, onChange, max = 100 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{value}</span>
      </div>
      <input type="range" min="0" max={max} value={value} onChange={e => onChange(parseInt(e.target.value))}
        style={{ width: "100%", accentColor: COLORS.accent }} />
    </div>
  );
}

function NumberInput({ label, value, onChange, placeholder = "0" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600, color: COLORS.primary }}>
      {label}
      <input type="number" min="0" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)} placeholder={placeholder}
        style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 500, color: COLORS.primary }} />
    </label>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600, color: COLORS.primary }}>
      {label}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 500, color: COLORS.primary }} />
    </label>
  );
}

// ─── DASHBOARD VIEW ───
function DashboardView({ events, onSelect }) {
  const [filterTerr, setFilterTerr] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");

  const filtered = useMemo(() => events.filter(e =>
    (filterTerr === "Tous" || e.territoire === filterTerr) &&
    (filterType === "Tous" || e.type === filterType)
  ), [events, filterTerr, filterType]);

  const doneEvents = filtered.filter(e => e.done);
  const budgetTotal = filtered.reduce((s, e) => s + e.budget, 0);
  const contactsQ = doneEvents.reduce((s, e) => s + (e.resultats?.contactsQualifies || 0), 0);
  const startupsR = doneEvents.reduce((s, e) => s + (e.resultats?.startupsRencontrees || 0), 0);
  const pocs = doneEvents.reduce((s, e) => s + (e.resultats?.pocLances || 0), 0);
  const projets = doneEvents.reduce((s, e) => s + (e.resultats?.projetsDeployes || 0), 0);
  const recrut = doneEvents.reduce((s, e) => s + (e.resultats?.recrutements || 0), 0);

  // Territory breakdown
  const terrData = useMemo(() => {
    const map = {};
    doneEvents.forEach(e => {
      if (!map[e.territoire]) map[e.territoire] = { name: e.territoire, budget: 0, contacts: 0, pocs: 0, count: 0 };
      map[e.territoire].budget += e.budget;
      map[e.territoire].contacts += e.resultats?.contactsQualifies || 0;
      map[e.territoire].pocs += e.resultats?.pocLances || 0;
      map[e.territoire].count += 1;
    });
    return Object.values(map);
  }, [doneEvents]);

  // Ranking
  const ranked = [...filtered].sort((a, b) => calcScoreGlobal(b.scoring) - calcScoreGlobal(a.scoring));

  // Budget by type
  const typeData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      if (!map[e.type]) map[e.type] = { name: e.type, budget: 0 };
      map[e.type].budget += e.budget;
    });
    return Object.values(map);
  }, [filtered]);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Select label="Territoire" value={filterTerr} onChange={setFilterTerr} options={TERRITORIES} />
        <Select label="Type" value={filterType} onChange={setFilterType} options={TYPES} />
        <div style={{ fontSize: 12, color: COLORS.muted, paddingBottom: 10 }}>{filtered.length} événement{filtered.length > 1 ? "s" : ""}</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <KPICard label="Événements" value={filtered.length} icon={<LayoutDashboard size={16} />} color={COLORS.accent3} />
        <KPICard label="Budget total" value={`${(budgetTotal / 1000).toFixed(0)}k€`} icon={<Euro size={16} />} color={COLORS.accent} sub={`Moy. ${filtered.length ? (budgetTotal / filtered.length / 1000).toFixed(1) : 0}k€`} />
        <KPICard label="Contacts qualifiés" value={contactsQ} icon={<Users size={16} />} color={COLORS.accent2} sub={doneEvents.length ? `${(contactsQ / doneEvents.length).toFixed(0)} / événement` : ""} />
        <KPICard label="Startups rencontrées" value={startupsR} icon={<Rocket size={16} />} color={COLORS.accent4} />
        <KPICard label="POC lancés" value={pocs} icon={<TrendingUp size={16} />} color="#8B5CF6" />
        <KPICard label="Projets déployés" value={projets} icon={<Briefcase size={16} />} color={COLORS.primary} />
        <KPICard label="Recrutements" value={recrut} icon={<Star size={16} />} color="#EC4899" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {/* Territory chart */}
        <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginBottom: 16, marginTop: 0 }}>Impact par territoire</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={terrData} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="contacts" name="Contacts qualifiés" fill={COLORS.accent3} radius={[4, 4, 0, 0]} />
              <Bar dataKey="pocs" name="POC lancés" fill={COLORS.accent2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget by type */}
        <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginBottom: 16, marginTop: 0 }}>Répartition budget</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeData} dataKey="budget" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11 }}>
                {typeData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${(v / 1000).toFixed(1)}k€`} contentStyle={{ borderRadius: 10, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking table */}
      <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginBottom: 16, marginTop: 0 }}>Classement des événements</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                {["#", "Événement", "Territoire", "Type", "Budget", "Score", "ROI", "Statut"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: COLORS.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((e, i) => {
                const score = calcScoreGlobal(e.scoring);
                const reco = getRecommandation(score);
                const roi = calcROI(e);
                return (
                  <tr key={e.id} onClick={() => onSelect(e)} style={{ borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={ev => ev.currentTarget.style.background = COLORS.bg} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px", fontWeight: 700, color: COLORS.muted }}>{i + 1}</td>
                    <td style={{ padding: "12px", fontWeight: 700, color: COLORS.primary }}>{e.nom}</td>
                    <td style={{ padding: "12px" }}><Badge color={COLORS.accent3}><MapPin size={12} />{e.territoire}</Badge></td>
                    <td style={{ padding: "12px", color: COLORS.muted, fontWeight: 500 }}>{e.type}</td>
                    <td style={{ padding: "12px", fontWeight: 600 }}>{(e.budget / 1000).toFixed(0)}k€</td>
                    <td style={{ padding: "12px" }}><Badge color={reco.color}>{score}/100</Badge></td>
                    <td style={{ padding: "12px", fontWeight: 700, color: roi !== null ? (roi > 0 ? COLORS.accent2 : COLORS.accent) : COLORS.muted }}>{roi !== null ? `${roi > 0 ? "+" : ""}${roi}%` : "—"}</td>
                    <td style={{ padding: "12px" }}>{e.done ? <Badge color={COLORS.accent2}>Terminé</Badge> : <Badge color={COLORS.accent4}>À venir</Badge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── SCORING VIEW (New event / edit) ───
function ScoringView({ event, onSave, onCancel }) {
  const [form, setForm] = useState(event || {
    nom: "", territoire: "Nantes", type: "événement", organisateur: "", date: "", budget: 0,
    scoring: { innovation: 50, recrutement: 50, influence: 50, business: 50, cout: 50 },
    resultats: null, done: false
  });

  const updateScoring = (key, val) => setForm(f => ({ ...f, scoring: { ...f.scoring, [key]: val } }));
  const score = calcScoreGlobal(form.scoring);
  const reco = getRecommandation(score);

  const radarData = form.scoring ? [
    { axis: "Innovation", value: form.scoring.innovation },
    { axis: "Recrutement", value: form.scoring.recrutement },
    { axis: "Influence", value: form.scoring.influence },
    { axis: "Business", value: form.scoring.business },
    { axis: "Coût", value: form.scoring.cout },
  ] : [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} />Retour
        </button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.primary }}>{event ? "Modifier" : "Nouvel"} événement</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: form */}
        <div>
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>Informations générales</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <TextInput label="Nom" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} placeholder="Ex: Mêlée Numérique" />
              <Select label="Territoire" value={form.territoire} onChange={v => setForm(f => ({ ...f, territoire: v }))} options={TERRITORIES.filter(t => t !== "Tous")} />
              <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={TYPES.filter(t => t !== "Tous")} />
              <TextInput label="Organisateur" value={form.organisateur} onChange={v => setForm(f => ({ ...f, organisateur: v }))} placeholder="Ex: La Mêlée" />
              <TextInput label="Date" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
              <NumberInput label="Budget (€)" value={form.budget} onChange={v => setForm(f => ({ ...f, budget: v }))} />
            </div>
          </div>

          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>Scoring de pertinence</h3>
            <SliderInput label="🚀 Innovation" value={form.scoring.innovation} onChange={v => updateScoring("innovation", v)} />
            <SliderInput label="🎓 Recrutement" value={form.scoring.recrutement} onChange={v => updateScoring("recrutement", v)} />
            <SliderInput label="📢 Influence" value={form.scoring.influence} onChange={v => updateScoring("influence", v)} />
            <SliderInput label="💼 Business" value={form.scoring.business} onChange={v => updateScoring("business", v)} />
            <SliderInput label="💰 Coût (rapport qualité/prix)" value={form.scoring.cout} onChange={v => updateScoring("cout", v)} />
          </div>
        </div>

        {/* Right: score result + radar */}
        <div>
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, textAlign: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>Score global</h3>
            <ScoreGauge score={score} size={140} />
            <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: reco.color + "10", border: `1px solid ${reco.color}30` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: reco.color, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{reco.icon} Recommandation : {reco.label}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>
                {score >= 80 && "Investissement prioritaire – fort potentiel sur tous les axes."}
                {score >= 65 && score < 80 && "Investissement justifié – bons résultats attendus."}
                {score >= 50 && score < 65 && "Résultats mitigés – revoir les conditions ou le format."}
                {score < 50 && "ROI insuffisant – envisager le désengagement."}
              </div>
            </div>
          </div>

          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 8 }}>Radar des critères</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke={COLORS.border} />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: COLORS.muted }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: COLORS.muted }} />
                <Radar dataKey="value" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button onClick={() => onSave({ ...form, id: form.id || Date.now() })}
            style={{
              marginTop: 16, width: "100%", padding: "14px 24px", borderRadius: 10, border: "none",
              background: COLORS.accent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(233,78,27,0.3)", transition: "transform 0.15s"
            }}>
            {event ? "Mettre à jour" : "Enregistrer l'événement"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RESULTS VIEW ───
function ResultsView({ events, onSave }) {
  const [selectedId, setSelectedId] = useState(null);
  const ev = events.find(e => e.id === selectedId);

  const [results, setResults] = useState(null);

  const handleSelect = (e) => {
    setSelectedId(e.id);
    setResults(e.resultats || {
      contacts: 0, contactsQualifies: 0, startupsRencontrees: 0, startupsPertinentes: 0,
      pocLances: 0, projetsDeployes: 0, candidatsRencontres: 0, recrutements: 0, rdvMetiers: 0, projetsInities: 0
    });
  };

  if (!ev) {
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.primary, marginBottom: 20 }}>Saisie des résultats</h2>
        <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20 }}>Sélectionnez un événement pour saisir ses résultats post-participation.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {events.map(e => {
            const score = calcScoreGlobal(e.scoring);
            return (
              <div key={e.id} onClick={() => handleSelect(e)} style={{
                background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}`,
                cursor: "pointer", transition: "all 0.2s"
              }} onMouseEnter={ev => { ev.currentTarget.style.borderColor = COLORS.accent; ev.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={ev => { ev.currentTarget.style.borderColor = COLORS.border; ev.currentTarget.style.transform = "none"; }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.primary, marginBottom: 6 }}>{e.nom}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>{e.territoire} · {e.type}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge color={getRecommandation(score).color}>{score}/100</Badge>
                  {e.done ? <Badge color={COLORS.accent2}>Résultats saisis</Badge> : <Badge color={COLORS.accent4}>En attente</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const coutParContact = ev.budget && results.contactsQualifies ? Math.round(ev.budget / results.contactsQualifies) : "—";
  const coutParStartup = ev.budget && results.startupsRencontrees ? Math.round(ev.budget / results.startupsRencontrees) : "—";
  const coutParPOC = ev.budget && results.pocLances ? Math.round(ev.budget / results.pocLances) : "—";
  const coutParRecrut = ev.budget && results.recrutements ? Math.round(ev.budget / results.recrutements) : "—";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} />Retour
        </button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.primary }}>Résultats : {ev.nom}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          {/* Networking */}
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>🤝 Networking</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NumberInput label="Contacts totaux" value={results.contacts} onChange={v => setResults(r => ({ ...r, contacts: v }))} />
              <NumberInput label="Contacts qualifiés" value={results.contactsQualifies} onChange={v => setResults(r => ({ ...r, contactsQualifies: v }))} />
              <NumberInput label="Startups rencontrées" value={results.startupsRencontrees} onChange={v => setResults(r => ({ ...r, startupsRencontrees: v }))} />
            </div>
          </div>
          {/* Innovation */}
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>🚀 Innovation</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <NumberInput label="Startups pertinentes" value={results.startupsPertinentes} onChange={v => setResults(r => ({ ...r, startupsPertinentes: v }))} />
              <NumberInput label="POC lancés" value={results.pocLances} onChange={v => setResults(r => ({ ...r, pocLances: v }))} />
              <NumberInput label="Projets déployés" value={results.projetsDeployes} onChange={v => setResults(r => ({ ...r, projetsDeployes: v }))} />
            </div>
          </div>
          {/* Recrutement */}
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>🎓 Recrutement</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NumberInput label="Candidats rencontrés" value={results.candidatsRencontres} onChange={v => setResults(r => ({ ...r, candidatsRencontres: v }))} />
              <NumberInput label="Recrutements" value={results.recrutements} onChange={v => setResults(r => ({ ...r, recrutements: v }))} />
            </div>
          </div>
          {/* Business */}
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>💼 Business</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NumberInput label="RDV métiers" value={results.rdvMetiers} onChange={v => setResults(r => ({ ...r, rdvMetiers: v }))} />
              <NumberInput label="Projets initiés" value={results.projetsInities} onChange={v => setResults(r => ({ ...r, projetsInities: v }))} />
            </div>
          </div>
        </div>

        {/* Right: KPIs */}
        <div>
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>📊 Indicateurs de coût</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 10, background: COLORS.bg, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 4 }}>Coût / contact qualifié</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.accent }}>{typeof coutParContact === "number" ? `${coutParContact}€` : coutParContact}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: COLORS.bg, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 4 }}>Coût / startup</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.accent3 }}>{typeof coutParStartup === "number" ? `${coutParStartup}€` : coutParStartup}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: COLORS.bg, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 4 }}>Coût / POC</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.accent2 }}>{typeof coutParPOC === "number" ? `${coutParPOC}€` : coutParPOC}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: COLORS.bg, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 4 }}>Coût / recrutement</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#EC4899" }}>{typeof coutParRecrut === "number" ? `${coutParRecrut}€` : coutParRecrut}</div>
              </div>
            </div>
          </div>

          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0, marginBottom: 16 }}>Synthèse scoring vs résultats</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={[
                { axis: "Innovation", scoring: ev.scoring.innovation, resultat: results.startupsPertinentes * 10 },
                { axis: "Recrutement", scoring: ev.scoring.recrutement, resultat: results.recrutements * 50 },
                { axis: "Influence", scoring: ev.scoring.influence, resultat: results.contacts > 0 ? Math.min(100, results.contacts) : 0 },
                { axis: "Business", scoring: ev.scoring.business, resultat: results.projetsInities * 25 },
                { axis: "Coût", scoring: ev.scoring.cout, resultat: 0 },
              ]} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke={COLORS.border} />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: COLORS.muted }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar dataKey="scoring" name="Scoring attendu" stroke={COLORS.accent3} fill={COLORS.accent3} fillOpacity={0.15} strokeWidth={2} />
                <Radar dataKey="resultat" name="Résultat réel" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button onClick={() => { onSave(ev.id, results); setSelectedId(null); }}
            style={{
              width: "100%", padding: "14px 24px", borderRadius: 10, border: "none",
              background: COLORS.accent2, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,168,107,0.3)"
            }}>
            Enregistrer les résultats
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPARE VIEW ───
function CompareView({ events }) {
  const doneEvents = events.filter(e => e.done);
  const [sortKey, setSortKey] = useState("score");

  const sorted = [...doneEvents].sort((a, b) => {
    if (sortKey === "score") return calcScoreGlobal(b.scoring) - calcScoreGlobal(a.scoring);
    if (sortKey === "roi") return (calcROI(b) || 0) - (calcROI(a) || 0);
    if (sortKey === "innovation") return (b.resultats?.pocLances || 0) - (a.resultats?.pocLances || 0);
    if (sortKey === "budget") return a.budget - b.budget;
    return 0;
  });

  const compData = sorted.map(e => ({
    name: e.nom.length > 18 ? e.nom.slice(0, 18) + "…" : e.nom,
    score: calcScoreGlobal(e.scoring),
    roi: calcROI(e) || 0,
    contacts: e.resultats?.contactsQualifies || 0,
    pocs: e.resultats?.pocLances || 0,
  }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.primary }}>Comparateur d'événements</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ k: "score", l: "Score" }, { k: "roi", l: "ROI" }, { k: "innovation", l: "Innovation" }, { k: "budget", l: "Budget" }].map(s => (
            <button key={s.k} onClick={() => setSortKey(s.k)} style={{
              padding: "6px 14px", borderRadius: 8, border: `1px solid ${sortKey === s.k ? COLORS.accent : COLORS.border}`,
              background: sortKey === s.k ? COLORS.accent + "12" : COLORS.card, color: sortKey === s.k ? COLORS.accent : COLORS.muted,
              fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>Trier par {s.l}</button>
          ))}
        </div>
      </div>

      {/* Comparison chart */}
      <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={compData} layout="vertical" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: COLORS.primary, fontWeight: 600 }} width={140} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            <Bar dataKey="score" name="Score /100" fill={COLORS.accent3} radius={[0, 4, 4, 0]} barSize={14} />
            <Bar dataKey="contacts" name="Contacts qualifiés" fill={COLORS.accent2} radius={[0, 4, 4, 0]} barSize={14} />
            <Bar dataKey="pocs" name="POC lancés" fill={COLORS.accent} radius={[0, 4, 4, 0]} barSize={14} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed comparison table */}
      <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                {["Événement", "Territoire", "Budget", "Score", "ROI", "Contacts Q.", "Startups", "POC", "Projets", "Recrut.", "Coût/Contact", "Coût/POC"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: COLORS.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => {
                const r = e.resultats;
                const score = calcScoreGlobal(e.scoring);
                const roi = calcROI(e);
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: COLORS.primary }}>{e.nom}</td>
                    <td style={{ padding: "10px 8px" }}><Badge color={COLORS.accent3}>{e.territoire}</Badge></td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{(e.budget / 1000).toFixed(0)}k€</td>
                    <td style={{ padding: "10px 8px" }}><Badge color={getRecommandation(score).color}>{score}</Badge></td>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: roi > 0 ? COLORS.accent2 : COLORS.accent }}>{roi !== null ? `${roi > 0 ? "+" : ""}${roi}%` : "—"}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r?.contactsQualifies || 0}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r?.startupsRencontrees || 0}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r?.pocLances || 0}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r?.projetsDeployes || 0}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r?.recrutements || 0}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r?.contactsQualifies ? `${Math.round(e.budget / r.contactsQualifies)}€` : "—"}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r?.pocLances ? `${Math.round(e.budget / r.pocLances)}€` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── EVENT DETAIL (from dashboard click) ───
function EventDetail({ event, onBack, onEditScoring, onEditResults }) {
  const score = calcScoreGlobal(event.scoring);
  const reco = getRecommandation(score);
  const roi = calcROI(event);
  const r = event.resultats;

  const radarData = [
    { axis: "Innovation", value: event.scoring.innovation },
    { axis: "Recrutement", value: event.scoring.recrutement },
    { axis: "Influence", value: event.scoring.influence },
    { axis: "Business", value: event.scoring.business },
    { axis: "Coût", value: event.scoring.cout },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} />Dashboard
        </button>
      </div>

      {/* Header */}
      <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.primary }}>{event.nom}</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Badge color={COLORS.accent3}><MapPin size={12} />{event.territoire}</Badge>
            <Badge color={COLORS.muted}>{event.type}</Badge>
            <Badge color={COLORS.muted}>{event.date}</Badge>
            <Badge color={COLORS.accent}><Euro size={12} />{(event.budget / 1000).toFixed(0)}k€</Badge>
          </div>
        </div>
        <ScoreGauge score={score} size={110} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Radar */}
        <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0 }}>Scoring détaillé</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: COLORS.muted }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: COLORS.muted }} />
              <Radar dataKey="value" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Results */}
        <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginTop: 0 }}>Résultats</h3>
            {roi !== null && <Badge color={roi > 0 ? COLORS.accent2 : COLORS.accent}>ROI : {roi > 0 ? "+" : ""}{roi}%</Badge>}
          </div>
          {r ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              {[
                { l: "Contacts qualifiés", v: r.contactsQualifies, c: COLORS.accent3 },
                { l: "Startups rencontrées", v: r.startupsRencontrees, c: COLORS.accent4 },
                { l: "Startups pertinentes", v: r.startupsPertinentes, c: COLORS.accent2 },
                { l: "POC lancés", v: r.pocLances, c: "#8B5CF6" },
                { l: "Projets déployés", v: r.projetsDeployes, c: COLORS.primary },
                { l: "Recrutements", v: r.recrutements, c: "#EC4899" },
                { l: "RDV métiers", v: r.rdvMetiers, c: COLORS.accent },
                { l: "Projets initiés", v: r.projetsInities, c: COLORS.accent3 },
              ].map(item => (
                <div key={item.l} style={{ padding: 12, borderRadius: 8, background: COLORS.bg }}>
                  <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, marginBottom: 2 }}>{item.l}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: item.c }}>{item.v}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>
              <p style={{ fontSize: 13, margin: 0 }}>Pas encore de résultats saisis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [view, setView] = useState("dashboard");
  const [editEvent, setEditEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);

  const handleSaveEvent = (ev) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === ev.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = ev; return n; }
      return [...prev, ev];
    });
    setView("dashboard");
    setEditEvent(null);
  };

  const handleSaveResults = (eventId, results) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, resultats: results, done: true } : e));
  };

  const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { key: "scoring", label: "Nouvel événement", icon: <PlusCircle size={16} /> },
    { key: "resultats", label: "Résultats", icon: <ClipboardCheck size={16} /> },
    { key: "compare", label: "Comparateur", icon: <GitCompareArrows size={16} /> },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: COLORS.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: COLORS.primary, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>EventScore</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 500 }}>Pilotage des écosystèmes numériques · 574 Centre-Ouest</div>
          </div>
        </div>
        <Tabs items={NAV_ITEMS} active={detailEvent ? "dashboard" : view} onChange={(k) => { setView(k); setEditEvent(null); setDetailEvent(null); }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {detailEvent ? (
          <EventDetail event={detailEvent} onBack={() => setDetailEvent(null)} />
        ) : view === "dashboard" ? (
          <DashboardView events={events} onSelect={(e) => setDetailEvent(e)} />
        ) : view === "scoring" ? (
          <ScoringView event={editEvent} onSave={handleSaveEvent} onCancel={() => { setView("dashboard"); setEditEvent(null); }} />
        ) : view === "resultats" ? (
          <ResultsView events={events} onSave={handleSaveResults} />
        ) : view === "compare" ? (
          <CompareView events={events} />
        ) : null}
      </div>
    </div>
  );
}
