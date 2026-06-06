import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "thinkaward2024";

const STATUS_OPTIONS = [
  { value: "dispo", label: "En stock" },
  { value: "limite", label: "Stock limité" },
  { value: "rupture", label: "Rupture" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Récent", icon: "🕐" },
  { value: "enstock", label: "En stock", icon: "📦" },
  { value: "couleurs", label: "Couleurs", icon: "🎨" },
];

async function uploadImage(file) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("materials").upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from("materials").getPublicUrl(fileName);
  return data.publicUrl;
}

/* ───── Small Components ───── */
const StatusBadge = ({ status }) => {
  const config = {
    dispo: { label: "En stock", bg: "#00D4AA" },
    limite: { label: "Limité", bg: "#F5A623" },
    rupture: { label: "Rupture", bg: "#E74C3C" },
  };
  const c = config[status] || config.dispo;
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: "20px",
      fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px",
      textTransform: "uppercase", background: c.bg, color: "#fff", flexShrink: 0,
    }}>{c.label}</span>
  );
};

const Tag = ({ label }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px", borderRadius: "6px",
    fontSize: "11px", fontWeight: 500, background: "rgba(107,138,247,0.1)",
    color: "#6B8AF7", border: "1px solid rgba(107,138,247,0.2)",
  }}>{label}</span>
);

const FilterPill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "6px 16px", borderRadius: "20px",
    border: active ? "1.5px solid #6B8AF7" : "1.5px solid rgba(30,34,53,0.1)",
    background: active ? "rgba(107,138,247,0.08)" : "transparent",
    color: active ? "#6B8AF7" : "#8A8FA8",
    fontSize: "13px", fontWeight: active ? 600 : 500, cursor: "pointer",
    transition: "all 0.2s", whiteSpace: "nowrap",
  }}>{label}</button>
);

const SortPill = ({ label, icon, active, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 5,
    padding: "6px 14px", borderRadius: "20px",
    border: active ? "1.5px solid #6B8AF7" : "1.5px solid rgba(30,34,53,0.1)",
    background: active ? "rgba(107,138,247,0.08)" : "transparent",
    color: active ? "#6B8AF7" : "#8A8FA8",
    fontSize: "13px", fontWeight: active ? 600 : 500, cursor: "pointer",
    transition: "all 0.2s", whiteSpace: "nowrap",
  }}>
    <span style={{ fontSize: "14px" }}>{icon}</span> {label}
  </button>
);

