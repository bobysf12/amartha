import { useState, useCallback, useMemo, useEffect } from "react";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Autocomplete, type AutocompleteOption } from "../../ui/Autocomplete";
import { Button } from "../../ui/Button";
import { apiStep1, type DepartmentWithCode } from "../../../utils/api";
import "./EmployeeFormStep1.css";

type EmployeeFormData = {
	name: string;
	email: string;
	department: DepartmentWithCode | null;
	role: string;
	employeeId: string;
};

type FormErrors = {
	name?: string;
	email?: string;
	department?: string;
	role?: string;
};

type EmployeeFormStep1Props = {
	onNext: (data: EmployeeFormData) => void;
	initialData?: Partial<EmployeeFormData>;
	onChange?: (data: EmployeeFormData) => void;
	hasDraft?: boolean;
	onClearDraft?: () => void;
};

const ROLE_OPTIONS = [
	{ value: "ops", label: "Ops" },
	{ value: "admin", label: "Admin" },
	{ value: "engineer", label: "Engineer" },
	{ value: "finance", label: "Finance" },
];

const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

const validateForm = (data: EmployeeFormData): FormErrors => {
	const errors: FormErrors = {};

	if (!data.name.trim()) {
		errors.name = "Name is required";
	} else if (data.name.trim().length < 2) {
		errors.name = "Name must be at least 2 characters";
	}

	if (!data.email.trim()) {
		errors.email = "Email is required";
	} else if (!validateEmail(data.email)) {
		errors.email = "Invalid email format";
	}

	if (!data.department) {
		errors.department = "Department is required";
	}

	if (!data.role) {
		errors.role = "Role is required";
	}

	return errors;
};

const generateEmployeeId = async (department: DepartmentWithCode, allEmployees: any[]): Promise<string> => {
	const departmentEmployees = allEmployees.filter((emp: any) => emp.departmentId === department.id);
	const maxSeq = departmentEmployees.reduce((max: number, emp: any) => {
		const parts = emp.employeeId.split("-");
		if (parts.length === 2) {
			const seq = parseInt(parts[1], 10);
			return !isNaN(seq) && seq > max ? seq : max;
		}
		return max;
	}, 0);
	const nextSeq = maxSeq + 1;
	return `${department.code}-${String(nextSeq).padStart(3, "0")}`;
};

