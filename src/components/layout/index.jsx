import React, { useRef, useMemo } from 'react';
import { Camera, Loader2, MapPin, Globe2, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SiteHeader } from '../site-header';
import { SiteFooter } from '../site-footer';
import config from '../../config/config';
import { Badge } from '../ui/badge';

const normalizeMediaUrl = (value) => {
	if (!value || typeof value !== 'string') return null;
	if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
		return value;
	}
	return config.getPublicUrl(value);
};

/**
 * Layout principal da aplicação
 */
export const MainLayout = ({ 
	children, 
	className = '',
	showHeader = true,
	showFooter = true,
	fullHeight = false
}) => {
	return (
		<div className={cn(
			'min-h-screen flex flex-col bg-gray-50',
			fullHeight && 'h-screen',
			className
		)}>
			{showHeader && <SiteHeader />}
      
			<main className={cn(
				'flex-1 pb-20 md:pb-0',
				!showHeader && 'pt-0'
			)}>
				{children}
			</main>
      
			{showFooter && <SiteFooter />}
		</div>
	);
};

/**
 * Layout para páginas de autenticação
 */
export const AuthLayout = ({ children, title, subtitle }) => {
	return (
		<MainLayout showFooter={false} className="bg-cream">
			<div className="flex-1 flex items-center justify-center py-12">
				<div className="w-full max-w-md space-y-6 px-4">
					{(title || subtitle) && (
						<div className="text-center space-y-2">
							{title && (
								<h1 className="text-3xl font-bold text-gray-900">{title}</h1>
							)}
							{subtitle && (
								<p className="text-gray-600">{subtitle}</p>
							)}
						</div>
					)}
					{children}
				</div>
			</div>
		</MainLayout>
	);
};

/**
 * Layout para dashboard/feed
 */
export const DashboardLayout = ({ children, sidebar, className = '' }) => {
	return (
		<MainLayout className={className}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<div className="lg:col-span-3">
						{children}
					</div>
					{sidebar && (
						<div className="lg:col-span-1">
							{sidebar}
						</div>
					)}
				</div>
			</div>
		</MainLayout>
	);
};

/**
 * Layout para perfil de usuário
 */
