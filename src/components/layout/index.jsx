import React from 'react';
import { cn } from '../../lib/utils';
import { SiteHeader } from '../site-header';
import { SiteFooter } from '../site-footer';

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
        'flex-1',
        !showHeader && 'pt-0',
        !showFooter && 'pb-0'
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
          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {children}
          </div>
          
          {/* Sidebar */}
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
  onTabChange 
}) => {
  return (
    <MainLayout>
      {/* Cover e Avatar */}
      <div className="relative">
        {/* Cover Image */}
        {/* Cover banner */}
        <div className="h-48 md:h-64 bg-gray-200">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {/* Default banner icon or text */}
              <span className="text-xl">&nbsp;</span>
            </div>
          )}
        </div>
        
        {/* Avatar e Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20">
            <div className="flex items-end space-x-4">
              {/* Avatar */}
              <div className="relative">
                {/* Avatar with initial fallback */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                    {user?.foto_perfil ? (
                      <img
                        src={user.foto_perfil}
                        alt={user.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-coral flex items-center justify-center text-white text-2xl font-bold">
                        {user?.nome?.charAt(0) || ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="pb-4 flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.nome}
                </h1>
                <p className="text-gray-600">
                  @{user?.username}
                </p>
                {user?.bio && (
                  <p className="text-gray-700 mt-2 max-w-md">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      {tabs && (
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange?.(tab.key)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({tab.count})
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Content */}
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
        {/* Header da página */}
        <div className="mb-8">
          {breadcrumbs && (
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
        
        {/* Conteúdo */}
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
