import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TicketPage() {
    const router = useRouter();
    const { passId } = router.query;

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!passId) return;
        const fetchTicket = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ticket/${passId}`);
                if (!res.ok) {
                    setError("Ticket not found. This QR code may be invalid.");
                } else {
                    const data = await res.json();
                    setTicket(data);
                }
            } catch (e) {
                setError("Could not load ticket. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [passId]);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>Loading your ticket...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.errorIcon}>✗</div>
                <p style={{ color: "#ff6b6b", marginTop: 16, fontSize: 18, fontWeight: 600 }}>{error}</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{ticket.event.name} — EventX Ticket</title>
                <meta name="description" content={`Digital ticket for ${ticket.attendee} at ${ticket.event.name}`} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
            </Head>

            <div style={styles.page}>
                {/* Background glow blobs */}
                <div style={styles.blob1} />
                <div style={styles.blob2} />

                <div style={styles.ticketWrapper}>
                    {/* ── TOP SECTION ── */}
                    <div style={styles.ticketTop}>
                        {/* Event Cover */}
                        <div style={styles.coverWrap}>
                            <img
                                src={ticket.event.cover}
                                alt={ticket.event.name}
                                style={styles.coverImg}
                                onError={(e) => { e.target.src = "https://eventplanning24x7.files.wordpress.com/2018/04/events.png"; }}
                            />
                            <div style={styles.coverOverlay} />
                        </div>

                        {/* Event info on top of cover */}
                        <div style={styles.eventInfoOverlay}>
                            <span style={styles.badge}>✓ VALID TICKET</span>
                            <h1 style={styles.eventName}>{ticket.event.name}</h1>
                            <p style={styles.organizer}>by {ticket.event.organizer}</p>
                        </div>
                    </div>

                    {/* ── TEAR LINE ── */}
                    <div style={styles.tearLine}>
                        <div style={styles.tearCircleLeft} />
                        <div style={styles.tearDots} />
                        <div style={styles.tearCircleRight} />
                    </div>

                    {/* ── BOTTOM SECTION ── */}
                    <div style={styles.ticketBottom}>
                        {/* Left: Attendee + Event details */}
                        <div style={styles.detailsCol}>
                            <div style={styles.detailBlock}>
                                <span style={styles.detailLabel}>ATTENDEE</span>
                                <span style={styles.detailValue}>{ticket.attendee}</span>
                            </div>
                            <div style={styles.detailBlock}>
                                <span style={styles.detailLabel}>REG NO</span>
                                <span style={styles.detailValue}>{ticket.regNo || "—"}</span>
                            </div>
                            <div style={styles.detailBlock}>
                                <span style={styles.detailLabel}>DATE</span>
                                <span style={styles.detailValue}>{ticket.event.date || "TBA"}</span>
                            </div>
                            <div style={styles.detailBlock}>
                                <span style={styles.detailLabel}>TIME</span>
                                <span style={styles.detailValue}>{ticket.event.time || "TBA"}</span>
                            </div>
                            <div style={styles.detailBlock}>
                                <span style={styles.detailLabel}>VENUE</span>
                                <span style={styles.detailValue}>{ticket.event.venue}</span>
                            </div>
                            <div style={styles.detailBlock}>
                                <span style={styles.detailLabel}>AMOUNT PAID</span>
                                <span style={{ ...styles.detailValue, color: "#a78bfa" }}>₹{ticket.event.price}</span>
                            </div>

                            {/* Entry status */}
                            <div style={styles.entryStatus}>
                                <span style={ticket.entry ? styles.entryUsed : styles.entryValid}>
                                    {ticket.entry ? "🔴 ENTRY USED" : "🟢 VALID FOR ENTRY"}
                                </span>
                            </div>
                        </div>

                        {/* Right: Pass ID barcode-style */}
                        <div style={styles.passCol}>
                            <div style={styles.passIdBox}>
                                <span style={styles.passLabel}>PASS ID</span>
                                <span style={styles.passId}>{ticket.pass.substring(0, 12)}</span>
                                {/* Barcode lines decoration */}
                                <div style={styles.barcodeWrap}>
                                    {Array.from({ length: 28 }).map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                ...styles.barcodeLine,
                                                height: [3, 7, 5, 2, 9, 4, 6, 8, 3, 5, 7, 2, 4, 9, 6, 3, 8, 5, 4, 7, 2, 6, 9, 3, 5, 8, 4, 6][i] * 4,
                                                opacity: 0.6 + (i % 3) * 0.13,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={styles.passIdSmall}>{ticket.pass}</span>
                            </div>

                            {/* EventX branding */}
                            <div style={styles.brandBox}>
                                <span style={styles.brandText}>EVENT<span style={{ color: "#a78bfa" }}>X</span></span>
                                <span style={styles.brandSub}>Digital Ticket</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p style={styles.footer}>Present this ticket at the venue entrance · EventX</p>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
    },
    blob1: {
        position: "absolute", top: "-100px", left: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
    },
    blob2: {
        position: "absolute", bottom: "-80px", right: "-80px",
        width: "350px", height: "350px",
        background: "radial-gradient(circle, rgba(37,117,252,0.2) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
    },
    loadingContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
    },
    spinner: {
        width: 48, height: 48,
        border: "4px solid rgba(255,255,255,0.2)",
        borderTop: "4px solid #a78bfa",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    errorIcon: {
        width: 64, height: 64,
        background: "rgba(255,107,107,0.2)",
        border: "2px solid #ff6b6b",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, color: "#ff6b6b", fontWeight: 900,
    },
    ticketWrapper: {
        width: "100%", maxWidth: 480,
        borderRadius: 20,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
        overflow: "hidden",
        animation: "fadeIn 0.5s ease",
        position: "relative", zIndex: 1,
    },
    // TOP
    ticketTop: { position: "relative", height: 220, overflow: "hidden" },
    coverWrap: { position: "absolute", inset: 0 },
    coverImg: { width: "100%", height: "100%", objectFit: "cover" },
    coverOverlay: {
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(15,12,41,0.3) 0%, rgba(15,12,41,0.85) 100%)",
    },
    eventInfoOverlay: {
        position: "absolute", bottom: 20, left: 20, right: 20,
    },
    badge: {
        display: "inline-block",
        background: "rgba(167,139,250,0.25)",
        border: "1px solid rgba(167,139,250,0.5)",
        color: "#c4b5fd",
        fontSize: 10, fontWeight: 700, letterSpacing: 2,
        padding: "3px 10px", borderRadius: 20, marginBottom: 8,
    },
    eventName: {
        margin: 0, fontSize: 28, fontWeight: 900, color: "#fff",
        lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.5)",
    },
    organizer: {
        margin: "4px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13,
    },
    // TEAR LINE
    tearLine: {
        display: "flex", alignItems: "center",
        background: "#1e1b4b",
        position: "relative", height: 24,
    },
    tearCircleLeft: {
        width: 24, height: 24, borderRadius: "50%",
        background: "linear-gradient(135deg, #0f0c29, #302b63)",
        marginLeft: -12, flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
    },
    tearCircleRight: {
        width: 24, height: 24, borderRadius: "50%",
        background: "linear-gradient(135deg, #0f0c29, #302b63)",
        marginRight: -12, flexShrink: 0, marginLeft: "auto",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
    },
    tearDots: {
        flex: 1, height: 2,
        backgroundImage: "repeating-linear-gradient(to right, rgba(167,139,250,0.4) 0, rgba(167,139,250,0.4) 8px, transparent 8px, transparent 14px)",
    },
    // BOTTOM
    ticketBottom: {
        background: "#1e1b4b",
        display: "flex", gap: 0,
    },
    detailsCol: {
        flex: 1, padding: "20px 20px 24px",
        display: "flex", flexDirection: "column", gap: 12,
    },
    detailBlock: { display: "flex", flexDirection: "column", gap: 2 },
    detailLabel: {
        fontSize: 9, fontWeight: 700, letterSpacing: 2,
        color: "rgba(167,139,250,0.7)", textTransform: "uppercase",
    },
    detailValue: {
        fontSize: 14, fontWeight: 600, color: "#e2e8f0",
        lineHeight: 1.3,
    },
    entryStatus: { marginTop: 4 },
    entryValid: {
        fontSize: 12, fontWeight: 700, color: "#4ade80",
        background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
        padding: "4px 10px", borderRadius: 20,
    },
    entryUsed: {
        fontSize: 12, fontWeight: 700, color: "#f87171",
        background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
        padding: "4px 10px", borderRadius: 20,
    },
    // PASS COL
    passCol: {
        width: 130,
        borderLeft: "1px dashed rgba(167,139,250,0.2)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "20px 12px 24px",
        gap: 12,
    },
    passIdBox: {
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        flex: 1,
    },
    passLabel: {
        fontSize: 9, fontWeight: 700, letterSpacing: 2,
        color: "rgba(167,139,250,0.7)",
    },
    passId: {
        fontFamily: "'Space Mono', monospace",
        fontSize: 13, fontWeight: 700, color: "#e2e8f0",
        letterSpacing: 1,
    },
    barcodeWrap: {
        display: "flex", alignItems: "flex-end", gap: 2,
        padding: "8px 4px",
    },
    barcodeLine: {
        width: 2.5, background: "#a78bfa", borderRadius: 1,
    },
    passIdSmall: {
        fontFamily: "'Space Mono', monospace",
        fontSize: 7, color: "rgba(255,255,255,0.3)",
        wordBreak: "break-all", textAlign: "center",
    },
    brandBox: {
        display: "flex", flexDirection: "column", alignItems: "center",
    },
    brandText: {
        fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: 1,
    },
    brandSub: {
        fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1,
    },
    footer: {
        marginTop: 20, color: "rgba(255,255,255,0.35)", fontSize: 12,
        textAlign: "center", position: "relative", zIndex: 1,
    },
};
