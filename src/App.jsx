import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import CadastroPage from "./pages/CadastroPage"
import ComunidadePage from "./pages/ComunidadePage"
import GruposPage from "./pages/GruposPage"
import EventosPage from "./pages/EventosPage"
import ContatoPage from "./pages/ContatoPage"
import SobrePage from "./pages/SobrePage"
import VisualizarPerfil from "./pages/VisualizarPerfil"
import MeuPerfil from "./pages/MeuPerfil"
import PerfilSimples from "./pages/PerfilSimples"
import EditarPerfilCompleto from "./pages/EditarPerfilCompleto"
import AdminDashboard from "./pages/AdminDashboard"
import AdminLogin from "./pages/AdminLogin"
import "./App.css"
import React from 'react'
import { AuthProvider } from "./contexts/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/comunidade" element={<ComunidadePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/grupos" element={<GruposPage />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/sobre" element={<SobrePage/>}/>
        <Route path="/contato" element={<ContatoPage/>}/>
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route path="/admin" element={<AdminDashboard/>}/>
   
        <Route path="/perfil/:username" element={<VisualizarPerfil />} />
        <Route path="/meu-perfil" element={<MeuPerfil />} />
        <Route path="/perfil-simples" element={<PerfilSimples />} />
        <Route path="/editar-perfil-completo" element={<EditarPerfilCompleto />} />
      </Routes>
    </AuthProvider>
  )
}

export default App;


