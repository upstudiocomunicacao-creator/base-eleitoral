import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/services/auth";

export function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      setLoading(true);
      await updatePassword(password);
      setMessage("Senha atualizada com sucesso. Você já pode entrar novamente.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-surface flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <Card className="premium-card mx-auto w-full max-w-md overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-900/20">
              <Zap className="h-5 w-5" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Nova senha</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Base Eleitoral 360</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Digite uma nova senha para concluir a recuperação do acesso.</p>
          </div>

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
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Nova senha</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9 pr-10" type={showPassword ? "text" : "password"} value={password} autoComplete="new-password" onChange={(event) => setPassword(event.target.value)} required />
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

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Confirmar senha</span>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9 pr-10" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} autoComplete="new-password" onChange={(event) => setConfirmPassword(event.target.value)} required />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 rounded-md p-2 text-slate-400 transition-colors -translate-y-1/2 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar senha"}
            </Button>
            <Button className="w-full" type="button" variant="outline" onClick={() => navigate("/login")}>
              Voltar ao login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