/* ───── Material Card ───── */
const MaterialCard = ({ material, isAdmin, onDelete, onEdit }) => {
  const [hovered, setHovered] = useState(false);
  const hasHover = material.image_hover && material.image_hover !== "";
  const formatStock = (s) => s >= 10000 ? `${(s / 10000).toFixed(1)}m²` : `${s}cm²`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", background: "#fff", borderRadius: "16px",
        overflow: "hidden",
        boxShadow: hovered ? "0 20px 60px rgba(107,138,247,0.15)" : "0 4px 20px rgba(30,34,53,0.06)",
        transition: "all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {isAdmin && (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 6 }}>
          <button onClick={() => onEdit(material)}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              background: "rgba(107,138,247,0.9)", color: "#fff", fontSize: "14px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✎</button>
          <button onClick={() => { if (confirm("Supprimer ce matériau ?")) onDelete(material.id); }}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              background: "rgba(231,76,60,0.9)", color: "#fff", fontSize: "14px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
        </div>
      )}

      <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", position: "relative" }}>
        <img src={material.image} alt={material.name} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
          opacity: hovered && hasHover ? 0 : 1,
          transform: hovered && !hasHover ? "scale(1.08)" : "scale(1)",
        }} />
        {hasHover && (
          <img src={material.image_hover} alt={material.name + " hover"} style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            transition: "opacity 0.5s ease", opacity: hovered ? 1 : 0,
          }} />
        )}
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1E2235", letterSpacing: "-0.3px", lineHeight: 1.3 }}>{material.name}</h3>
          <StatusBadge status={material.status} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: isAdmin ? 16 : 0 }}>
          <Tag label={material.category} />
          {material.finish && <Tag label={material.finish} />}
          {material.transparency && <Tag label={material.transparency} />}
          {material.color && <Tag label={material.color} />}
        </div>
        {isAdmin && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 14, borderTop: "1px solid rgba(107,138,247,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "13px", color: "#8A8FA8", fontWeight: 500 }}>Stock :</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: material.stock === 0 ? "#E74C3C" : "#1E2235" }}>
                {formatStock(material.stock)}
              </span>
            </div>
            {material.supplier_url && (
              <a href={material.supplier_url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "6px 14px", borderRadius: "8px",
                  background: "rgba(107,138,247,0.08)", color: "#6B8AF7",
                  fontSize: "12px", fontWeight: 600, textDecoration: "none",
                  border: "1px solid rgba(107,138,247,0.15)",
                }}>Fournisseur →</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ───── Combo Input ───── */
const ComboInput = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const filtered = options.filter(o => o.toLowerCase().includes(inputVal.toLowerCase()));

  useEffect(() => { setInputVal(value); }, [value]);

  const handleSelect = (v) => { setInputVal(v); onChange(v); setOpen(false); };
  const handleChange = (e) => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true); };

  return (
    <div style={{ position: "relative" }}>
      <input value={inputVal} onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: "10px",
          border: "1.5px solid rgba(30,34,53,0.12)", fontSize: "14px",
          fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#FAFBFF",
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
          background: "#fff", borderRadius: "10px", marginTop: 4,
          boxShadow: "0 8px 30px rgba(30,34,53,0.12)", overflow: "hidden",
          maxHeight: 160, overflowY: "auto",
        }}>
          {filtered.map(o => (
            <div key={o} onMouseDown={() => handleSelect(o)} style={{
              padding: "9px 14px", fontSize: "13px", color: "#1E2235", cursor: "pointer",
              background: o === value ? "rgba(107,138,247,0.08)" : "transparent",
            }}
              onMouseEnter={e => e.target.style.background = "rgba(107,138,247,0.06)"}
              onMouseLeave={e => e.target.style.background = o === value ? "rgba(107,138,247,0.08)" : "transparent"}
            >{o}</div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───── Material Modal (Add + Edit) ───── */
const MaterialModal = ({ onSave, onClose, existingMaterials, editingMaterial }) => {
  const isEdit = !!editingMaterial;
  const [form, setForm] = useState({
    name: "", category: "", finish: "", transparency: "",
    color: "", stock: 0, status: "dispo", supplier_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageHoverFile, setImageHoverFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageHoverPreview, setImageHoverPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const fileHoverRef = useRef();

  useEffect(() => {
    if (editingMaterial) {
      setForm({
        name: editingMaterial.name || "",
        category: editingMaterial.category || "",
        finish: editingMaterial.finish || "",
        transparency: editingMaterial.transparency || "",
        color: editingMaterial.color || "",
        stock: editingMaterial.stock || 0,
        status: editingMaterial.status || "dispo",
        supplier_url: editingMaterial.supplier_url || "",
      });
      setImagePreview(editingMaterial.image || "");
      setImageHoverPreview(editingMaterial.image_hover || "");
    }
  }, [editingMaterial]);

  const handleFile = (setter, previewSetter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setter(file);
    const reader = new FileReader();
    reader.onload = (ev) => previewSetter(ev.target.result);
    reader.readAsDataURL(file);
  };

  const existingCategories = [...new Set(existingMaterials.map(m => m.category).filter(Boolean))];
  const existingFinishes = [...new Set(existingMaterials.map(m => m.finish).filter(Boolean))];
  const existingTransparencies = [...new Set(existingMaterials.map(m => m.transparency).filter(Boolean))];
  const existingColors = [...new Set(existingMaterials.map(m => m.color).filter(Boolean))];

  const labelStyle = { fontSize: "12px", fontWeight: 600, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" };
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1.5px solid rgba(30,34,53,0.12)", fontSize: "14px",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#FAFBFF",
  };

  const handleSubmit = async () => {
    if (!form.name) return alert("Le nom est obligatoire");
    if (!isEdit && !imageFile) return alert("La photo principale est obligatoire");
    if (!form.category) return alert("La catégorie est obligatoire");
    setLoading(true);
    try {
      let imageUrl = isEdit ? editingMaterial.image : "";
      let imageHoverUrl = isEdit ? (editingMaterial.image_hover || "") : "";

      if (imageFile) imageUrl = await uploadImage(imageFile);
      if (imageHoverFile) imageHoverUrl = await uploadImage(imageHoverFile);

      const payload = {
        name: form.name, image: imageUrl, image_hover: imageHoverUrl,
        category: form.category, finish: form.finish, transparency: form.transparency,
        color: form.color, stock: Number(form.stock), status: form.status,
        supplier_url: form.supplier_url,
      };

      if (isEdit) {
        const { data, error } = await supabase.from("materials")
          .update(payload).eq("id", editingMaterial.id).select().single();
        if (error) throw error;
        onSave(data, true);
      } else {
        const { data, error } = await supabase.from("materials")
          .insert(payload).select().single();
        if (error) throw error;
        onSave(data, false);
      }
      onClose();
    } catch (err) { alert("Erreur : " + err.message); }
    finally { setLoading(false); }
  };

  const ImageUpload = ({ preview, onClick, label, sub }) => (
    <div onClick={onClick} style={{
      flex: 1, aspectRatio: preview ? "16/9" : "3/1", minHeight: 80,
      borderRadius: "12px", border: preview ? "none" : "2px dashed rgba(107,138,247,0.3)",
      background: preview ? "transparent" : "rgba(107,138,247,0.04)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", overflow: "hidden", transition: "all 0.3s",
    }}>
      {preview ? (
        <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ textAlign: "center", color: "#8A8FA8", padding: 10 }}>
          <div style={{ fontSize: "22px", marginBottom: 4 }}>📷</div>
          <div style={{ fontSize: "12px", fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: "11px", fontWeight: 400, marginTop: 2, color: "#B0B5C9" }}>{sub}</div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(30,34,53,0.5)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "20px", padding: "32px",
        width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 30px 80px rgba(30,34,53,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#1E2235" }}>
            {isEdit ? "Modifier" : "Nouveau matériau"}<span style={{ color: "#6B8AF7" }}>.</span>
          </h2>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "10px", border: "1.5px solid rgba(30,34,53,0.08)",
            background: "transparent", fontSize: "16px", cursor: "pointer", color: "#8A8FA8",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Photos</label>
          <div style={{ display: "flex", gap: 12 }}>
            <ImageUpload preview={imagePreview} onClick={() => fileRef.current?.click()} label="Photo principale *" sub={isEdit ? "Cliquer pour changer" : "Obligatoire"} />
            <ImageUpload preview={imageHoverPreview} onClick={() => fileHoverRef.current?.click()} label="Photo au survol" sub="Optionnelle" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile(setImageFile, setImagePreview)} style={{ display: "none" }} />
          <input ref={fileHoverRef} type="file" accept="image/*" onChange={handleFile(setImageHoverFile, setImageHoverPreview)} style={{ display: "none" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nom du matériau *</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Chêne massif" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={labelStyle}>Catégorie *</label>
            <ComboInput value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={existingCategories} placeholder="Choisir ou créer" /></div>
          <div><label style={labelStyle}>Coloris</label>
            <ComboInput value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} options={existingColors} placeholder="Choisir ou créer" /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={labelStyle}>Finition</label>
            <ComboInput value={form.finish} onChange={v => setForm(f => ({ ...f, finish: v }))} options={existingFinishes} placeholder="Choisir ou créer" /></div>
          <div><label style={labelStyle}>Transparence</label>
            <ComboInput value={form.transparency} onChange={v => setForm(f => ({ ...f, transparency: v }))} options={existingTransparencies} placeholder="Choisir ou créer" /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={labelStyle}>Stock (cm²)</label>
            <input style={inputStyle} type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
          <div><label style={labelStyle}>Statut</label>
            <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select></div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>URL Fournisseur</label>
          <input style={inputStyle} value={form.supplier_url} onChange={e => setForm(f => ({ ...f, supplier_url: e.target.value }))} placeholder="https://..." />
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: "12px", border: "none",
          background: loading ? "#B0B5C9" : "#6B8AF7", color: "#fff", fontSize: "15px",
          fontWeight: 700, cursor: loading ? "wait" : "pointer",
        }}>
          {loading ? "Envoi en cours..." : isEdit ? "Enregistrer les modifications" : "Ajouter le matériau"}
        </button>
      </div>
    </div>
  );
};

/* ───── Main App ───── */
export default function App() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [filterColor, setFilterColor] = useState("Tous");
  const [filterFinish, setFilterFinish] = useState("Tous");
  const [filterTransparency, setFilterTransparency] = useState("Tous");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("materials").select("*").order("created_at", { ascending: true });
      if (!error && data) setMaterials(data);
      setLoading(false);
    }
    load();
  }, []);

  const categories = ["Tous", ...new Set(materials.map(m => m.category).filter(Boolean))];
  const colors = ["Tous", ...new Set(materials.map(m => m.color).filter(Boolean))];
  const finishes = ["Tous", ...new Set(materials.map(m => m.finish).filter(Boolean))];
  const transparencies = ["Tous", ...new Set(materials.map(m => m.transparency).filter(Boolean))];

  const statusPriority = { dispo: 0, limite: 1, rupture: 2 };

  const filtered = materials
    .filter(m => {
      const s = search.toLowerCase();
      const matchS = m.name.toLowerCase().includes(s) || m.category.toLowerCase().includes(s) || (m.color && m.color.toLowerCase().includes(s));
      const matchC = filterCategory === "Tous" || m.category === filterCategory;
      const matchCo = filterColor === "Tous" || m.color === filterColor;
      const matchF = filterFinish === "Tous" || m.finish === filterFinish;
      const matchT = filterTransparency === "Tous" || m.transparency === filterTransparency;
      return matchS && matchC && matchCo && matchF && matchT;
    })
    .sort((a, b) => {
      if (sortOrder === "recent") return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === "enstock") return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
      if (sortOrder === "couleurs") return (a.color || "").localeCompare(b.color || "");
      return 0;
    });

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setIsAdmin(true); setShowLogin(false); setPassword(""); }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (!error) setMaterials(prev => prev.filter(x => x.id !== id));
  };

  const handleSave = (data, isEdit) => {
    if (isEdit) {
      setMaterials(prev => prev.map(m => m.id === data.id ? data : m));
    } else {
      setMaterials(prev => [...prev, data]);
    }
  };

  const openAdd = () => { setEditingMaterial(null); setShowModal(true); };
  const openEdit = (m) => { setEditingMaterial(m); setShowModal(true); };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F5FEFF", fontFamily: "'Outfit', system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center", color: "#8A8FA8" }}>
          <div style={{ fontSize: "28px", marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: "15px", fontWeight: 500 }}>Chargement du catalogue...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#F5FEFF",
      fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ padding: "40px 32px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "#1E2235", letterSpacing: "-1px" }}>
              Matériaux<span style={{ color: "#6B8AF7" }}>.</span>
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "15px", color: "#8A8FA8", fontWeight: 400 }}>
              Catalogue des matières premières disponibles
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {isAdmin && (
              <button onClick={openAdd} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 20px", borderRadius: "12px", border: "none",
                background: "#6B8AF7", color: "#fff", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}>+ Ajouter</button>
            )}
            {!isAdmin && !showLogin && (
              <button onClick={() => setShowLogin(true)} style={{
                width: 40, height: 40, borderRadius: "12px",
                border: "1.5px solid rgba(30,34,53,0.08)",
                background: "rgba(255,255,255,0.8)", color: "#8A8FA8",
                fontSize: "18px", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>⚙</button>
            )}
            {isAdmin && (
              <button onClick={() => setIsAdmin(false)} style={{
                padding: "10px 16px", borderRadius: "12px",
                border: "1.5px solid rgba(231,76,60,0.2)",
                background: "rgba(231,76,60,0.05)", color: "#E74C3C",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
              }}>Déconnexion</button>
            )}
          </div>
        </div>

        {/* Login */}
        {showLogin && (
          <div style={{
            display: "flex", gap: 8, marginBottom: 24, padding: "16px 20px",
            background: "#fff", borderRadius: "14px",
            boxShadow: "0 4px 20px rgba(30,34,53,0.06)", alignItems: "center",
          }}>
            <input type="password" placeholder="Mot de passe admin" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: "10px",
                border: "1.5px solid rgba(107,138,247,0.2)", fontSize: "14px",
                outline: "none", fontFamily: "inherit",
              }} />
            <button onClick={handleLogin} style={{
              padding: "10px 20px", borderRadius: "10px", border: "none",
              background: "#6B8AF7", color: "#fff", fontSize: "14px",
              fontWeight: 600, cursor: "pointer",
            }}>Connexion</button>
            <button onClick={() => { setShowLogin(false); setPassword(""); }} style={{
              padding: "10px 14px", borderRadius: "10px",
              border: "1.5px solid rgba(30,34,53,0.08)",
              background: "transparent", color: "#8A8FA8", fontSize: "14px", cursor: "pointer",
            }}>✕</button>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            fontSize: "18px", color: "#B0B5C9", pointerEvents: "none",
          }}>⌕</span>
          <input type="text" placeholder="Rechercher un matériau..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "14px 20px 14px 44px", borderRadius: "14px",
              border: "1.5px solid rgba(30,34,53,0.06)", background: "#fff",
              fontSize: "15px", color: "#1E2235", outline: "none",
              boxShadow: "0 2px 12px rgba(30,34,53,0.03)", fontFamily: "inherit",
              boxSizing: "border-box",
            }} />
        </div>

        {/* Sort + Filters */}
        <div style={{
          background: "#fff", borderRadius: "14px", padding: "16px 20px",
          boxShadow: "0 2px 12px rgba(30,34,53,0.03)",
          border: "1.5px solid rgba(30,34,53,0.06)", marginBottom: 28,
        }}>
          {/* Sort row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14, paddingBottom: 14,
            borderBottom: "1px solid rgba(30,34,53,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Trier par</span>
              <div style={{ display: "flex", gap: 4 }}>
                {SORT_OPTIONS.map(s => (
                  <SortPill key={s.value} label={s.label} icon={s.icon} active={sortOrder === s.value} onClick={() => setSortOrder(s.value)} />
                ))}
              </div>
            </div>
            <span style={{ fontSize: "13px", color: "#8A8FA8" }}>{filtered.length} matériau{filtered.length > 1 ? "x" : ""}</span>
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Filtrer</span>

            {categories.length > 1 && (
              <>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {categories.map(c => <FilterPill key={c} label={c} active={filterCategory === c} onClick={() => setFilterCategory(c)} />)}
                </div>
                {(colors.length > 1 || finishes.length > 1 || transparencies.length > 1) && (
                  <div style={{ width: 1, height: 20, background: "rgba(30,34,53,0.1)", margin: "0 4px" }} />
                )}
              </>
            )}

            {colors.length > 1 && (
              <>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {colors.map(c => <FilterPill key={c} label={c} active={filterColor === c} onClick={() => setFilterColor(c)} />)}
                </div>
                {(finishes.length > 1 || transparencies.length > 1) && (
                  <div style={{ width: 1, height: 20, background: "rgba(30,34,53,0.1)", margin: "0 4px" }} />
                )}
              </>
            )}

            {finishes.length > 1 && (
              <>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {finishes.map(f => <FilterPill key={f} label={f} active={filterFinish === f} onClick={() => setFilterFinish(f)} />)}
                </div>
                {transparencies.length > 1 && (
                  <div style={{ width: 1, height: 20, background: "rgba(30,34,53,0.1)", margin: "0 4px" }} />
                )}
              </>
            )}

            {transparencies.length > 1 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {transparencies.map(t => <FilterPill key={t} label={t} active={filterTransparency === t} onClick={() => setFilterTransparency(t)} />)}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {materials.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#8A8FA8" }}>
            <div style={{ fontSize: "40px", marginBottom: 16 }}>📦</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: 6 }}>Aucun matériau pour l'instant</div>
            <div style={{ fontSize: "14px" }}>Connectez-vous en admin pour ajouter vos premiers matériaux</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8A8FA8", fontSize: "16px" }}>Aucun matériau trouvé</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {filtered.map(m => (
              <MaterialCard key={m.id} material={m} isAdmin={isAdmin} onDelete={handleDelete} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          padding: "8px 20px", borderRadius: "12px", background: "#1E2235",
          color: "#00D4AA", fontSize: "13px", fontWeight: 600,
          boxShadow: "0 8px 30px rgba(30,34,53,0.3)",
        }}>● Mode admin actif</div>
      )}

      {showModal && (
        <MaterialModal
          existingMaterials={materials}
          editingMaterial={editingMaterial}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingMaterial(null); }}
        />
      )}
    </div>
  );
}
