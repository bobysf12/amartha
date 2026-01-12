import { useState, useCallback, useMemo, useEffect } from "react";
import { ImagePicker } from "../../ui/ImagePicker";
import { Select } from "../../ui/Select";
import { Autocomplete, type AutocompleteOption } from "../../ui/Autocomplete";
import { Button } from "../../ui/Button";
import { apiStep1, apiStep2, type Location, type BasicInfo } from "../../../utils/api";
import "./EmployeeFormStep2.css";

type EmployeeFormDataStep2 = {
	image: File | null;
	employmentType: string;
	location: Location | null;
	notes: string;
};

type FormErrors = {
	image?: string;
	employmentType?: string;
	location?: string;
};

type EmployeeFormStep2Props = {
	onBack?: () => void;
	onSuccess: () => void;
	step1Data: BasicInfo;
	initialData?: Partial<EmployeeFormDataStep2>;
	onChange?: (data: EmployeeFormDataStep2) => void;
	hasDraft?: boolean;
	onClearDraft?: () => void;
};

const EMPLOYMENT_TYPE_OPTIONS = [
	{ value: "full-time", label: "Full Time" },
	{ value: "part-time", label: "Part Time" },
	{ value: "contract", label: "Contract" },
	{ value: "intern", label: "Intern" },
];

const validateForm = (data: EmployeeFormDataStep2): FormErrors => {
	const errors: FormErrors = {};

	if (!data.employmentType) {
		errors.employmentType = "Employment type is required";
	}

	if (!data.location) {
		errors.location = "Office location is required";
	}

	return errors;
};

const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
};

const EmployeeFormStep2 = ({
	onBack,
	onSuccess,
	step1Data,
	initialData,
	onChange,
	hasDraft,
	onClearDraft,
}: EmployeeFormStep2Props) => {
	const [formData, setFormData] = useState<EmployeeFormDataStep2>({
		image: null,
		employmentType: initialData?.employmentType || "",
		location: initialData?.location || null,
		notes: initialData?.notes || "",
	});

	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (onChange) {
			onChange(formData);
		}
	}, [formData, onChange]);

	const handleLocationSearch = useCallback(async (query: string): Promise<AutocompleteOption[]> => {
		const locations = await apiStep2.getLocationsByName(query);
		return locations.map((loc) => ({ value: loc.id.toString(), label: loc.name }));
	}, []);

	const handleLocationChange = useCallback((value: string, option: AutocompleteOption) => {
		const locationId = parseInt(value, 10);
		const location = { id: locationId, name: option.label };
		setFormData((prev) => ({ ...prev, location }));
		setTouched((prev) => ({ ...prev, location: true }));
		setErrors((prev) => ({ ...prev, location: undefined }));
	}, []);

	const handleFieldChange = useCallback(
		(field: keyof EmployeeFormDataStep2) => (value: string | File | null) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setTouched((prev) => ({ ...prev, [field]: true }));
		},
		[],
	);

	const handleFieldBlur = useCallback(
		(field: keyof EmployeeFormDataStep2) => () => {
			setTouched((prev) => ({ ...prev, [field]: true }));
			const fieldErrors = validateForm(formData);
			setErrors((prev) => ({ ...prev, [field]: fieldErrors[field as keyof FormErrors] }));
		},
		[formData],
	);

	const validateAllFields = useCallback(() => {
		const allErrors = validateForm(formData);
		setErrors(allErrors);
		setTouched({ image: true, employmentType: true, location: true });
		return Object.keys(allErrors).length === 0;
	}, [formData]);

	const handleSubmit = useCallback(async () => {
		if (!validateAllFields()) {
			return;
		}

		setIsSubmitting(true);
		try {
			const basicInfo = await apiStep1.createBasicInfo({
				name: step1Data.name,
				email: step1Data.email,
				departmentId: step1Data.departmentId,
				role: step1Data.role,
				employeeId: step1Data.employeeId,
			});

			const imageBase64 = formData.image ? await fileToBase64(formData.image) : undefined;

			await apiStep2.createDetails({
				basicInfoId: basicInfo.id,
				locationId: formData.location!.id,
				startDate: new Date().toISOString().split("T")[0],
				employmentType: formData.employmentType,
				notes: formData.notes || undefined,
				image: imageBase64,
			});

			onSuccess();
		} catch (error) {
			console.error("Failed to submit employee data:", error);
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, step1Data, validateAllFields, onSuccess]);

	const isFormValid = useMemo(() => {
		return formData.employmentType !== "" && formData.location !== null;
	}, [formData]);

	return (
		<div className="employee-form-step2">
			<div className="employee-form-step2__header">
				<h2 className="employee-form-step2__title">Employee Information - Step 2</h2>
				<p className="employee-form-step2__subtitle">Additional details and preferences</p>
			</div>

			<form
				className="employee-form-step2__form"
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<ImagePicker
					id="employee-image"
					name="image"
					label="Profile Image"
					accept="image/jpeg,image/png"
					value={formData.image ? URL.createObjectURL(formData.image) : undefined}
					onChange={handleFieldChange("image")}
				/>

				<Select
					id="employment-type"
					name="employmentType"
					label="Employment Type"
					value={formData.employmentType}
					placeholder="Select employment type"
					options={EMPLOYMENT_TYPE_OPTIONS}
					error={touched.employmentType ? errors.employmentType : undefined}
					required
					onChange={handleFieldChange("employmentType")}
					onBlur={handleFieldBlur("employmentType")}
				/>

				<Autocomplete
					id="office-location"
					name="location"
					label="Office Location"
					placeholder="Search office location..."
					value={formData.location?.name || ""}
					selectedValue={formData.location?.id.toString() || ""}
					error={touched.location ? errors.location : undefined}
					debounceMs={500}
					minLength={1}
					required
					onSearch={handleLocationSearch}
					onChange={handleLocationChange}
					onBlur={() => {
						setTouched((prev) => ({ ...prev, location: true }));
						if (!formData.location) {
							setErrors((prev) => ({ ...prev, location: "Office location is required" }));
						}
					}}
				/>

				<div className="employee-form-step2__notes">
					<label htmlFor="notes" className="employee-form-step2__notes-label">
						Notes
					</label>
					<textarea
						id="notes"
						name="notes"
						value={formData.notes}
						placeholder="Enter any additional notes..."
						className="employee-form-step2__notes-field"
						onChange={(e) => handleFieldChange("notes")(e.target.value)}
					/>
				</div>

				<div className="employee-form-step2__actions">
					{onBack && (
						<Button type="button" variant="secondary" onClick={onBack} disabled={isSubmitting}>
							Back
						</Button>
					)}
					{hasDraft && onClearDraft && (
						<Button type="button" variant="secondary" onClick={onClearDraft}>
							Clear
						</Button>
					)}
					<Button type="submit" variant="primary" disabled={!isFormValid || isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export { EmployeeFormStep2 };
export type { EmployeeFormDataStep2 };
