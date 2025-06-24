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
   
        <Route path="/perfil/:username" element={<VisualizarPerfil />} />
        <Route path="/meu-perfil" element={<MeuPerfil />} />
      </Routes>
    </AuthProvider>
  )
}

export default App;


