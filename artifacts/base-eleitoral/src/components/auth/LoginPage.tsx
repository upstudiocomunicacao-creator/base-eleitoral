import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BarChart3, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sendPasswordReset } from "@/services/auth";

export function LoginPage() {
  const [, navigate] = useLocation();
  const { signIn, isAuthenticated, loading, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }

    navigate("/");
  }

  async function handlePasswordReset() {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Digite seu e-mail primeiro para receber o link de recuperação.");
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordReset(email, `${window.location.origin}/reset-password`);
      setMessage("Enviamos um link para redefinir a senha. Abra o e-mail e siga o link.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="app-surface flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 shadow-lg shadow-blue-900/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Base Eleitoral 360</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
              Acesso seguro ao comando territorial da campanha
            </h1>
            <p className="mt-4 max-w-lg text-base font-medium leading-7 text-slate-600">
              Entre para acompanhar lideranças, apoiadores, prospecção, zonas, agenda, demandas e relatórios com permissões por perfil.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <LoginFeature icon={ShieldCheck} label="Auth real" />
              <LoginFeature icon={BarChart3} label="Dados conectados" />
              <LoginFeature icon={LockKeyhole} label="Perfis de acesso" />
            </div>
          </div>
        </section>

        <Card className="premium-card mx-auto w-full max-w-md overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white lg:hidden">
                <Zap className="h-5 w-5" />
              </div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Login</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Base Eleitoral 360</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Use seu e-mail e senha cadastrados no Supabase Auth.</p>
            </div>

            {!isConfigured ? (
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                Supabase não configurado. Verifique o arquivo .env.local.
              </div>
            ) : null}

            {error ? (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                {message}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">E-mail</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9"
                    type="email"
                    value={email}
                    autoComplete="email"
                    placeholder="usuario@campanha.com"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Senha</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9 pr-10"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2 top-1/2 rounded-md p-2 text-slate-400 transition-colors -translate-y-1/2 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <Button className="w-full" type="submit" disabled={loading || !isConfigured}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <Button className="w-full" type="button" variant="outline" disabled={resetLoading || !isConfigured} onClick={handlePasswordReset}>
                {resetLoading ? "Enviando..." : "Esqueci minha senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LoginFeature({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <Icon className="h-5 w-5 text-blue-600" />
      <div className="mt-3 text-sm font-extrabold text-slate-900">{label}</div>
    </div>
  );
}
