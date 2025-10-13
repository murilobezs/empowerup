import clsx from 'clsx';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-coral/40 disabled:cursor-not-allowed disabled:opacity-60';
  const variants = {
    primary: 'bg-coral text-white shadow-soft hover:bg-coral-600',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:border-coral/40 hover:text-coral-600',
    ghost: 'text-slate-600 hover:text-coral-600',
  };

  return (
    <button className={clsx(base, variants[variant] ?? variants.primary, className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
