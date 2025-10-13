"use client"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import { ROUTES } from "../constants"

export function SiteFooter() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    const email = e.target.email.value
    console.log("Newsletter signup:", email)
    // Aqui você implementaria a lógica de inscrição
    alert("Obrigada por se inscrever!")
    e.target.reset()
  }

  return (
    <footer className="bg-background text-foreground border-t">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                    src="/logo-sem-fundo.png"
                    width="170px"
                    alt="Mulheres empreendedoras"
                    
                  />
            </Link>
            <p className="text-sm text-muted-foreground">
              A plataforma que conecta mulheres empreendedoras com clientes, criando uma comunidade de apoio e
              crescimento mútuo.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="https://marketplace.empowerup.com.br" className="text-muted-foreground hover:text-foreground transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/comunidade" className="text-muted-foreground hover:text-foreground transition-colors">
                  Comunidade
                </Link>
              </li>
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground transition-colors">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.ABOUT} className="text-muted-foreground hover:text-foreground transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TERMS} className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRIVACY} className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Receba dicas e novidades para empreendedoras diretamente no seu email.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Seu email"
                className="bg-background border-input"
                required
              />
              <Button type="submit" className="w-full" style={{ backgroundColor: '#87A05F', '--tw-hover-opacity': 0.8 }}>
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 EmpowerUp. Todos os direitos reservados. Feito com ❤️ para mulheres empreendedoras.
          </p>
        </div>
      </div>
    </footer>
  )
}
