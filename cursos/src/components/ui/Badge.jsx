import clsx from 'clsx';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-coral/10 text-coral-600',
    outline: 'border border-coral/40 text-coral-600',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variants[variant] ?? variants.default,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
