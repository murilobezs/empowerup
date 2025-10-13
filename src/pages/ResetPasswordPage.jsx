import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { FloatingPlusBackdrop } from "../components/common";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import apiService from "../services/api";
import { ROUTES } from "../constants";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [state, setState] = useState({ status: token ? "idle" : "error", message: token ? "" : "Link inválido ou incompleto." });

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (state.status === "success" || state.status === "loading") return false;
    if (!form.password || !form.confirmPassword) return false;
    if (form.password.length < MIN_PASSWORD_LENGTH) return false;
    if (form.password !== form.confirmPassword) return false;
    return true;
  }, [form, state.status, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setState({ status: "error", message: "Link inválido. Solicite uma nova recuperação de senha." });
      return;
    }
    if (!canSubmit) return;

    setState({ status: "loading", message: "" });

    try {
      const response = await apiService.resetPassword(token, form.password);
      const successMessage = response?.message || "Sua senha foi atualizada com sucesso!";
      setState({ status: "success", message: successMessage });
    } catch (error) {
      setState({
        status: "error",
        message: error?.message || "Não foi possível atualizar sua senha agora. Verifique o link ou solicite novamente.",
      });
    }
  };

  const isSuccess = state.status === "success";
  const isLoading = state.status === "loading";
  const isError = state.status === "error" && state.message;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-blush py-12">
        <FloatingPlusBackdrop />
        <div className="relative z-10 w-full max-w-lg px-4 sm:px-6">
          <Card className="border-none bg-white/95 shadow-2xl shadow-coral/10 backdrop-blur">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coral/10 text-coral">
                {isSuccess ? (
                  <ShieldCheck className="h-8 w-8" aria-hidden="true" />
                ) : (
                  <LockKeyhole className="h-8 w-8" aria-hidden="true" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Defina sua nova senha
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Crie uma senha forte com pelo menos {MIN_PASSWORD_LENGTH} caracteres para proteger sua conta.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                {isError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {state.message}
                  </div>
                )}

                {isSuccess ? (
                  <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700">
                    {state.message}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="password">Nova senha</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        minLength={MIN_PASSWORD_LENGTH}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        disabled={isLoading || isSuccess}
                        required
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        minLength={MIN_PASSWORD_LENGTH}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repita a senha"
                        disabled={isLoading || isSuccess}
                        required
                      />
                    </div>
                    {form.password && form.password.length < MIN_PASSWORD_LENGTH && (
                      <p className="text-xs text-red-600">
                        A senha deve ter pelo menos {MIN_PASSWORD_LENGTH} caracteres.
                      </p>
                    )}
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-600">
                        As senhas não coincidem.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Lembre-se de guardar sua nova senha em um local seguro. Evite reutilizar senhas de outros serviços.
                    </p>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {isSuccess ? (
                  <Button
                    type="button"
                    className="w-full bg-coral text-white hover:bg-coral/90"
                    onClick={() => navigate(ROUTES.LOGIN)}
                  >
                    Fazer login
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-coral text-white hover:bg-coral/90"
                    disabled={!canSubmit || isLoading}
                  >
                    {isLoading ? "Salvando nova senha..." : "Atualizar senha"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="link"
                  className="text-coral hover:text-coral/80"
                  onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                >
                  Voltar para recuperar senha
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
