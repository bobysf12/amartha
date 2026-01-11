import { useRef, useState } from 'react';
import './ImagePicker.css';

type ImagePickerProps = {
	id?: string;
	label: string;
	name?: string;
	value?: string;
	error?: string;
	disabled?: boolean;
	loading?: boolean;
	required?: boolean;
	onChange: (file: File | null) => void;
	onBlur?: () => void;
	onFocus?: () => void;
	accept?: string;
};

const ImagePicker = ({
	id,
	label,
	name,
	value,
	error,
	disabled,
	loading,
	required,
	onChange,
	onBlur,
	onFocus,
	accept = 'image/*',
}: ImagePickerProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
	const [isDragOver, setIsDragOver] = useState(false);

	const pickerId = id || `image-picker-${name}`;

	const handleFocus = () => {
		setIsFocused(true);
		onFocus?.();
	};

	const handleBlur = () => {
		setIsFocused(false);
		onBlur?.();
	};

	const handleFileSelect = (file: File | null) => {
		if (file) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			onChange(file);
		} else {
			setPreviewUrl(undefined);
			onChange(null);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		handleFileSelect(file);
	};

	const handleClick = () => {
		if (!disabled && !loading) {
			fileInputRef.current?.click();
		}
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		if (!disabled && !loading) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		if (!disabled && !loading && e.dataTransfer.files.length > 0) {
			handleFileSelect(e.dataTransfer.files[0]);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setPreviewUrl(undefined);
		onChange(null);
	};

	return (
		<div
			className={`image-picker ${error ? 'image-picker--error' : ''} ${disabled ? 'image-picker--disabled' : ''} ${loading ? 'image-picker--loading' : ''} ${
				isFocused ? 'image-picker--focused' : ''
			}`}
		>
			<label htmlFor={pickerId} className="image-picker__label">
				{label}
				{required && <span className="image-picker__required">*</span>}
			</label>
			<div
				className={`image-picker__wrapper ${isDragOver ? 'image-picker__wrapper--drag-over' : ''}`}
				onClick={handleClick}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				tabIndex={disabled ? -1 : 0}
				onFocus={handleFocus}
				onBlur={handleBlur}
				role="button"
			>
				{loading && <span className="image-picker__loading" />}
				{previewUrl ? (
					<div className="image-picker__preview">
						<img src={previewUrl} alt="Preview" className="image-picker__image" />
						<button type="button" className="image-picker__remove" onClick={handleRemove} disabled={disabled || loading}>
							×
						</button>
					</div>
				) : (
					<div className="image-picker__placeholder">
						<div className="image-picker__icon" />
						<span className="image-picker__text">Click to upload or drag and drop</span>
					</div>
				)}
				<input
					ref={fileInputRef}
					id={pickerId}
					name={name}
					type="file"
					accept={accept}
					disabled={disabled || loading}
					className="image-picker__input"
					onChange={handleInputChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
			</div>
			{error && <span className="image-picker__error">{error}</span>}
		</div>
	);
};

export { ImagePicker };
