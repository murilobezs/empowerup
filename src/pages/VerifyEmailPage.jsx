import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { Button } from "../components/ui/button";
import { ROUTES } from "../constants";
import apiService from "../services/api";
import { FloatingPlusBackdrop } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

const statusCopy = {
  success: {
    title: "Conta confirmada com sucesso!",
    description: "Seu email foi verificado e sua conta está ativa. Você já pode explorar toda a comunidade EmpowerUp sem limitações.",
    icon: CheckCircle2,
    iconClass: "text-emerald-500"
  },
  error: {
    title: "Não foi possível verificar o email",
    description: "O link pode ter expirado ou já ter sido utilizado. Solicite um novo link pelo app ou tente novamente mais tarde.",
    icon: XCircle,
    iconClass: "text-red-500"
  }
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "Confirmando sua conta..." : "Token de verificação não encontrado.");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Link de verificação inválido. Solicite um novo link pelo app.");
        return;
      }

      try {
        const response = await apiService.verifyEmail(token);

        if (!active) return;

        if (response?.success) {
          setStatus("success");
          setMessage(response.message || "Email verificado com sucesso!");
        } else {
          setStatus("error");
          setMessage(response?.message || "Não foi possível verificar seu email.");
        }
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error?.message || "Ocorreu um erro ao verificar seu email.");
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [token]);

  const copy = useMemo(() => statusCopy[status] ?? statusCopy.error, [status]);

  return (
    <div className="flex min-h-screen flex-col bg-blush">
      <SiteHeader />
      <main className="relative isolate flex-1 overflow-hidden">
        <FloatingPlusBackdrop className="opacity-60" />
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="mx-auto max-w-2xl rounded-3xl bg-white/90 p-8 shadow-2xl shadow-coral/10 backdrop-blur">
              {status === "loading" ? (
                <div className="flex flex-col items-center gap-6 text-center">
                  <Loader2 className="h-14 w-14 animate-spin text-coral" aria-hidden="true" />
                  <h1 className="text-2xl font-semibold text-gray-900">Estamos confirmando seu email...</h1>
                  <p className="text-base text-muted-foreground">Isso leva apenas alguns segundos. Obrigada por esperar! ✨</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-inner ${copy.iconClass}`}>
                    <copy.icon className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-gray-900">{copy.title}</h1>
                    <p className="text-base text-muted-foreground">{copy.description}</p>
                    {message && (
                      <p className="text-sm font-medium text-gray-600">{message}</p>
                    )}
                  </div>

                  <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                      className="flex-1 bg-coral text-white hover:bg-coral/90"
                      onClick={() => navigate(user ? ROUTES.FEED : ROUTES.LOGIN)}
                    >
                      {user ? "Ir para a comunidade" : "Fazer login"}
                    </Button>
                    {status === "error" && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(ROUTES.REGISTER)}
                      >
                        Criar nova conta
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Se precisar de ajuda, fale com a gente pelo email {" "}
                    <a href="mailto:suporte@empowerup.com.br" className="font-medium text-coral underline offset-2">
                      suporte@empowerup.com.br
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
