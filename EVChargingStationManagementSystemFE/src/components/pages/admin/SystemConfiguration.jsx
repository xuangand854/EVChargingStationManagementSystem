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
                // GetList có thể trả về mảng trực tiếp hoặc object { data: [...], message: '' }
                const list = Array.isArray(res)
                    ? res
                    : (res?.data ?? res?.data?.data ?? []);
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
    if (!items || items.length === 0)
        return <div className="syscfg-empty">Không có cấu hình để hiển thị.</div>;

    const toDateTimeLocal = (iso) => {
        if (!iso) return "";
        try {
            // đảm bảo iso là string hợp lệ
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return "";
            // yyyy-mm-ddThh:mm (datetime-local)
            return d.toISOString().slice(0, 16);
        } catch {
            return "";
        }
    };

    const handleChange = (id, name, value) => {
        setItems(prev => prev.map(it => it.id === id ? { ...it, [name]: value } : it));
    };

    const handleSave = async (it) => {
        const id = it.id ?? it.Id;
        setError("");
        setSavingIds(s => [...s, id]);
        try {
            const payload = {
                minValue: it.minValue === null ? null : Number(it.minValue),
                maxValue: it.maxValue === null ? null : Number(it.maxValue),
                effectedDateFrom: it.effectedDateFrom ? new Date(it.effectedDateFrom).toISOString() : null,
                effectedDateTo: it.effectedDateTo ? new Date(it.effectedDateTo).toISOString() : null
            };
            await Update(id, payload);
            // cập nhật trạng thái thành công tạm thời
            setItems(prev => prev.map(x => x.id === id ? { ...x, _savedAt: new Date().toISOString() } : x));
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
                    <p className="syscfg-sub">Danh sách cấu hình hệ thống — chỉnh sửa và lưu từng mục</p>
                </div>

                {error && <div className="syscfg-error">{error}</div>}

                <div style={{ display: "grid", gap: 12 }}>
                    {items.map((it) => (
                        <div key={it.id ?? it.Id} className="syscfg-item" style={{
                            border: "1px solid rgba(15,23,42,0.04)",
                            padding: 12,
                            borderRadius: 8,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 10,
                            alignItems: "center"
                        }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{it.name}</div>
                                <div style={{ color: "var(--muted)", fontSize: 13 }}>{it.description}</div>
                            </div>

                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <input
                                        className="form-input"
                                        style={{ width: 120 }}
                                        type="number"
                                        name="minValue"
                                        value={it.minValue ?? ""}
                                        onChange={(e) => handleChange(it.id, "minValue", e.target.value)}
                                        placeholder="min"
                                    />
                                    <input
                                        className="form-input"
                                        style={{ width: 120 }}
                                        type="number"
                                        name="maxValue"
                                        value={it.maxValue ?? ""}
                                        onChange={(e) => handleChange(it.id, "maxValue", e.target.value)}
                                        placeholder="max"
                                    />
                                </div>

                                <div style={{ display: "flex", gap: 8 }}>
                                    <input
                                        className="form-input"
                                        type="datetime-local"
                                        name="effectedDateFrom"
                                        value={toDateTimeLocal(it.effectedDateFrom)}
                                        onChange={(e) => handleChange(it.id, "effectedDateFrom", e.target.value)}
                                    />
                                    <input
                                        className="form-input"
                                        type="datetime-local"
                                        name="effectedDateTo"
                                        value={toDateTimeLocal(it.effectedDateTo)}
                                        onChange={(e) => handleChange(it.id, "effectedDateTo", e.target.value)}
                                    />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: "6px 10px" }}
                                        onClick={(e) => { e.preventDefault(); handleSave(it); }}
                                        disabled={savingIds.includes(it.id ?? it.Id)}
                                    >
                                        {savingIds.includes(it.id ?? it.Id) ? "Đang lưu..." : "Lưu"}
                                    </button>

                                    <div style={{ fontSize: 12, color: "#16a34a" }}>
                                        {it._savedAt ? `Đã lưu ${new Date(it._savedAt).toLocaleString()}` : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}