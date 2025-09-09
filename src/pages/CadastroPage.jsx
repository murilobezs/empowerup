import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Textarea } from "../components/ui/textarea"
import { useAuth } from "../contexts/AuthContext"
import apiService from "../services/apiService"
import { Eye, EyeOff } from 'lucide-react'

export default function CadastroPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    bio: "",
    termos: false,
  })
  const [registered, setRegistered] = useState(false)
  const [infoMessage, setInfoMessage] = useState("")
  const [verificationStatus, setVerificationStatus] = useState(null) // null | 'pending' | 'success' | 'error'
  const [verificationMessage, setVerificationMessage] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmSenha, setShowConfirmSenha] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Formata telefone no padrão brasileiro (xx) xxxxx-xxxx
  const formatTelefone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    let result = ''
    if (digits.length > 0) result += '(' + digits.slice(0, 2)
    if (digits.length >= 3) result += ') ' + digits.slice(2, 7)
    else if (digits.length > 2) result += ') ' + digits.slice(2)
    if (digits.length >= 8) result += '-' + digits.slice(7, 11)
    return result
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    let newValue = type === 'checkbox' ? checked : value
    if (name === 'telefone') {
      newValue = formatTelefone(newValue)
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  const handleSubmit = async (e, tipo) => {
    e.preventDefault()
    setFormErrors({})

    // Validação de senha
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem')
      return
    }

    if (!formData.termos) {
      alert('Você deve aceitar os termos de uso')
      return
    }

    try {
      const sanitizedTelefone = formData.telefone.replace(/\D/g, '')
      const payload = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        bio: formData.bio,
        tipo
      }
      
      // Incluir username se fornecido
      if (formData.username.trim()) {
        payload.username = formData.username.trim()
      }
      
      // Incluir telefone apenas se fornecido
      if (sanitizedTelefone) {
        payload.telefone = sanitizedTelefone
      }
      const result = await register(payload)
      if (result.success) {
        // Mostrar instrução de verificação por email em vez de redirecionar automaticamente
        setRegistered(true)
        setInfoMessage('Cadastro realizado com sucesso. Enviamos um email com um link de verificação para o seu endereço — por favor, verifique sua caixa de entrada (e spam).')
      } else {
        // mostrar erros de validação se houver
        if (result.errors) {
          setFormErrors(result.errors)
        }
        alert(result.message || 'Erro ao cadastrar')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert(error.message || 'Erro ao conectar com o servidor')
    }
  }

  // Verifica token de verificação vindo na query string (ex: /cadastro?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      verifyEmailToken(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const verifyEmailToken = async (token) => {
    setVerificationStatus('pending')
    setVerificationMessage('Verificando token...')
    try {
      const res = await apiService.request(`/auth/verify?token=${encodeURIComponent(token)}`)
      if (res && res.success) {
        setVerificationStatus('success')
        setVerificationMessage(res.message || 'Email verificado com sucesso. Agora você pode fazer login.')
        // redireciona para login após 2.5s
        setTimeout(() => navigate('/login'), 2500)
      } else {
        setVerificationStatus('error')
        setVerificationMessage((res && res.message) || 'Token inválido ou expirado.')
      }
    } catch (err) {
      setVerificationStatus('error')
      const msg = (err && (err.message || (err.data && err.data.message))) || 'Erro ao verificar token.'
      setVerificationMessage(msg)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12 bg-cream">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Junte-se à EmpowerUp</h1>
              <p className="text-gray-700">Crie sua conta e comece a empreender hoje mesmo</p>
            </div>
            {/* Mostrar mensagem de resultado de verificação (se houver) */}
            {verificationStatus && (
              <div className={`rounded-md p-4 mb-4 ${verificationStatus === 'success' ? 'bg-green-50 text-green-800' : verificationStatus === 'error' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'}`}>
                {verificationMessage}
              </div>
            )}

            <Tabs defaultValue="empreendedora" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="empreendedora">Empreendedora</TabsTrigger>
              </TabsList>
              <TabsContent value="empreendedora">
                <Card>
                  <CardHeader>
                    <CardTitle>Cadastro de Empreendedora</CardTitle>
                    <CardDescription>
                      Crie sua conta para vender produtos e conectar-se com outras empreendedoras.
                    </CardDescription>
                  </CardHeader>
                  {registered ? (
                    <CardContent>
                      <div className="space-y-3 text-center">
                        <h3 className="text-lg font-semibold">Quase lá — verifique seu email</h3>
                        <p className="text-sm text-gray-700">{infoMessage}</p>
                        <p className="text-sm text-gray-600">Se não recebeu o email, verifique a caixa de spam ou solicite um novo envio na página de login.</p>
                        <div className="pt-4">
                          <Button onClick={() => navigate('/login')} className="bg-coral">Ir para login</Button>
                        </div>
                      </div>
                    </CardContent>
                  ) : (
                    <form onSubmit={(e) => handleSubmit(e, "empreendedora")}>
                      {/* Resumo de erros de validação */}
                      {Object.keys(formErrors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
                          {Object.entries(formErrors).map(([field, msgs]) =>
                            msgs.map((msg, idx) => (
                              <p key={`${field}-${idx}`} className="text-sm">{msg}</p>
                            ))
                          )}
                        </div>
                      )}
                      <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome-empreendedora">Nome completo</Label>
                        <Input
                          id="nome-empreendedora"
                          name="nome"
                          type="text"
                          placeholder="Seu nome completo"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                        />
+  {formErrors.nome && <p className="text-red-600 text-sm">{formErrors.nome[0]}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username-empreendedora">Username (opcional)</Label>
                        <Input
                          id="username-empreendedora"
                          name="username"
                          type="text"
                          placeholder="meuusername (deixe vazio para gerar automaticamente)"
                          value={formData.username}
                          onChange={handleInputChange}
                          maxLength={30}
                        />
                        <p className="text-xs text-gray-500">
                          Apenas letras, números, _ ou . (3-30 caracteres)
                        </p>
+  {formErrors.username && <p className="text-red-600 text-sm">{formErrors.username[0]}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email-empreendedora">Email</Label>
                        <Input
                          id="email-empreendedora"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
+  {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email[0]}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone-empreendedora">Telefone</Label>
                        <Input
                          id="telefone-empreendedora"
                          name="telefone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          required
                        />
+  {formErrors.telefone && <p className="text-red-600 text-sm">{formErrors.telefone[0]}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio-empreendedora">Sobre você e seu negócio</Label>
                        <Textarea
                          id="bio-empreendedora"
                          name="bio"
                          placeholder="Conte um pouco sobre você e seus produtos/serviços..."
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senha-empreendedora">Senha</Label>
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
                        {showSenha ? (
                          <EyeOff
                            className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer"
                            onClick={() => setShowSenha(false)}
                          />
                        ) : (
                          <Eye
                            className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer"
                            onClick={() => setShowSenha(true)}
                          />
                        )}
                      </div>
+  {formErrors.senha && <p className="text-red-600 text-sm">{formErrors.senha[0]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmar-senha-empreendedora">Confirmar senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmar-senha-empreendedora"
                          name="confirmarSenha"
                          type={showConfirmSenha ? 'text' : 'password'}
                          value={formData.confirmarSenha}
                          onChange={handleInputChange}
                          className="pr-10"
                          required
                        />
                        {showConfirmSenha ? (
                          <EyeOff
                            className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer"
                            onClick={() => setShowConfirmSenha(false)}
                          />
                        ) : (
                          <Eye
                            className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer"
                            onClick={() => setShowConfirmSenha(true)}
                          />
                        )}
                      </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="termos-empreendedora"
                          name="termos"
                          checked={formData.termos}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, termos: checked }))}
                        />
                        <Label htmlFor="termos-empreendedora" className="text-sm">
                          Aceito os{" "}
                          <Link to="/termos" className="text-coral hover:underline">
                            termos de uso
                          </Link>{" "}
                          e{" "}
                          <Link to="/privacidade" className="text-coral hover:underline">
                            política de privacidade
                          </Link>
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full bg-coral hover:bg-coral/90" disabled={!formData.termos}>
                        Criar conta
                      </Button>
                      <div className="text-center text-sm">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="text-coral hover:underline">
                          Faça login
                        </Link>
                      </div>
                    </CardFooter>
                    </form>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
