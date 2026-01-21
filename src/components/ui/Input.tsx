import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, id, ...props }, ref) => {
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
                <input
                    ref={ref}
                    id={id}
                    className={`
            w-full px-4 py-2.5 rounded-xl
            bg-white/5 border border-white/10
            text-white placeholder-slate-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            hover:border-white/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
