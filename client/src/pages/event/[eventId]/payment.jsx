import NavBar from "@/components/UserNavBar";
import { getUserToken } from "@/utils/getUserToken";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

// ─── Notification Overlay ────────────────────────────────────────────────────
const Notification = ({ type, title, message, onClose, onAction, actionLabel }) => {
    const config = {
        success: {
            bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
            iconBg: "rgba(74,222,128,0.15)",
            iconBorder: "rgba(74,222,128,0.4)",
            iconColor: "#4ade80",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="19" stroke="#4ade80" strokeWidth="2"/>
                    <path d="M12 20l6 6 10-12" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            particles: ["#4ade80", "#a78bfa", "#60a5fa", "#f472b6", "#facc15"],
        },
        error: {
            bg: "linear-gradient(135deg, #1a0a0a 0%, #2d1010 50%, #1a0a0a 100%)",
            iconBg: "rgba(248,113,113,0.15)",
            iconBorder: "rgba(248,113,113,0.4)",
            iconColor: "#f87171",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="19" stroke="#f87171" strokeWidth="2"/>
                    <path d="M14 14l12 12M26 14l-12 12" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
            ),
            particles: [],
        },
        info: {
            bg: "linear-gradient(135deg, #0f0c29 0%, #1e3a5f 50%, #0f0c29 100%)",
            iconBg: "rgba(96,165,250,0.15)",
            iconBorder: "rgba(96,165,250,0.4)",
            iconColor: "#60a5fa",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="19" stroke="#60a5fa" strokeWidth="2"/>
                    <path d="M20 13v2M20 19v8" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
            ),
            particles: ["#60a5fa", "#a78bfa"],
        },
    };

    const c = config[type] || config.info;

    // Confetti particles for success
    const particles = type === "success"
        ? Array.from({ length: 18 }).map((_, i) => ({
              id: i,
              color: c.particles[i % c.particles.length],
              left: `${5 + Math.random() * 90}%`,
              delay: `${Math.random() * 0.6}s`,
              size: 6 + Math.random() * 6,
              duration: `${0.8 + Math.random() * 0.6}s`,
          }))
        : [];

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes overlayIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes confettiFall {
                    0%   { opacity: 1; transform: translateY(-20px) rotate(0deg); }
                    100% { opacity: 0; transform: translateY(120px) rotate(360deg); }
                }
                @keyframes pulseRing {
                    0%   { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
            `}</style>

            {/* Backdrop */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "overlayIn 0.25s ease",
                padding: "16px",
            }}>
                {/* Confetti */}
                {particles.map(p => (
                    <div key={p.id} style={{
                        position: "absolute", top: "30%", left: p.left,
                        width: p.size, height: p.size,
                        background: p.color, borderRadius: "2px",
                        animation: `confettiFall ${p.duration} ${p.delay} ease-out forwards`,
                        pointerEvents: "none",
                    }} />
                ))}

                {/* Card */}
                <div style={{
                    background: c.bg,
                    borderRadius: 24,
                    padding: "48px 40px 40px",
                    maxWidth: 420, width: "100%",
                    textAlign: "center",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
                    animation: "fadeUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Subtle top glow */}
                    <div style={{
                        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                        width: 200, height: 2,
                        background: `linear-gradient(to right, transparent, ${c.iconColor}, transparent)`,
                    }} />

                    {/* Icon with pulse ring */}
                    <div style={{ position: "relative", display: "inline-flex", marginBottom: 24 }}>
                        <div style={{
                            position: "absolute", inset: -8,
                            borderRadius: "50%",
                            border: `2px solid ${c.iconColor}`,
                            animation: "pulseRing 1.5s ease-out infinite",
                        }} />
                        <div style={{
                            width: 80, height: 80, borderRadius: "50%",
                            background: c.iconBg,
                            border: `2px solid ${c.iconBorder}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {c.icon}
                        </div>
                    </div>

                    {/* Title */}
                    <h2 style={{
                        margin: "0 0 12px",
                        fontSize: 26, fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.5px",
                        fontFamily: "'Inter', sans-serif",
                    }}>{title}</h2>

                    {/* Message */}
                    <p style={{
                        margin: "0 0 36px",
                        fontSize: 15, color: "rgba(255,255,255,0.65)",
                        lineHeight: 1.6,
                        fontFamily: "'Inter', sans-serif",
                    }}>{message}</p>

                    {/* Action button */}
                    {onAction && (
                        <button onClick={onAction} style={{
                            width: "100%", padding: "14px 24px",
                            borderRadius: 12, border: "none", cursor: "pointer",
                            fontSize: 15, fontWeight: 700,
                            fontFamily: "'Inter', sans-serif",
                            color: "#fff",
                            background: type === "success"
                                ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                                : type === "error"
                                ? "linear-gradient(135deg, #f87171 0%, #ef4444 100%)"
                                : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                            boxShadow: type === "success"
                                ? "0 8px 24px rgba(74,222,128,0.3)"
                                : type === "error"
                                ? "0 8px 24px rgba(248,113,113,0.3)"
                                : "0 8px 24px rgba(96,165,250,0.3)",
                            transition: "transform 0.15s, box-shadow 0.15s",
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            {actionLabel || "Continue"}
                        </button>
                    )}

                    {/* Dismiss (for errors) */}
                    {onClose && !onAction && (
                        <button onClick={onClose} style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.7)",
                            borderRadius: 12, padding: "12px 32px",
                            fontSize: 14, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                        }}>Dismiss</button>
                    )}

                    {/* Secondary dismiss under action */}
                    {onAction && onClose && (
                        <button onClick={onClose} style={{
                            marginTop: 12,
                            background: "none", border: "none",
                            color: "rgba(255,255,255,0.35)",
                            fontSize: 13, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                        }}>Close</button>
                    )}
                </div>
            </div>
        </>
    );
};

