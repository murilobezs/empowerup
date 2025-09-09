import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import config from '../config/config'
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

const navigation = [
	{ name: "Início", href: "/" },
	{ name: "Marketplace", href: "https://marketplace.empowerup.com.br" },
	{ name: "Sobre", href: "/sobre" },
	{ name: "Contato", href: "/contato" },
]

export function SiteHeader() {
	const location = useLocation()
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const [isOpen, setIsOpen] = useState(false)

	// badge state for notifications
	const [notificationCount, setNotificationCount] = useState(0)

	useEffect(() => {
		const fetchNotifications = async () => {
			if (!user) {
				setNotificationCount(0)
				return
			}
			
			try {
				const res = await fetch(`${config.API_BASE_URL}/notifications`, {
					headers: {
						'Authorization': `Bearer ${user.token}`
					}
				})
				if (res.ok) {
					const data = await res.json()
					setNotificationCount(data.unread_count || 0)
				}
			} catch (e) {
				console.error('Erro ao buscar notificações:', e)
			}
		}
		fetchNotifications()
		
		// Atualizar a cada 30 segundos se usuário logado
		const interval = user ? setInterval(fetchNotifications, 30000) : null
		return () => {
			if (interval) clearInterval(interval)
		}
	}, [user])
	const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro'

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center justify-between">
				<div className="flex items-center gap-4">
					{/* logo */}
					<Link to="/" className="flex items-center">
						<span>
							<img src="/logo-sem-fundo.png" alt="logo" width="140px"/>
						</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
					{navigation.map((item) => (
						<Link
							key={item.name}
							to={item.href}
							className={cn(
								"transition-colors rounded-md px-3 py-2 hover:bg-[#87A05F] hover:text-white",
								location.pathname === item.href
									? "text-foreground"
									: "text-foreground/60",
							)}
						>
							{item.name}
						</Link>
					))}
					{/* Comunidade link styled like other nav items */}
					<Link
						to="/comunidade"
						className={cn(
							"transition-colors rounded-md px-3 py-2 hover:bg-[#87A05F] hover:text-white",
							location.pathname === '/comunidade' ? "text-foreground" : "text-foreground/60",
						)}
					>
						<span className="flex items-center gap-2">
							<svg className="w-4 h-4 text-foreground/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
								<path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
							<span className="text-sm font-medium">Comunidade</span>
							{user && notificationCount > 0 && (
								<span className="inline-flex items-center justify-center ml-2 px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full" aria-hidden>
									{notificationCount > 99 ? '99+' : notificationCount}
								</span>
							)}
						</span>
					</Link>
				</nav>

				{/* Desktop Auth Buttons */}
				<div className="hidden md:flex items-center space-x-2">
					{!user && !isAuthPage && (
						<>
							<Button variant="ghost" asChild className="hover:text-white">
								<Link to="/login">Entrar</Link>
							</Button>
							<Button asChild className="bg-coral hover:bg-coral/90">
								<Link to="/cadastro">Cadastrar</Link>
							</Button>
						</>
					)}
				</div>

				{/* Mobile Menu */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild className="md:hidden">
						<Button variant="ghost" size="icon">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Abrir menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[300px] sm:w-[400px]">
						<nav className="flex flex-col space-y-4">
							{[
								{ name: 'Comunidade', href: '/comunidade' },
								...navigation
							].map((item) => (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"text-sm font-medium transition-colors rounded-md px-3 py-2 hover:bg-[#87A05F] hover:text-white",
										location.pathname === item.href
											? "text-foreground"
											: "text-foreground/60",
									)}
									onClick={() => setIsOpen(false)}
								>
									{item.name}
								</Link>
							))}
							{!user && !isAuthPage && (
								<div className="flex flex-col space-y-2 pt-4">
									<Button
										variant="ghost"
										asChild
										onClick={() => setIsOpen(false)}
									>
										<Link to="/login">Entrar</Link>
									</Button>
									<Button
										asChild
										className="bg-coral hover:bg-coral/90"
										onClick={() => setIsOpen(false)}
									>
										<Link to="/cadastro">Cadastrar</Link>
									</Button>
								</div>
							)}
						</nav>
					</SheetContent>
				</Sheet>

				{/* User Avatar and Dropdown */}
				<nav className="flex items-center space-x-4">
					{!isAuthPage && user ? (
						<DropdownMenu>
							<DropdownMenuTrigger className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
								<Avatar>
									<AvatarImage src={user.avatar_url ? `https://www.empowerup.com.br/public${user.avatar_url}` : ''} />
									<AvatarFallback>{user.nome?.charAt(0)}</AvatarFallback>
								</Avatar>
								<span className="hidden sm:block text-sm font-medium">
									{user.nome}
								</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem onClick={() => navigate('/perfil')}>
									<Avatar className="mr-2 h-4 w-4">
										<AvatarImage src={user.avatar_url ? `https://www.empowerup.com.br/public${user.avatar_url}` : ''} />
										<AvatarFallback className="text-xs">{user.nome?.charAt(0)}</AvatarFallback>
									</Avatar>
									Meu Perfil
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => {
									logout()
									navigate('/')
								}}>
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : null}
				</nav>
			</div>
		</header>
	)
}
