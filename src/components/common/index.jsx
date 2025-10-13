import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

/**
 * Componente de Loading unificado
 */
export const Loading = ({ 
  size = 'md', 
  text = 'Carregando...', 
  className = '',
  showText = true,
  duration = 2300
}) => {
  const resolvedDuration = Math.max(duration, 2300);
  const wrapperLayout = showText ? 'flex-col gap-6 text-center' : 'flex-row gap-3';

  const sizeModifiers = {
    sm: 'loading-heart--sm',
    md: 'loading-heart--md',
    lg: 'loading-heart--lg',
    xl: 'loading-heart--xl'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const offsets = {
    sm: '16px',
    md: '22px',
    lg: '28px',
    xl: '34px'
  };

  const loaderStyles = {
    '--loader-duration': `${resolvedDuration}ms`,
    '--loader-offset': offsets[size] || offsets.md
  };

  const sizeModifier = sizeModifiers[size] || sizeModifiers.md;
  const textSize = textSizes[size] || textSizes.md;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center', wrapperLayout, className)}
    >
      <div
        className={cn('loading-heart text-coral', sizeModifier)}
        style={loaderStyles}
        aria-hidden="true"
      >
        <div className="loading-heart__preloader">
          <span />
          <span />
          <span />
        </div>
      </div>
      {showText && (
        <span className={cn('font-semibold text-muted-foreground tracking-wide', textSize)}>
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * Componente de erro unificado
 */
export const ErrorMessage = ({ 
  error, 
  onRetry, 
  className = '',
  showIcon = true 
}) => {
  if (!error) return null;

  return (
    <div className={cn(
      'flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-700',
      className
    )}>
      {showIcon && (
        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">
          {typeof error === 'string' ? error : 'Ocorreu um erro'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Componente de estado vazio
 */
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600 mb-4 max-w-md">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

/**
 * Componente de confirmação
 */
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger' // 'danger' | 'warning' | 'info'
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={cn(
                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                variantClasses[variant]
              )}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal de feedback para ações de sucesso/erro
 */
export const StatusModal = ({
  open,
  onOpenChange,
  type = 'info',
  title,
  description,
  confirmLabel = 'Entendi',
  onConfirm,
  secondaryAction
}) => {
  const variants = {
    success: {
      icon: CheckCircle2,
      wrapper: 'bg-emerald-100 text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    },
    error: {
      icon: XCircle,
      wrapper: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: AlertTriangle,
      wrapper: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    info: {
      icon: Info,
      wrapper: 'bg-sky-100 text-sky-600',
      button: 'bg-sky-600 hover:bg-sky-700 text-white'
    }
  };

  const variant = variants[type] || variants.info;
  const Icon = variant.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-full', variant.wrapper)}>
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
          <DialogHeader className="space-y-2 text-center">
            {title && (
              <DialogTitle className="text-xl font-semibold leading-snug">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-base text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex w-full flex-col-reverse gap-2 pt-2 sm:flex-row">
            {secondaryAction && (
              <Button
                type="button"
                variant={secondaryAction.variant || 'outline'}
                className={cn('flex-1', secondaryAction.className)}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            <Button
              type="button"
              className={cn('flex-1', variant.button)}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Componente de notificação toast
 */
export const Toast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={cn(
        'flex items-center p-4 border rounded-lg shadow-lg',
        typeClasses[type]
      )}>
        <div className="flex-shrink-0 mr-3">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-3 text-current opacity-70 hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Wrapper para animações suaves entre páginas
 */
export const PageTransition = ({ children, className = '' }) => {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const revealItems = Array.from(node.querySelectorAll('[data-animate]'));

    revealItems.forEach((element, index) => {
      element.classList.remove('page-reveal-ready');
      element.style.setProperty('--animate-delay', `${index * 70}ms`);
    });

    let rafId;
    if (typeof window !== 'undefined') {
      rafId = window.requestAnimationFrame(() => {
        revealItems.forEach((element) => {
          element.classList.add('page-reveal-ready');
        });
      });
    }

    return () => {
      if (typeof window !== 'undefined' && rafId) {
        window.cancelAnimationFrame(rafId);
      }
      revealItems.forEach((element) => {
        element.classList.remove('page-reveal-ready');
        element.style.removeProperty('--animate-delay');
      });
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('page-transition page-enter', className)}>
      {children}
    </div>
  );
};

const floatingHeartConfig = [
  { left: '3%', size: 72, duration: 21, delay: 0, drift: -28, rise: -540, rotation: 22, opacity: 0.52 },
  { left: '15%', size: 96, duration: 25, delay: 2.2, drift: 28, rise: -620, rotation: 34, opacity: 0.58 },
  { left: '29%', size: 62, duration: 19, delay: 1.1, drift: -18, rise: -480, rotation: 28, opacity: 0.46 },
  { left: '44%', size: 118, duration: 27, delay: 3.9, drift: 22, rise: -700, rotation: 38, opacity: 0.62 },
  { left: '58%', size: 66, duration: 20, delay: 2.8, drift: -26, rise: -520, rotation: 26, opacity: 0.5 },
  { left: '72%', size: 102, duration: 24, delay: 5.1, drift: 24, rise: -620, rotation: 32, opacity: 0.56 },
  { left: '84%', size: 82, duration: 22, delay: 1.6, drift: -24, rise: -560, rotation: 30, opacity: 0.5 },
  { left: '9%', size: 58, duration: 18, delay: 6.5, drift: 16, rise: -420, rotation: 24, opacity: 0.42 },
  { left: '24%', size: 132, duration: 30, delay: 7.9, drift: -34, rise: -760, rotation: 40, opacity: 0.64 },
  { left: '50%', size: 84, duration: 23, delay: 9.3, drift: 22, rise: -580, rotation: 36, opacity: 0.52 },
  { left: '66%', size: 60, duration: 17, delay: 8.1, drift: -14, rise: -420, rotation: 20, opacity: 0.4 },
  { left: '78%', size: 110, duration: 26, delay: 10.2, drift: 30, rise: -680, rotation: 38, opacity: 0.6 },
];

export const FloatingPlusBackdrop = ({ className = '' }) => {
  return (
    <div className={cn('plus-pattern', className)} aria-hidden="true">
      <div className="plus-pattern__gradient plus-pattern__gradient--primary" />
      <div className="plus-pattern__gradient plus-pattern__gradient--secondary" />
      {floatingHeartConfig.map((item, index) => {
        const animationDelaySeconds = Math.max(item.delay * 0.35, 0);

        return (
        <span
          key={`floating-heart-${index}`}
          className="plus-pattern__item"
          style={{
            left: item.left,
            fontSize: `${item.size}px`,
            animationDelay: `${animationDelaySeconds}s`,
            animationDuration: `${item.duration}s`,
            opacity: item.opacity,
            color: 'rgba(255, 128, 158, 0.72)',
            '--plus-rise': `${item.rise}px`,
            '--plus-drift': `${item.drift}px`,
            '--plus-rotation': `${item.rotation}deg`,
          }}
        >
          ♥
        </span>
        );
      })}
    </div>
  );
};