const EmployeeFormStep1 = ({ onNext, initialData, onChange, hasDraft, onClearDraft }: EmployeeFormStep1Props) => {
	const [formData, setFormData] = useState<EmployeeFormData>({
		name: initialData?.name || "",
		email: initialData?.email || "",
		department: initialData?.department || null,
		role: initialData?.role || "",
		employeeId: initialData?.employeeId || "",
	});

	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isGeneratingId, setIsGeneratingId] = useState(false);
	const [departments, setDepartments] = useState<DepartmentWithCode[]>([]);
	const [allEmployees, setAllEmployees] = useState<any[]>([]);
	const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			setIsLoadingDepartments(true);
			try {
				const [deps, employees] = await Promise.all([apiStep1.getDepartments(), apiStep1.getBasicInfo()]);
				setDepartments(deps);
				setAllEmployees(employees);
			} catch (error) {
				console.error("Failed to load data:", error);
			} finally {
				setIsLoadingDepartments(false);
			}
		};
		loadData();
	}, []);

	useEffect(() => {
		if (onChange) {
			onChange(formData);
		}
	}, [formData, onChange]);

	const handleDepartmentSearch = useCallback(async (query: string): Promise<AutocompleteOption[]> => {
		const filtered = await apiStep1.getDepartmentsByName(query);
		return filtered.map((dept) => ({ value: dept.id.toString(), label: dept.name }));
	}, []);

	const handleDepartmentChange = useCallback(
		async (value: string, option: AutocompleteOption) => {
			const department = departments.find((d) => d.id === parseInt(value, 10)) || null;
			console.log({ value, department, departments });
			setFormData((prev) => ({ ...prev, department, employeeId: "" }));
			setTouched((prev) => ({ ...prev, department: true }));
			setErrors((prev) => ({ ...prev, department: department ? undefined : prev.department }));

			if (department) {
				setIsGeneratingId(true);
				try {
					const newEmployeeId = await generateEmployeeId(department, allEmployees);
					setFormData((prev) => ({ ...prev, employeeId: newEmployeeId }));
				} catch (error) {
					console.error("Failed to generate employee ID:", error);
				} finally {
					setIsGeneratingId(false);
				}
			}
		},
		[departments, allEmployees],
	);

	const handleFieldChange = useCallback(
		(field: keyof EmployeeFormData) => (value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setTouched((prev) => ({ ...prev, [field]: true }));
		},
		[],
	);

	const handleFieldBlur = useCallback(
		(field: keyof EmployeeFormData) => () => {
			setTouched((prev) => ({ ...prev, [field]: true }));
			const fieldErrors = validateForm(formData);
			setErrors((prev) => ({ ...prev, [field]: fieldErrors[field as keyof FormErrors] }));
		},
		[formData],
	);

	const validateAllFields = useCallback(() => {
		const allErrors = validateForm(formData);
		setErrors(allErrors);
		setTouched({ name: true, email: true, department: true, role: true });
		return Object.keys(allErrors).length === 0;
	}, [formData]);

	const handleNext = useCallback(() => {
		if (validateAllFields()) {
			onNext(formData);
		}
	}, [formData, onNext, validateAllFields]);

	const isFormValid = useMemo(() => {
		return (
			formData.name.trim().length >= 2 &&
			formData.email.trim() !== "" &&
			validateEmail(formData.email) &&
			formData.department !== null &&
			formData.role !== ""
		);
	}, [formData]);

	return (
		<div className="employee-form-step1">
			<div className="employee-form-step1__header">
				<h2 className="employee-form-step1__title">Employee Information - Step 1</h2>
				<p className="employee-form-step1__subtitle">Basic employee details</p>
			</div>

			<form
				className="employee-form-step1__form"
				onSubmit={(e) => {
					e.preventDefault();
					handleNext();
				}}
			>
				<Input
					id="employee-name"
					name="name"
					label="Name"
					type="text"
					value={formData.name}
					placeholder="Enter employee name"
					error={touched.name ? errors.name : undefined}
					required
					onChange={handleFieldChange("name")}
					onBlur={handleFieldBlur("name")}
				/>

				<Input
					id="employee-email"
					name="email"
					label="Email"
					type="email"
					value={formData.email}
					placeholder="Enter employee email"
					error={touched.email ? errors.email : undefined}
					required
					onChange={handleFieldChange("email")}
					onBlur={handleFieldBlur("email")}
				/>

				<Autocomplete
					id="employee-department"
					name="department"
					label="Department"
					placeholder="Search department..."
					value={formData.department?.name || ""}
					selectedValue={formData.department?.id.toString() || ""}
					error={touched.department ? errors.department : undefined}
					debounceMs={500}
					required
					minLength={1}
					disabled={isLoadingDepartments}
					onSearch={handleDepartmentSearch}
					onChange={handleDepartmentChange}
					onBlur={() => {
						setTouched((prev) => ({ ...prev, department: true }));
						if (!formData.department) {
							setErrors((prev) => ({ ...prev, department: "Department is required" }));
						}
					}}
				/>

				<Select
					id="employee-role"
					name="role"
					label="Role"
					value={formData.role}
					placeholder="Select role"
					options={ROLE_OPTIONS}
					error={touched.role ? errors.role : undefined}
					required
					onChange={handleFieldChange("role")}
					onBlur={handleFieldBlur("role")}
				/>

				<Input
					id="employee-id"
					name="employeeId"
					label="Employee ID"
					type="text"
					value={formData.employeeId}
					placeholder="Auto-generated"
					disabled
					loading={isGeneratingId}
				/>

				<div className="employee-form-step1__actions">
					{hasDraft && onClearDraft && (
						<Button type="button" variant="secondary" onClick={onClearDraft}>
							Clear
						</Button>
					)}
					<Button type="submit" variant="primary" disabled={!isFormValid}>
						Next
					</Button>
				</div>
			</form>
		</div>
	);
};

export { EmployeeFormStep1 };
export type { EmployeeFormData };
