import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
	ShoppingBag,
} from 'lucide-react';
import clsx from 'clsx';
import config from '@shared/config/config';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
	{ label: 'Início', href: '/' },
	{ label: 'Marketplace', href: 'https://marketplace.empowerup.com.br', external: true },
	{ label: 'Sobre', href: '/sobre' },
	{ label: 'Contato', href: '/contato' },
	{ label: 'Comunidade', href: '/comunidade' },
];

const MOBILE_MENU_ITEMS = [
	{ name: 'Início', href: '/comunidade', icon: Home },
	{ name: 'Explorar', href: '/explorar', icon: Search },
	{ name: 'Marketplace', href: 'https://marketplace.empowerup.com.br', icon: ShoppingBag, external: true },
	{ name: 'Grupos', href: '/grupos', icon: Users },
	{ name: 'Eventos', href: '/eventos', icon: Calendar },
	{ name: 'Planos', href: '/planos', icon: CreditCard },
	{ name: 'Campanhas', href: '/campanhas', icon: Megaphone },
	{ name: 'Cursos', href: '/cursos', icon: BookOpen },
	{ name: 'Notificações', href: '/notificacoes', icon: Bell },
	{ name: 'Mensagens', href: '/mensagens', icon: MessageCircle },
	{ name: 'Posts Salvos', href: '/posts-salvos', icon: Bookmark },
	{ name: 'Configurações', href: '/configuracoes', icon: Settings },
];

const Header = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = () => {
		logout();
		navigate('/');
		setMenuOpen(false);
	};

	const initials = (user?.nome || user?.username || 'EmpowerUp')
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('') || 'EU';

	const mainPortalUrl = config.BASE_URL || 'https://www.empowerup.com.br';

	const renderNavLink = (item) => {
		const isActive = !item.external && location.pathname === item.href;
		const baseClass = clsx(
			'rounded-md px-3 py-2 text-sm font-medium transition-colors',
			isActive ? 'bg-olive text-white' : 'text-slate-600 hover:bg-olive/15 hover:text-olive'
		);

		if (item.external) {
			return (
				<a key={item.label} href={item.href} className={baseClass} target="_blank" rel="noreferrer">
					{item.label}
				</a>
			);
		}

		return (
			<Link key={item.label} to={item.href} className={baseClass}>
				{item.label}
			</Link>
		);
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
				<div className="flex items-center gap-4">
					<button
						type="button"
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-olive hover:text-olive lg:hidden"
						onClick={() => setMenuOpen((prev) => !prev)}
						aria-label="Abrir menu"
					>
						<Menu className="h-5 w-5" />
					</button>

					<Link to="/" className="flex items-center gap-3">
						<img src="/logo-sem-fundo.png" alt="EmpowerUp" className="h-12 w-auto" />
						<div className="hidden flex-col leading-tight text-left text-sm font-medium text-slate-700 sm:flex">
							<span>EmpowerUp Academy</span>
							<span className="text-xs text-slate-500">Aprenda, conecte-se e avance</span>
						</div>
					</Link>
				</div>

				<nav className="hidden items-center gap-2 lg:flex">{NAV_ITEMS.map(renderNavLink)}</nav>

				<div className="hidden items-center gap-3 lg:flex">
					{user ? (
						<>
							<Link
								to="/mensagens"
								className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-olive hover:text-olive"
								aria-label="Mensagens"
							>
								<MessageCircle className="h-5 w-5" />
							</Link>
							<div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm">
								<span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-sm font-semibold text-white">
									{initials}
								</span>
								<div className="text-left text-sm">
									<div className="font-semibold text-slate-800">{user.nome || user.username}</div>
									{user?.subscription?.plan_nome && (
										<div className="text-xs text-slate-500">Plano {user.subscription.plan_nome}</div>
									)}
								</div>
							</div>
							<button
								type="button"
								onClick={handleLogout}
								className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600"
							>
								<LogOut className="h-4 w-4" />
								Sair
							</button>
						</>
					) : (
						<>
							<a
								href={`${mainPortalUrl}/login`}
								className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-olive hover:text-olive"
							>
								Entrar
							</a>
							<a
								href={`${mainPortalUrl}/cadastro`}
								className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600"
							>
								<UserPlus className="h-4 w-4" />
								Fazer parte
							</a>
						</>
					)}
				</div>
			</div>

			{menuOpen && (
				<div className="border-t border-slate-200 bg-white/95 shadow-sm lg:hidden">
					<div className="space-y-1 px-4 py-3">
						{user && (
							<div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
								<span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-base font-semibold text-white">
									{initials}
								</span>
								<div className="text-sm">
									<div className="font-semibold text-slate-800">{user.nome || user.username}</div>
									{user?.subscription?.plan_nome && (
										<div className="text-xs text-slate-500">Plano {user.subscription.plan_nome}</div>
									)}
								</div>
							</div>
						)}

						{MOBILE_MENU_ITEMS.map((item) => {
							const Icon = item.icon;
							const isActive = !item.external && location.pathname === item.href;
							const baseClass = clsx(
								'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
								isActive ? 'bg-olive text-white' : 'text-slate-600 hover:bg-slate-100'
							);

							if (item.external) {
								return (
									<a
										key={item.name}
										href={item.href}
										className={baseClass}
										target="_blank"
										rel="noreferrer"
										onClick={() => setMenuOpen(false)}
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
									className={baseClass}
									onClick={() => setMenuOpen(false)}
								>
									<Icon className="h-5 w-5" />
									{item.name}
								</Link>
							);
						})}

						<div className="mt-4 flex flex-col gap-2">
							{user ? (
								<button
									type="button"
									onClick={handleLogout}
									className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
								>
									<LogOut className="h-4 w-4" />
									Sair
								</button>
							) : (
								<>
									<a
										href={`${mainPortalUrl}/login`}
										className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-olive hover:text-olive"
										onClick={() => setMenuOpen(false)}
									>
										<User className="h-4 w-4" />
										Entrar
									</a>
									<a
										href={`${mainPortalUrl}/cadastro`}
										className="inline-flex items-center justify-center gap-2 rounded-lg bg-coral px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600"
										onClick={() => setMenuOpen(false)}
									>
										<UserPlus className="h-4 w-4" />
										Criar conta
									</a>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