// ─── Checkout Form ────────────────────────────────────────────────────────────
const CheckoutForm = ({ product, handleToken }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        const cardElement = elements.getElement(CardElement);
        const { error, token } = await stripe.createToken(cardElement);
        if (error) {
            setCardError(error.message);
            setLoading(false);
        } else {
            setCardError(null);
            token.email = "test@example.com";
            token.card.address_line1 = "123 Main St";
            token.card.address_city = "City";
            token.card.address_zip = "12345";
            await handleToken(null, token, {});
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            background: "linear-gradient(145deg, #1e1b4b, #16153a)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: 16, padding: 28,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            width: "100%", maxWidth: 360,
        }}>
            <h3 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 18, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
                Card Details
            </h3>

            {/* Card input */}
            <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(167,139,250,0.25)",
                borderRadius: 10, padding: "14px 16px", marginBottom: 16,
            }}>
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: "16px", color: "#e2e8f0",
                            fontFamily: "'Inter', sans-serif",
                            "::placeholder": { color: "rgba(255,255,255,0.3)" },
                        },
                        invalid: { color: "#f87171" },
                    },
                }} />
            </div>

            {cardError && (
                <div style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 8, padding: "10px 14px",
                    color: "#f87171", fontSize: 13, marginBottom: 16,
                    fontFamily: "'Inter', sans-serif",
                }}>
                    ⚠ {cardError}
                </div>
            )}

            <button type="submit" disabled={!stripe || loading} style={{
                width: "100%", padding: "14px",
                background: loading
                    ? "rgba(167,139,250,0.3)"
                    : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                border: "none", borderRadius: 10,
                color: "#fff", fontWeight: 700, fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: loading ? "none" : "0 8px 24px rgba(124,58,237,0.4)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
                {loading ? (
                    <>
                        <svg style={{ animation: "spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="1.8"/>
                            <path d="M2 10h20" stroke="white" strokeWidth="1.8"/>
                        </svg>
                        Pay ₹{product.price || 0}
                    </>
                )}
            </button>

            <p style={{ textAlign: "center", marginTop: 14, color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
                🔒 Secured by Stripe · Test Mode
            </p>
        </form>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function payment() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [notification, setNotification] = useState(null); // { type, title, message, action }
    const [product, setProduct] = useState({ name: "", price: "", description: "" });

    const now = new Date();
    const future = new Date(now.getFullYear() + 2, now.getMonth());
    const month = future.getMonth() < 9 ? `0${future.getMonth() + 1}` : future.getMonth() + 1;
    const year = future.getFullYear().toString().substr(-2);
    const event_id = router.query.eventId;

    const showNotification = (type, title, message, action) => {
        setNotification({ type, title, message, action });
    };

    // Auth guard
    useEffect(() => {
        const user_id = getUserToken();
        if (!user_id) {
            router.push("/users/signin");
        } else {
            setIsAuthenticated(true);
        }
    }, []);

    // Fetch event
    useEffect(() => {
        if (!event_id) return;
        const fetchEvent = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getevent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ event_id }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setName(data.name);
                    setPrice(data.price);
                }
            } catch (e) {
                console.error("Event fetch error:", e);
            }
        };
        fetchEvent();
    }, [event_id]);

    useEffect(() => {
        if (name && price && event_id) {
            setProduct({ name, price, description: `Pay Rs. ${price} for the most awaited event, ${name}` });
        }
    }, [name, price, event_id]);

    const handleToken = async (event, token, addresses) => {
        const user_id = getUserToken();
        if (!user_id) {
            router.push("/users/signin");
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, product, addresses, user: { user_id }, event: { event_id } }),
            });
            const data = await res.json();

            if (data.status === "success") {
                showNotification("success",
                    "Payment Successful! 🎉",
                    "Your ticket has been sent to your email. Check your inbox for the digital ticket with QR code.",
                    () => router.push("/users/dashboard")
                );
            } else if (data.status === "alreadyregistered") {
                showNotification("info",
                    "Already Registered",
                    "You're already registered for this event. Head to your dashboard to view your ticket.",
                    () => router.push("/users/dashboard")
                );
            } else {
                const errMsg = data.error || data.message || "Unknown error";
                showNotification("error",
                    "Payment Failed",
                    errMsg,
                    null
                );
            }
        } catch (e) {
            console.error("Payment exception:", e);
            showNotification("error",
                "Something Went Wrong",
                "We couldn't process your payment. Please check your connection and try again.",
                null
            );
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, border: "3px solid rgba(167,139,250,0.3)", borderTop: "3px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                    <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif" }}>Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                * { box-sizing: border-box; }
            `}</style>

            {/* Custom notification overlay */}
            {notification && (
                <Notification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onAction={notification.action}
                    actionLabel={notification.type === "success" ? "Go to Dashboard →" : notification.type === "info" ? "View My Tickets →" : null}
                    onClose={() => setNotification(null)}
                />
            )}

            <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
                <NavBar />
                <Head>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
                </Head>

                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 60px", animation: "fadeIn 0.4s ease" }}>

                    {/* Header */}
                    <div style={{ marginBottom: 48 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)",
                            borderRadius: 20, padding: "6px 14px", marginBottom: 16,
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
                            <span style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>TEST MODE</span>
                        </div>
                        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, color: "#fff", fontFamily: "'Inter', sans-serif", letterSpacing: "-1px" }}>
                            Pay with{" "}
                            <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                stripe
                            </span>
                        </h1>
                        {name && <p style={{ marginTop: 8, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", fontSize: 16 }}>Registering for <strong style={{ color: "#c4b5fd" }}>{name}</strong> · ₹{price}</p>}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "flex-start" }}>

                        {/* Test credentials card */}
                        <div style={{
                            flex: 1, minWidth: 280,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 16, overflow: "hidden",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#a78bfa" strokeWidth="2"/><path d="M2 10h20" stroke="#a78bfa" strokeWidth="2"/></svg>
                                <span style={{ color: "#c4b5fd", fontWeight: 600, fontSize: 14, fontFamily: "'Inter', sans-serif" }}>Test Card Credentials</span>
                            </div>
                            {[
                                { label: "Card Number", value: "4242 4242 4242 4242", copy: true },
                                { label: "Expiry Date", value: `${month}/${year}` },
                                { label: "CVC", value: "Any 3 digits  (e.g. 345)" },
                            ].map((row, i) => (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "14px 20px",
                                    borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                }}>
                                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>{row.label}</span>
                                    <span
                                        style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, fontFamily: "'Inter', sans-serif", cursor: row.copy ? "pointer" : "default" }}
                                        onClick={() => row.copy && navigator.clipboard.writeText("4242424242424242")}
                                        title={row.copy ? "Click to copy" : ""}
                                    >
                                        {row.value} {row.copy && <span style={{ fontSize: 11, color: "#a78bfa" }}>copy</span>}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Stripe form */}
                        <Elements stripe={stripePromise}>
                            <CheckoutForm product={product} handleToken={handleToken} />
                        </Elements>

                    </div>
                </div>
            </div>
        </>
    );
}
