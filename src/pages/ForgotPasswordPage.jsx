import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck, SendHorizonal } from "lucide-react";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { FloatingPlusBackdrop } from "../components/common";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import apiService from "../services/api";
import { ROUTES } from "../constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setState({ status: "error", message: "Informe um email válido." });
      return;
    }

    setState({ status: "loading", message: "" });

    try {
      const response = await apiService.forgotPassword(email.trim());
      const successMessage = response?.message || "Se o email existir, você receberá as instruções em instantes.";
      setState({ status: "success", message: successMessage });
    } catch (error) {
      setState({
        status: "error",
        message: error?.message || "Não foi possível enviar as instruções agora. Tente novamente em alguns minutos.",
      });
    }
  };

  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

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
                  <MailCheck className="h-8 w-8" aria-hidden="true" />
                ) : (
                  <SendHorizonal className="h-8 w-8" aria-hidden="true" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Esqueceu sua senha?
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Informe o email cadastrado. Vamos enviar um link seguro para você criar uma nova senha.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2 text-left">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSuccess || isLoading}
                    required
                  />
                </div>
                {isError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                    {state.message}
                  </p>
                )}
                {isSuccess && (
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {state.message}
                  </div>
                )}
                {!isSuccess && (
                  <p className="text-xs text-muted-foreground">
                    Dica: verifique também a caixa de spam e promoções. O email vem de <strong>suporte@empowerup.com.br</strong>.
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-coral text-white hover:bg-coral/90"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? "Enviando..." : isSuccess ? "Email enviado" : "Enviar link de recuperação"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="text-coral hover:text-coral/80"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  Voltar para o login
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
