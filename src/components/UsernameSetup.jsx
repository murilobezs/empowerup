import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Check, X, Loader2 } from "lucide-react"
import config from "../config/config"

export default function UsernameSetup({ user, onUsernameSet }) {
  const [username, setUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState(null)
  const [message, setMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const generateSuggestion = useCallback(async () => {
    try {
      const response = await fetch(config.getApiUrl(`username.php?action=generate_username&nome=${encodeURIComponent(user.nome)}&email=${encodeURIComponent(user.email)}`))
      const data = await response.json()
      
      if (data.success) {
        setUsername(data.username)
        checkUsernameAvailability(data.username)
      }
    } catch (error) {
      console.error('Erro ao gerar sugestão:', error)
    }
  }, [user.nome, user.email])

  // Gerar sugestão de username
  useEffect(() => {
    if (user?.nome) {
      generateSuggestion()
    }
  }, [user, generateSuggestion])

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null)
      setMessage("")
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch(config.getApiUrl(`username.php?action=check_username&username=${encodeURIComponent(usernameToCheck)}`))
      const data = await response.json()
      
      setIsAvailable(data.available)
      setMessage(data.message)
    } catch (error) {
      console.error('Erro ao verificar username:', error)
      setIsAvailable(false)
      setMessage("Erro ao verificar disponibilidade")
    }
    setIsChecking(false)
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(value)
    
    // Debounce da verificação
    clearTimeout(window.usernameTimeout)
    window.usernameTimeout = setTimeout(() => {
      checkUsernameAvailability(value)
    }, 500)
  }

  const handleSave = async () => {
    if (!isAvailable || !username) return

    setIsSaving(true)
    try {
      const response = await fetch(config.getApiUrl('username.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_username',
          user_id: user.id,
          username: username
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onUsernameSet(username)
      } else {
        setMessage(data.message)
        setIsAvailable(false)
      }
    } catch (error) {
      console.error('Erro ao salvar username:', error)
      setMessage("Erro ao salvar username")
    }
    setIsSaving(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Escolha seu username</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Seu username será usado para identificar seus posts, como @{username || 'seu_username'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</div>
            <Input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="seu_username"
              className="pl-8"
              maxLength={20}
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
            {!isChecking && isAvailable === true && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
            {!isChecking && isAvailable === false && username.length >= 3 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <X className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          
          {message && (
            <Alert className={isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={isAvailable ? "text-green-700" : "text-red-700"}>
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-xs text-gray-500">
            Use apenas letras, números e underscore (_). 3-20 caracteres.
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={generateSuggestion}
            className="flex-1"
          >
            Nova sugestão
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isAvailable || isSaving}
            className="flex-1 bg-coral hover:bg-coral/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
