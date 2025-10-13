import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import config from '../config/config'
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet"
import { 
	Menu, 
	MessageCircle, 
	User, 
	UserPlus, 
	Home,
	Search,
	Users,
	Calendar,
	CreditCard,
	Megaphone,
	BookOpen,
	Bell,
	Bookmark,
	Settings,
	LogOut,
	ShoppingBag
} from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../contexts/AuthContext"
import { useMessages } from "../contexts/MessagesContext"
import NotificationCenter from "./NotificationCenter"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import MobileBottomNav from "./navigation/MobileBottomNav"

const useSafeMessages = () => {
	try {
		return useMessages()
	} catch (error) {
		if (import.meta?.env?.DEV) {
			console.warn('SiteHeader: MessagesProvider ausente.', error)
		}
		return { unreadTotal: 0 }
	}
}

const coursesUrl = config.getCoursesUrl()

const navigation = [
	{ name: "Início", href: "/" },
	{ name: "Marketplace", href: "https://marketplace.empowerup.com.br" },
	{ name: "Sobre", href: "/sobre" },
	{ name: "Contato", href: "/contato" },
]

const mobileMenuItems = [
	{ name: 'Início', href: '/comunidade', icon: Home },
	{ name: 'Explorar', href: '/explorar', icon: Search },
	{ name: 'Marketplace', href: 'https://marketplace.empowerup.com.br', icon: ShoppingBag, external: true },
	{ name: 'Grupos', href: '/grupos', icon: Users },
	{ name: 'Eventos', href: '/eventos', icon: Calendar },
	{ name: 'Planos', href: '/planos', icon: CreditCard },
	{ name: 'Campanhas', href: '/campanhas', icon: Megaphone },
	{ name: 'Cursos', href: coursesUrl, icon: BookOpen, external: true },
	{ name: 'Notificações', href: '/notificacoes', icon: Bell },
	{ name: 'Mensagens', href: '/mensagens', icon: MessageCircle },
	{ name: 'Posts Salvos', href: '/posts-salvos', icon: Bookmark },
	{ name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function SiteHeader() {
	const location = useLocation()
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const { unreadTotal } = useSafeMessages()
	const [isOpen, setIsOpen] = useState(false)
	const animatedContainerRef = useRef(null)

	useEffect(() => {
		const node = animatedContainerRef.current
		if (!node) return undefined

		node.style.setProperty('--animate-delay', '0ms')

		let rafId
		if (typeof window !== 'undefined') {
			rafId = window.requestAnimationFrame(() => {
				node.classList.add('page-reveal-ready')
			})
		}

		return () => {
			if (typeof window !== 'undefined' && rafId) {
				window.cancelAnimationFrame(rafId)
			}
			node.classList.remove('page-reveal-ready')
			node.style.removeProperty('--animate-delay')
		}
	}, [])

	const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro'

	return (
		<>
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div
				ref={animatedContainerRef}
				data-animate
				className="container flex h-16 items-center justify-between md:h-14"
			>
				{/* Mobile Layout - Twitter/Instagram Style */}
				<div className="md:hidden flex items-center justify-between w-full">
					{/* Left Side - Menu Hamburger (User Avatar) */}
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="relative">
								{user ? (
									<Avatar className="h-8 w-8">
										<AvatarImage src={user.avatar_url ? config.getPublicUrl(user.avatar_url) : ''} />
										<AvatarFallback className="text-xs">{user.nome?.charAt(0) || 'U'}</AvatarFallback>
									</Avatar>
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-80 p-0">
							<SheetHeader className="sr-only">
								<SheetTitle>Menu de navegação</SheetTitle>
								<SheetDescription>
									Acesse todas as funcionalidades da plataforma
								</SheetDescription>
							</SheetHeader>
							<div className="flex h-full flex-col">
								{/* Header do menu com perfil do usuário */}
								{user ? (
									<div className="bg-gradient-to-r from-coral to-olive p-6">
										<div className="flex items-center gap-3">
											<Avatar className="h-12 w-12">
												<AvatarImage src={user.avatar_url ? config.getPublicUrl(user.avatar_url) : ''} />
												<AvatarFallback className="text-lg">{user.nome?.charAt(0) || 'U'}</AvatarFallback>
											</Avatar>
											<div>
												<h2 className="text-lg font-bold text-white">{user.nome}</h2>
												<p className="text-sm text-white/80">@{user.username || user.nome}</p>
											</div>
										</div>
									</div>
								) : (
									<div className="bg-gradient-to-r from-coral to-olive p-6">
										<h2 className="text-lg font-bold text-white">Menu</h2>
										<p className="text-sm text-white/80">Navegue pela plataforma</p>
									</div>
								)}
								
								{/* Navegação principal */}
								<nav className="flex-1 overflow-y-auto p-4">
									<div className="space-y-1">
										{user && (
											<>
												<Link
													to="/perfil"
													className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-gray-100"
													onClick={() => setIsOpen(false)}
												>
													<User className="h-5 w-5 text-coral" />
													Meu Perfil
												</Link>
												<div className="my-2 border-t border-gray-200" />
											</>
										)}
										
										{mobileMenuItems.map((item) => {
											const Icon = item.icon;
											const isActive = !item.external && (location.pathname === item.href);

											if (item.external) {
												return (
													<a
														key={item.name}
														href={item.href}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-coral"
														onClick={() => setIsOpen(false)}
													>
														<Icon className="h-5 w-5" />
														{item.name}
													</a>
												);
											}

											return (
												<Link
													key={item.name}
													to={item.href}
													className={cn(
														"flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
														isActive
															? "bg-coral text-white"
															: "text-gray-700 hover:bg-gray-100 hover:text-coral",
													)}
													onClick={() => setIsOpen(false)}
												>
													<Icon className="h-5 w-5" />
													{item.name}
												</Link>
											);
										})}
									</div>
									
									{user ? (
										<div className="mt-6 pt-4 border-t border-gray-200">
											<Button
												variant="ghost"
												className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
												onClick={() => {
													logout();
													setIsOpen(false);
													navigate('/');
												}}
											>
												<LogOut className="mr-3 h-5 w-5" />
												Sair
											</Button>
										</div>
									) : (
										<div className="mt-6 space-y-3 border-t pt-6">
											<Button
												variant="outline"
												asChild
												className="w-full justify-start"
												onClick={() => setIsOpen(false)}
											>
												<Link to="/login">
													<User className="mr-2 h-4 w-4" />
													Entrar
												</Link>
											</Button>
											<Button
												asChild
												className="w-full justify-start bg-coral hover:bg-coral/90"
												onClick={() => setIsOpen(false)}
											>
												<Link to="/cadastro">
													<UserPlus className="mr-2 h-4 w-4" />
													Cadastrar
												</Link>
											</Button>
										</div>
									)}
								</nav>
							</div>
						</SheetContent>
					</Sheet>

					{/* Center - Logo */}
					<Link to="/" className="flex items-center">
						<img src="/logo-sem-fundo.png" alt="EmpowerUp" className="h-14 w-auto" />
					</Link>

					{/* Right Side - Notifications (if logged in) */}
					{user && (
						<div className="flex items-center gap-1">
							<NotificationCenter />
						</div>
					)}
					
					{!user && (
						<div className="w-8" />
					)}
				</div>

				{/* Desktop Layout */}
				<div className="hidden md:flex items-center gap-4">
					<Link to="/" className="flex items-center">
						<img src="/logo-sem-fundo.png" alt="EmpowerUp" className="h-14 w-auto lg:h-16 xl:h-20" />
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
						</span>
					</Link>
				</nav>

				{/* Desktop Auth/User Section */}
				<div className="hidden md:flex items-center space-x-2">
					{!user && !isAuthPage ? (
						<>
							<Button variant="ghost" asChild className="hover:text-white">
								<Link to="/login">Entrar</Link>
							</Button>
							<Button asChild className="bg-coral hover:bg-coral/90">
								<Link to="/cadastro">Cadastrar</Link>
							</Button>
						</>
					) : user ? (
						<>
							<Button
								variant="ghost"
								size="icon"
								asChild
								className="relative"
							>
								<Link to="/mensagens" aria-label="Ir para mensagens">
									<MessageCircle className="h-5 w-5" />
									{unreadTotal > 0 && (
										<span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 rounded-full px-1 flex items-center justify-center bg-red-500 text-white text-xs">
											{unreadTotal > 9 ? '9+' : unreadTotal}
										</span>
									)}
								</Link>
							</Button>
							<NotificationCenter />
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
									<Avatar>
										<AvatarImage src={user.avatar_url ? config.getPublicUrl(user.avatar_url) : ''} />
										<AvatarFallback>{user.nome?.charAt(0)}</AvatarFallback>
									</Avatar>
									<span className="hidden sm:block text-sm font-medium">
										{user.nome}
									</span>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem onClick={() => navigate('/perfil')}>
										<Avatar className="mr-2 h-4 w-4">
											<AvatarImage src={user.avatar_url ? config.getPublicUrl(user.avatar_url) : ''} />
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
						</>
					) : null}
				</div>
			</div>
		</header>
		<MobileBottomNav />
		</>
	)
}
