import { useRef, useState } from 'react';
import './Select.css';

type SelectOption = {
	value: string;
	label: string;
};

type SelectProps = {
	id?: string;
	label: string;
	name?: string;
	value: string;
	placeholder?: string;
	options: SelectOption[];
	error?: string;
	disabled?: boolean;
	required?: boolean;
	onChange: (value: string) => void;
	onBlur?: () => void;
	onFocus?: () => void;
};

const Select = ({
	id,
	label,
	name,
	value,
	placeholder,
	options,
	error,
	disabled,
	required,
	onChange,
	onBlur,
	onFocus,
}: SelectProps) => {
	const selectRef = useRef<HTMLSelectElement>(null);
	const [isFocused, setIsFocused] = useState(false);

	const selectId = id || `select-${name}`;

	const handleFocus = () => {
		setIsFocused(true);
		onFocus?.();
	};

	const handleBlur = () => {
		setIsFocused(false);
		onBlur?.();
	};

	return (
		<div className={`select ${error ? 'select--error' : ''} ${disabled ? 'select--disabled' : ''}`}>
			<label htmlFor={selectId} className="select__label">
				{label}
				{required && <span className="select__required">*</span>}
			</label>
			<div className="select__wrapper">
				<select
					ref={selectRef}
					id={selectId}
					name={name}
					value={value}
					disabled={disabled}
					className={`select__field ${isFocused ? 'select__field--focused' : ''}`}
					onChange={(e) => onChange(e.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
				>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>
			{error && <span className="select__error">{error}</span>}
		</div>
	);
};

export { Select };
