import { useState, useEffect } from "react"
import { X, Check, AlertCircle, Info } from "lucide-react"

export function Toast({ message, type = "info", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Esperar animação terminar
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800"
      case "error":
        return "text-red-800"
      case "warning":
        return "text-yellow-800"
      default:
        return "text-blue-800"
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md p-4 border rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${getBgColor()}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className={`ml-3 w-0 flex-1 ${getTextColor()}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none`}
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )

  return {
    addToast,
    ToastContainer
  }
}
