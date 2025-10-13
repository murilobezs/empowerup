import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useAuth } from "../contexts/AuthContext"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { StatusModal, FloatingPlusBackdrop } from "../components/common"
import { ROUTES } from "../constants"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    login: "",
    senha: "",
    lembrar: false,
  })
  const [showSenha, setShowSenha] = useState(false)
  const initialModalState = {
    open: false,
    type: 'info',
    title: '',
    description: '',
    confirmLabel: 'Entendi',
    onConfirm: null,
  }
  const [modalState, setModalState] = useState(initialModalState)
  const showModal = (config) => {
    setModalState({
      ...initialModalState,
      open: true,
      ...config,
    })
  }
  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false, onConfirm: null }))
  }
  const handleModalConfirm = () => {
    const confirmAction = modalState.onConfirm
    closeModal()
    confirmAction?.()
  }
  const loginRevealRef = useScrollReveal({ delay: 60, stagger: 140 })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e, tipo) => {
    e.preventDefault()
    
    try {
      const result = await login({
        login: formData.login,
        senha: formData.senha
      });
      
      if (result.success) {
        showModal({
          type: 'success',
          title: 'Login realizado com sucesso! 🎉',
          description: 'Bem-vinda de volta! Clique abaixo para acessar a comunidade.',
          confirmLabel: 'Ir para a comunidade',
          onConfirm: () => navigate('/comunidade')
        })
      } else {
        showModal({
          type: 'error',
          title: 'Não foi possível entrar',
          description: result.message || 'Verifique suas credenciais e tente novamente.',
          confirmLabel: 'Tentar novamente'
        })
      }
    } catch (error) {
      console.error('Erro:', error);
      showModal({
        type: 'error',
        title: 'Falha na conexão',
        description: error?.message || 'Não foi possível conectar com o servidor. Tente novamente em instantes.',
        confirmLabel: 'Fechar'
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative isolate flex-1 flex items-center justify-center overflow-hidden py-12 bg-blush">
        <FloatingPlusBackdrop />
        <div className="relative z-10 container px-4 md:px-6">
          <div ref={loginRevealRef} data-reveal className="mx-auto max-w-md space-y-6">
            <div data-reveal-child className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Bem-vinda de volta</h1>
              <p className="text-gray-700">Entre na sua conta para acessar sua área exclusiva</p>
            </div>
            <Tabs defaultValue="empreendedora" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="empreendedora">Empreendedora</TabsTrigger>
              </TabsList>
              <TabsContent value="empreendedora">
                <Card data-reveal-child>
                  <CardHeader>
                    <CardTitle>Área da Empreendedora</CardTitle>
                    <CardDescription>
                      Acesse sua conta para gerenciar seus produtos e conectar-se com outras empreendedoras.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={(e) => handleSubmit(e, "empreendedora")}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-empreendedora">Email, Username ou Telefone</Label>
                        <Input
                          id="login-empreendedora"
                          name="login"
                          type="text"
                          placeholder="seu@email.com, @username ou telefone"
                          value={formData.login}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="senha-empreendedora">Senha</Label>
                          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-coral hover:underline">
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <div className="relative">
                          <Input
                            id="senha-empreendedora"
                            name="senha"
                            type={showSenha ? 'text' : 'password'}
                            value={formData.senha}
                            onChange={handleInputChange}
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-sm text-gray-500 hover:text-gray-700"
                            onClick={() => setShowSenha(!showSenha)}
                          >
                            {showSenha ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lembrar-empreendedora"
                          name="lembrar"
                          checked={formData.lembrar}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, lembrar: checked }))}
                        />
                        <Label htmlFor="lembrar-empreendedora">Lembrar de mim</Label>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full bg-coral hover:bg-coral/90">
                        Entrar
                      </Button>
                      <div className="text-center text-sm">
                        Ainda não tem uma conta?{" "}
                        <Link to="/cadastro" className="text-coral hover:underline">
                          Cadastre-se
                        </Link>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
      <StatusModal
        open={modalState.open}
        type={modalState.type}
        title={modalState.title}
        description={modalState.description}
        confirmLabel={modalState.confirmLabel}
        onConfirm={handleModalConfirm}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
      />
    </div>
  )
}
