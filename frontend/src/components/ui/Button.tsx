import { useRef, useState } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
	children: React.ReactNode;
	variant?: ButtonVariant;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	onClick?: () => void;
	className?: string;
};

const Button = ({ children, variant = 'primary', type = 'button', disabled, onClick, className }: ButtonProps) => {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [isFocused, setIsFocused] = useState(false);

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleBlur = () => {
		setIsFocused(false);
	};

	const buttonClassName = `button button--${variant} ${isFocused ? 'button--focused' : ''} ${disabled ? 'button--disabled' : ''} ${className || ''}`;

	return (
		<button
			ref={buttonRef}
			type={type}
			disabled={disabled}
			className={buttonClassName}
			onClick={onClick}
			onFocus={handleFocus}
			onBlur={handleBlur}
		>
			{children}
		</button>
	);
};

export { Button };
