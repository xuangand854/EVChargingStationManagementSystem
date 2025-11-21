import React, { useEffect, useState } from "react";
import { GetList, Update } from "../../../API/SystemConfiguration";
import "./SystemConfiguration.css";

export default function SystemConfigEditor() {
    const [items, setItems] = useState([]); // mảng các cấu hình
    const [loading, setLoading] = useState(false);
    const [savingIds, setSavingIds] = useState([]); // id đang lưu
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await GetList();
                // GetList có thể trả về: array OR { data: [...], message } OR { data: { data: [...] } }
                const list = Array.isArray(res)
                    ? res
                    : res?.data ?? res?.data?.data ?? [];
                setItems(list);
            } catch (err) {
                console.error(err);
                setError("Không tải được cấu hình.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div className="syscfg-loading">Đang tải...</div>;
    if (!items || items.length === 0) return <div className="syscfg-empty">Không có cấu hình để hiển thị.</div>;

    const toDateTimeLocal = (iso) => {
        if (!iso) return "";
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return "";
            // remove seconds and milliseconds for datetime-local
            return d.toISOString().slice(0, 16);
        } catch {
            return "";
        }
    };

    const toDisplay = (iso) => {
        if (!iso) return "-";
        try { return new Date(iso).toLocaleString(); } catch { return iso; }
    }

    const handleChange = (id, name, value) => {
        setItems(prev => prev.map(it => it.id === id ? { ...it, [name]: value } : it));
    };

    const handleSave = async (it) => {
        const id = it.id ?? it.Id;
        setError("");
        setSavingIds(s => [...s, id]);
        try {
            const payload = {
                minValue: it.minValue === null || it.minValue === "" ? null : Number(it.minValue),
                maxValue: it.maxValue === null || it.maxValue === "" ? null : Number(it.maxValue),
                effectedDateFrom: it.effectedDateFrom ? new Date(it.effectedDateFrom).toISOString() : null,
                effectedDateTo: it.effectedDateTo ? new Date(it.effectedDateTo).toISOString() : null
            };
            await Update(id, payload);
            setItems(prev => prev.map(x => x.id === id ? { ...x, _savedAt: new Date().toISOString(), ...payload } : x));
        } catch (err) {
            console.error(err);
            setError(`Cập nhật thất bại cho id=${id}`);
        } finally {
            setSavingIds(s => s.filter(x => x !== id));
        }
    };

    return (
        <div className="syscfg-container">
            <div className="syscfg-card">
                <div className="syscfg-card-header">
                    <h3 className="syscfg-title">System Configuration</h3>
                    <p className="syscfg-sub">Toàn bộ thông tin cấu hình hệ thống — xem & chỉnh sửa</p>
                </div>

                {error && <div className="syscfg-error">{error}</div>}

                <div style={{ display: "grid", gap: 12 }}>
                    {items.map((it) => (
                        <div key={it.id ?? it.Id} className="syscfg-item" style={{
                            border: "1px solid rgba(15,23,42,0.04)",
                            padding: 14,
                            borderRadius: 8,
                            display: "grid",
                            gridTemplateColumns: "1fr 420px",
                            gap: 12,
                            alignItems: "start",
                            background: "#fff"
                        }}>
                            {/* Left: full read-only info */}
                            <div style={{ lineHeight: 1.5 }}>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{it.name} <span style={{ color: "var(--muted)", fontSize: 13 }}>#{it.id}</span></div>
                                <div style={{ color: "var(--muted)", marginBottom: 10 }}>
                                    {it.description}
                                    {it.unit ? (
                                        <>
                                            <br />
                                            <span>Đơn vị: <span style={{ fontWeight: 600 }}>{it.unit}</span></span>
                                        </>
                                    ) : null}
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                                    <div><strong>Unit</strong><div className="muted-text">{it.unit ?? "-"}</div></div>
                                    <div><strong>Version</strong><div className="muted-text">{it.versionNo ?? "-"}</div></div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    <div><strong>Created At</strong><div className="muted-text">{toDisplay(it.createdAt)}</div></div>
                                    <div><strong>Updated At</strong><div className="muted-text">{toDisplay(it.updatedAt)}</div></div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                                    <div><strong>Created By</strong><div className="muted-text">{it.createdBy ?? "-"}</div></div>
                                    <div><strong>Updated By</strong><div className="muted-text">{it.updatedBy ?? "-"}</div></div>
                                </div>
                            </div>

                            {/* Right: editable fields + save */}
                            <div>
                                <div style={{ display: "grid", gap: 8 }}>
                                    <label style={{ fontSize: 13, color: "var(--muted)" }}>Giá trị</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={it.minValue ?? ""}
                                        onChange={(e) => handleChange(it.id, "minValue", e.target.value)}
                                    />


                                    {/* <label style={{ fontSize: 13, color: "var(--muted)" }}>maxValue</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={it.maxValue ?? ""}
                                        onChange={(e) => handleChange(it.id, "maxValue", e.target.value)}
                                    /> */}

                                    <label style={{ fontSize: 13, color: "var(--muted)" }}>effectedDateFrom</label>
                                    <input
                                        className="form-input"
                                        type="datetime-local"
                                        value={toDateTimeLocal(it.effectedDateFrom)}
                                        onChange={(e) => handleChange(it.id, "effectedDateFrom", e.target.value)}
                                    />

                                    <label style={{ fontSize: 13, color: "var(--muted)" }}>effectedDateTo</label>
                                    <input
                                        className="form-input"
                                        type="datetime-local"
                                        value={toDateTimeLocal(it.effectedDateTo)}
                                        onChange={(e) => handleChange(it.id, "effectedDateTo", e.target.value)}
                                    />

                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                // reset local edits by reloading from server for this item
                                                (async () => {
                                                    try {
                                                        setLoading(true);
                                                        const res = await GetList();
                                                        const list = Array.isArray(res) ? res : res?.data ?? res?.data?.data ?? [];
                                                        const fresh = list.find(x => x.id === it.id);
                                                        if (fresh) setItems(prev => prev.map(p => p.id === it.id ? fresh : p));
                                                    } finally { setLoading(false); }
                                                })();
                                            }}
                                            disabled={savingIds.includes(it.id)}
                                        >
                                            Hủy
                                        </button>

                                        <button
                                            className="btn btn-primary"
                                            onClick={(e) => { e.preventDefault(); handleSave(it); }}
                                            disabled={savingIds.includes(it.id)}
                                        >
                                            {savingIds.includes(it.id) ? "Đang lưu..." : "Lưu"}
                                        </button>
                                    </div>

                                    {it._savedAt && <div style={{ fontSize: 12, color: "#16a34a", textAlign: "right" }}>Đã lưu {new Date(it._savedAt).toLocaleString()}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}