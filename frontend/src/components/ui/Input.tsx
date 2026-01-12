import { useRef, useState } from "react";
import "./Input.css";

type InputProps = {
	id?: string;
	label: string;
	type: "text" | "email";
	name?: string;
	value: string;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	loading?: boolean;
	required?: boolean;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	onFocus?: () => void;
};

const Input = ({
	id,
	label,
	type,
	name,
	value,
	placeholder,
	error,
	disabled,
	loading,
	required,
	onChange,
	onBlur,
	onFocus,
}: InputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = useState(false);

	const inputId = id || `input-${name}`;

	const handleFocus = () => {
		setIsFocused(true);
		onFocus?.();
	};

	const handleBlur = () => {
		setIsFocused(false);
		onBlur?.();
	};

	return (
		<div
			className={`input ${error ? "input--error" : ""} ${disabled ? "input--disabled" : ""} ${loading ? "input--loading" : ""}`}
		>
			<label htmlFor={inputId} className="input__label">
				{label}
				{required && <span className="input__required">*</span>}
			</label>
			<div className="input__wrapper">
				<input
					ref={inputRef}
					id={inputId}
					name={name}
					type={type}
					value={value}
					placeholder={placeholder}
					disabled={disabled || loading}
					className={`input__field ${isFocused ? "input__field--focused" : ""}`}
					onChange={(e) => onChange?.(e.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
				{loading && <span className="input__loading" />}
			</div>
			{error && <span className="input__error">{error}</span>}
		</div>
	);
};

export { Input };
