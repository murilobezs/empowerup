"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

const navigation = [
	{ name: "Início", href: "/" },
	{ name: "Marketplace", href: "/marketplace" },
	{ name: "Sobre", href: "/sobre" },
	{ name: "Contato", href: "/contato" },
]

export function SiteHeader() {
	const location = useLocation()
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const [isOpen, setIsOpen] = useState(false)
	const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro'

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center justify-between">
				<div className="flex items-center">
					<Link to="/" className="flex items-center space-x-2">
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
							{navigation.map((item) => (
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
							<DropdownMenuTrigger>
								<Avatar>
									<AvatarImage src={user.avatar_url} />
									<AvatarFallback>{user.nome?.charAt(0)}</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
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
