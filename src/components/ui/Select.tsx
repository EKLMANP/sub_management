import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, id, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-slate-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={id}
                    className={`
            w-full px-4 py-2.5 rounded-xl
            bg-white/5 border border-white/10
            text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            hover:border-white/20
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                    }}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800">
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
