import { useRef, useState, useEffect, useCallback } from "react";
import "./Autocomplete.css";

type AutocompleteOption = {
	value: string;
	label: string;
};

type AutocompleteProps = {
	id?: string;
	label: string;
	name?: string;
	value?: string;
	selectedValue?: string;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	debounceMs?: number;
	minLength?: number;
	onSearch: (query: string) => Promise<AutocompleteOption[]>;
	onChange: (value: string, option: AutocompleteOption) => void;
	onClear?: () => void;
	onBlur?: () => void;
	onFocus?: () => void;
};

const Autocomplete = ({
	id,
	label,
	name,
	value,
	selectedValue,
	placeholder,
	error,
	disabled,
	required,
	debounceMs = 300,
	minLength = 2,
	onSearch,
	onChange,
	onClear,
	onBlur,
	onFocus,
}: AutocompleteProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const isTypingRef = useRef(false);

	const [query, setQuery] = useState(value || "");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [options, setOptions] = useState<AutocompleteOption[]>([]);
	const [focusedIndex, setFocusedIndex] = useState(-1);

	const autocompleteId = id || `autocomplete-${name}`;

	useEffect(() => {
		if (!isTypingRef.current && query !== (value || "")) {
			setQuery(value || "");
		}
	}, [value, query]);

	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const debouncedSearch = useCallback(
		(searchQuery: string) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			setIsLoading(true);
			debounceTimerRef.current = setTimeout(async () => {
				try {
					if (searchQuery.length >= minLength) {
						const results = await onSearch(searchQuery);
						setOptions(results);
					} else {
						setOptions([]);
					}
				} catch (err) {
					console.error("Autocomplete search error:", err);
					setOptions([]);
				} finally {
					setIsLoading(false);
				}
			}, debounceMs);
		},
		[debounceMs, minLength, onSearch],
	);

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		isTypingRef.current = true;
		const newQuery = e.target.value;
		setQuery(newQuery);
		setIsDropdownOpen(true);
		setFocusedIndex(-1);
		debouncedSearch(newQuery);
	};

	const handleFocus = () => {
		setIsDropdownOpen(true);
		onFocus?.();
	};

	const handleBlur = (e: React.FocusEvent) => {
		if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
			return;
		}
		isTypingRef.current = false;
		setIsDropdownOpen(false);
		onBlur?.();
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		isTypingRef.current = false;
		setQuery("");
		setOptions([]);
		setIsDropdownOpen(false);
		onClear?.();
		onChange("", { value: "", label: "" });
	};

	const handleSelect = (option: AutocompleteOption) => {
		isTypingRef.current = false;
		setQuery(option.label);
		setIsDropdownOpen(false);
		onChange(option.value, option);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isDropdownOpen && e.key === "ArrowDown" && options.length > 0) {
			setIsDropdownOpen(true);
			return;
		}

		if (!isDropdownOpen) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
				break;
			case "ArrowUp":
				e.preventDefault();
				setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
				break;
			case "Enter":
				e.preventDefault();
				if (focusedIndex >= 0 && options[focusedIndex]) {
					handleSelect(options[focusedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsDropdownOpen(false);
				setFocusedIndex(-1);
				break;
		}
	};

	return (
		<div
			className={`autocomplete ${error ? "autocomplete--error" : ""} ${disabled ? "autocomplete--disabled" : ""}`}
		>
			<label htmlFor={autocompleteId} className="autocomplete__label">
				{label}
				{required && <span className="autocomplete__required">*</span>}
			</label>
			<div className="autocomplete__wrapper">
				<input
					ref={inputRef}
					id={autocompleteId}
					name={name}
					type="text"
					value={query}
					placeholder={placeholder}
					disabled={disabled}
					className="autocomplete__input"
					onChange={handleInputChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					autoComplete="off"
					role="combobox"
				/>
				{query && !disabled && !isLoading && (
					<button
						type="button"
						className="autocomplete__clear"
						onClick={handleClear}
						aria-label="Clear selection"
					>
						×
					</button>
				)}
			</div>
			{isDropdownOpen && (
				<div ref={dropdownRef} className="autocomplete__dropdown" role="listbox" id={`${autocompleteId}-list`}>
					{isLoading ? (
						<div className="autocomplete__loading">Searching...</div>
					) : query.length >= minLength ? (
						options.length === 0 ? (
							<div className="autocomplete__no-results">No results found</div>
						) : (
							options.map((option, index) => (
								<div
									key={option.value}
									className={`autocomplete__option ${index === focusedIndex ? "autocomplete__option--focused" : ""} ${
										option.value === selectedValue ? "autocomplete__option--selected" : ""
									}`}
									onClick={() => handleSelect(option)}
									onMouseDown={(e) => e.preventDefault()}
									role="option"
									aria-selected={option.value === selectedValue}
								>
									{option.label}
								</div>
							))
						)
					) : null}
				</div>
			)}
			{error && <span className="autocomplete__error">{error}</span>}
		</div>
	);
};

export { Autocomplete };
export type { AutocompleteOption };
