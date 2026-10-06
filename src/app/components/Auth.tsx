import { useState, useEffect, useCallback } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import wolfLogo from "../../assets/eventia-wolf.svg";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface AuthProps {
  onNavigate: (page: string) => void;
}

export function Auth({ onNavigate }: AuthProps) {
  const { login, register, googleLogin } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setLoading(true);
    setError("");
    try {
      if (!response?.credential) {
        throw new Error("Token Google manquant");
      }
      await googleLogin(response.credential);
      onNavigate("dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur Google";
      setError(message.includes("non configuré") ? message : "Connexion Google impossible. Vérifiez votre clé Google ou le backend.");
    } finally {
      setLoading(false);
    }
  }, [googleLogin, onNavigate]);

  useEffect(() => {
    if (!googleClientId) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
      });
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [googleClientId, handleGoogleResponse]);

  const handleGoogleClick = () => {
    if (!googleClientId) {
      setError("Google OAuth non configuré. Ajoutez VITE_GOOGLE_CLIENT_ID dans votre .env frontend.");
      return;
    }
    if (!window.google?.accounts?.id) {
      setError("Le script Google n’a pas encore chargé. Réessayez dans quelques secondes.");
      return;
    }
    window.google.accounts.id.prompt();
  };
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Saisissez votre email et votre mot de passe.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await login(loginForm.email.trim(), loginForm.password);
      onNavigate("dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion";
      setError(message.includes("Serveur inaccessible") ? "Le backend n’est pas démarré. Lancez : cd backend && npm run dev" : message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const missing = !signupForm.firstName.trim() || !signupForm.lastName.trim() || !signupForm.email.trim() || !signupForm.password.trim();
    if (missing) {
      setError("Complétez tous les champs requis pour créer votre compte.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await register({
        firstName: signupForm.firstName.trim(),
        lastName: signupForm.lastName.trim(),
        email: signupForm.email.trim(),
        phone: signupForm.phone?.trim(),
        password: signupForm.password,
      });
      onNavigate("dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur d'inscription";
      setError(message.includes("Serveur inaccessible") ? "Le backend n’est pas démarré. Lancez : cd backend && npm run dev" : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex" style={{ background: "#0a0a0a" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 30%, rgba(212,175,103,0.18), transparent 25%), linear-gradient(135deg, rgba(10,10,10,0.94), rgba(17,16,14,0.96))" }} />
        <div className="relative z-10 p-16 max-w-sm w-full">
          <div
            className="rounded-[2rem] border p-8"
            style={{ background: "rgba(17,15,13,0.72)", borderColor: "rgba(212,175,103,0.4)", boxShadow: "0 30px 80px rgba(0,0,0,0.42)" }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border"
                style={{ background: "linear-gradient(135deg, rgba(212,175,103,0.18), rgba(10,10,10,0.9))", borderColor: "rgba(212,175,103,0.5)", boxShadow: "0 0 30px rgba(212,175,103,0.2)" }}
              >
                <img src={wolfLogo} alt="Logo EVENTIA" className="w-11 h-11 object-contain" />
              </div>
              <div>
                <div className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "1.3rem" }}>EVENTIA</div>
                <div className="text-xs" style={{ color: "#d9b36d" }}>DZ</div>
              </div>
            </div>
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2rem", lineHeight: 1.2 }}
            >
              Rejoignez la communauté premium
            </h2>
            <p className="mb-8 leading-relaxed" style={{ color: "rgba(240,238,255,0.7)" }}>
              Accédez aux meilleurs événements, gérez vos billets et vivez des expériences inoubliables.
            </p>
            <div className="space-y-4">
              {[
                { emoji: "🎫", text: "Billets instantanés avec QR code" },
                { emoji: "🔔", text: "Alertes pour vos événements favoris" },
                { emoji: "💎", text: "Accès prioritaire aux ventes exclusives" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "rgba(212,175,103,0.04)", border: "1px solid rgba(212,175,103,0.12)" }}>
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm" style={{ color: "rgba(240,238,255,0.8)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Auth forms */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-3 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: mode === m ? "linear-gradient(135deg, #d4af67, #e6c27a)" : "transparent",
                  color: mode === m ? "#120d09" : "#b7a78e",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  boxShadow: mode === m ? "0 4px 15px rgba(212,175,103,0.25)" : "none",
                }}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-white mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
                  Bon retour ! 👋
                </h2>
                <p style={{ color: "#8b8bae" }}>Connectez-vous à votre compte EVENTIA</p>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleClick}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-white transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <span className="text-lg">🅶</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>Continuer avec Google</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.2)" }} />
                <span className="text-xs" style={{ color: "#8b8bae" }}>ou</span>
                <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.2)" }} />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                  <input
                    type="email"
                    placeholder="amira@email.dz"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#8b8bae" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button className="text-xs transition-colors hover:text-purple-300" style={{ color: "#a855f7" }}>
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-center px-4 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #caa45b, #d9b36d)",
                  boxShadow: "0 8px 32px rgba(217,179,109,0.25)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  color: "#120f0d",
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Se connecter <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-white mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
                  Créer un compte ✨
                </h2>
                <p style={{ color: "#8b8bae" }}>Rejoignez la communauté EVENTIA à Oran</p>
              </div>

              <button
                onClick={handleGoogleClick}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-white transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <span className="text-lg">🅶</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>S'inscrire avec Google</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.2)" }} />
                <span className="text-xs" style={{ color: "#8b8bae" }}>ou</span>
                <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.2)" }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                    <input
                      type="text"
                      placeholder="Sophie"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                      style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Nom</label>
                  <input
                    type="text"
                    placeholder="Martin"
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                  <input
                    type="email"
                    placeholder="amira@email.dz"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                  <input
                    type="tel"
                    placeholder="+213 555 12 34 56"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#8b8bae" }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && mode === "signup" && (
                <p className="text-sm text-center px-4 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #caa45b, #d9b36d)",
                  boxShadow: "0 8px 32px rgba(217,179,109,0.25)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  color: "#120f0d",
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-xs text-center" style={{ color: "#8b8bae" }}>
                En vous inscrivant, vous acceptez nos{" "}
                <button className="underline" style={{ color: "#a855f7" }}>Conditions d'utilisation</button>
                {" "}et notre{" "}
                <button className="underline" style={{ color: "#a855f7" }}>Politique de confidentialité</button>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