export const ProfileLayout = ({ 
	children, 
	user, 
	coverImage,
	tabs,
	activeTab,
	onTabChange,
	canEditCover = false,
	onCoverSelect,
	isCoverUploading = false,
	infoActions = null
}) => {
	const coverInputRef = useRef(null);

	const resolveMediaUrl = useMemo(() => (value) => normalizeMediaUrl(value), []);

	const coverSrc = useMemo(() => {
		const candidates = [
			coverImage,
			user?.cover_image,
			user?.cover_url,
			user?.capa,
			user?.capa_url
		];

		for (const candidate of candidates) {
			const resolved = resolveMediaUrl(candidate);
			if (resolved) return resolved;
		}

		return null;
	}, [coverImage, resolveMediaUrl, user?.capa, user?.capa_url, user?.cover_image, user?.cover_url]);

	const avatarSrc = useMemo(() => {
		const candidates = [
			user?.foto_perfil,
			user?.avatar_full_url,
			user?.avatar_url
		];

		for (const candidate of candidates) {
			const resolved = resolveMediaUrl(candidate);
			if (resolved) return resolved;
		}

		return null;
	}, [resolveMediaUrl, user?.avatar_full_url, user?.avatar_url, user?.foto_perfil]);

	const websiteHref = useMemo(() => {
		if (!user?.website) return null;
		const trimmed = user.website.trim();
		if (!trimmed) return null;
		if (/^https?:\/\//i.test(trimmed)) {
			return trimmed;
		}
		return `https://${trimmed}`;
	}, [user?.website]);

	const websiteLabel = useMemo(() => {
		if (!websiteHref) return null;
		try {
			const url = new URL(websiteHref);
			const path = url.pathname && url.pathname !== '/' ? url.pathname : '';
			return url.hostname.replace(/^www\./i, '') + path;
		} catch {
			return user?.website;
		}
	}, [websiteHref, user?.website]);

	const isPremium = useMemo(() => {
		if (user?.is_premium) return true;
		if (user?.subscription?.plan_slug) {
			return user.subscription.plan_slug === 'plano-premium';
		}
		return false;
	}, [user?.is_premium, user?.subscription?.plan_slug]);

	const premiumLabel = useMemo(() => {
		if (!isPremium) return null;
		return user?.subscription?.plan_nome || 'Assinante Premium';
	}, [isPremium, user?.subscription?.plan_nome]);

	const premiumExpiry = useMemo(() => {
		if (!isPremium || !user?.subscription?.expires_at) return null;
		try {
			return new Date(user.subscription.expires_at).toLocaleDateString('pt-BR', {
				day: '2-digit',
				month: 'long',
				year: 'numeric'
			});
		} catch (error) {
			console.warn('Failed to format premium expiry date', error);
			return null;
		}
	}, [isPremium, user?.subscription?.expires_at]);

	const handleCoverButtonClick = () => {
		if (!canEditCover) return;
		coverInputRef.current?.click();
	};

	const handleCoverChange = (event) => {
		const file = event.target.files?.[0];
		if (file && onCoverSelect) {
			onCoverSelect(file);
		}
		event.target.value = '';
	};

	return (
		<MainLayout>
			<div className="relative">
				<div className="relative h-48 md:h-64 bg-gray-200 overflow-hidden">
					{coverSrc ? (
						<>
							<img
								src={coverSrc}
								alt="Capa do perfil"
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
							<span className="text-lg font-medium">Adicione uma capa incrível ✨</span>
						</div>
					)}

					{canEditCover && (
						<>
							<input
								type="file"
								accept="image/*"
								ref={coverInputRef}
								onChange={handleCoverChange}
								className="hidden"
							/>
							<div className="absolute top-3 right-3 flex items-center gap-2">
								<button
									type="button"
									onClick={handleCoverButtonClick}
									disabled={isCoverUploading}
									className={cn(
										'inline-flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/70',
										isCoverUploading && 'cursor-wait opacity-80'
									)}
								>
									{isCoverUploading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Camera className="h-4 w-4" />
									)}
									{isCoverUploading ? 'Atualizando...' : 'Alterar capa'}
								</button>
							</div>
						</>
					)}
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
						<div className="sm:self-end">
							<div className="relative -mt-16 sm:-mt-20 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden z-20">
								{avatarSrc ? (
									<img
										src={avatarSrc}
										alt={user?.nome || 'Avatar do usuário'}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full bg-coral flex items-center justify-center text-white text-3xl font-bold">
										{user?.nome?.charAt(0)?.toUpperCase() || '?'}
									</div>
								)}
							</div>
						</div>

						<div className="flex-1">
							<div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 mt-2 sm:mt-4 relative z-10">
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
									<div>
										<div className="flex flex-wrap items-center gap-2">
											<h1 className="text-2xl font-bold text-gray-900 leading-tight">{user?.nome}</h1>
											{isPremium && (
												<Badge variant="warning" className="flex items-center gap-1 bg-amber-500/90 text-white border-transparent shadow-sm">
													<Crown className="w-3.5 h-3.5" />
													{premiumLabel || 'Premium'}
												</Badge>
											)}
										</div>
										<p className="text-gray-500 text-sm sm:text-base">@{user?.username}</p>
										{isPremium && (
											<p className="text-xs text-amber-600 mt-1">
												Assinante Premium{premiumExpiry ? ` · acesso até ${premiumExpiry}` : ''}
											</p>
										)}
									</div>
									{infoActions && (
										<div className="flex items-center gap-2 sm:justify-end">
											{infoActions}
										</div>
									)}
								</div>

								{user?.bio && (
									<p className="text-gray-700 mt-3 leading-relaxed break-words">
										{user.bio}
									</p>
								)}

								{(websiteHref || user?.localizacao) && (
									<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-4 text-sm text-gray-600">
										{websiteHref && (
											<a
												href={websiteHref}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2 text-coral hover:text-coral-dark transition-colors"
											>
												<Globe2 className="w-4 h-4" />
												<span className="truncate max-w-xs sm:max-w-none">{websiteLabel}</span>
											</a>
										)}

										{user?.localizacao && (
											<div className="flex items-center gap-2">
												<MapPin className="w-4 h-4 text-gray-400" />
												<span>{user.localizacao}</span>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{tabs && (
				<div className="border-b border-gray-200 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<nav className="flex space-x-8 overflow-x-auto">
							{tabs.map((tab) => (
								<button
									key={tab.key}
									onClick={() => onTabChange?.(tab.key)}
									className={cn(
										'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
										activeTab === tab.key
											? 'border-coral text-coral'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									)}
								>
									{tab.label}
									{tab.count !== undefined && (
										<span className="ml-2 text-xs text-gray-400">({tab.count})</span>
									)}
								</button>
							))}
						</nav>
					</div>
				</div>
			)}

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{children}
			</div>
		</MainLayout>
	);
};

/**
 * Layout para páginas simples (sobre, contato, etc.)
 */
export const PageLayout = ({ 
	children, 
	title, 
	subtitle,
	breadcrumbs,
	actions,
	className = '' 
}) => {
	return (
		<MainLayout className={className}>
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					{breadcrumbs && (
						<nav className="mb-4">
							<ol className="flex items-center space-x-2 text-sm text-gray-500">
								{breadcrumbs.map((crumb, index) => (
									<li key={index} className="flex items-center">
										{index > 0 && (
											<svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
												<path
													fillRule="evenodd"
													d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										)}
										{crumb.href ? (
											<a href={crumb.href} className="hover:text-gray-700">
												{crumb.label}
											</a>
										) : (
											<span className="text-gray-900">{crumb.label}</span>
										)}
									</li>
								))}
							</ol>
						</nav>
					)}

					<div className="flex items-center justify-between">
						<div>
							{title && (
								<h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
							)}
							{subtitle && (
								<p className="text-lg text-gray-600">{subtitle}</p>
							)}
						</div>

						{actions && (
							<div className="flex items-center space-x-3">
								{actions}
							</div>
						)}
					</div>
				</div>

				{children}
			</div>
		</MainLayout>
	);
};

/**
 * Container responsivo padrão
 */
export const Container = ({ 
	children, 
	size = 'default', 
	className = '',
	padding = true 
}) => {
	const sizeClasses = {
		sm: 'max-w-2xl',
		default: 'max-w-4xl',
		lg: 'max-w-6xl',
		xl: 'max-w-7xl',
		full: 'max-w-full'
	};

	return (
		<div className={cn(
			'mx-auto',
			sizeClasses[size],
			padding && 'px-4 sm:px-6 lg:px-8',
			className
		)}>
			{children}
		</div>
	);
};
