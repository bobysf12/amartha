import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { EmployeeFormStep1, type EmployeeFormData } from "../../components/features/wizard/EmployeeFormStep1";
import { EmployeeFormStep2, type EmployeeFormDataStep2 } from "../../components/features/wizard/EmployeeFormStep2";
import type { BasicInfo } from "../../utils/api";

const DRAFT_KEY_PREFIX = "wizard-autodraft-";

type DraftData = {
	step: number;
	step1Data: Partial<EmployeeFormData>;
	step2Data: Partial<EmployeeFormDataStep2>;
};

const convertToBasicInfo = (data: Partial<EmployeeFormData>): BasicInfo => {
	return {
		id: 0,
		name: data.name || "",
		email: data.email || "",
		departmentId: data.department?.id || 0,
		role: data.role || "",
		employeeId: data.employeeId || "",
	};
};

const WizardPage = () => {
	const [searchParams] = useSearchParams();
	const role = searchParams.get("role") || "";
	const [step, setStep] = useState(1);
	const [step1Data, setStep1Data] = useState<Partial<EmployeeFormData>>({});
	const [step2Data, setStep2Data] = useState<Partial<EmployeeFormDataStep2>>({});
	const [hasDraft, setHasDraft] = useState(false);
	const saveTimeoutRef = useRef<number>(null);

	useEffect(() => {
		const loadDraft = () => {
			try {
				const draftKey = `${DRAFT_KEY_PREFIX}${role}`;
				const draft = localStorage.getItem(draftKey);
				if (draft) {
					const parsed: DraftData = JSON.parse(draft);
					const initialStep = role === "admin" ? 1 : role === "ops" ? 2 : parsed.step;
					setStep(initialStep);
					setStep1Data(parsed.step1Data || {});
					setStep2Data(parsed.step2Data || {});
					setHasDraft(true);
				} else {
					const initialStep = role === "admin" ? 1 : role === "ops" ? 2 : 1;
					setStep(initialStep);
					setHasDraft(false);
				}
			} catch (error) {
				console.error("Failed to load draft:", error);
				const initialStep = role === "admin" ? 1 : role === "ops" ? 2 : 1;
				setStep(initialStep);
				setHasDraft(false);
			}
		};

		loadDraft();
	}, [role]);

	useEffect(() => {
		if (saveTimeoutRef.current) {
			window.clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			const draftKey = `${DRAFT_KEY_PREFIX}${role}`;
			try {
				const draft: DraftData = { step, step1Data, step2Data };
				localStorage.setItem(draftKey, JSON.stringify(draft));
				setHasDraft(true);
			} catch (error) {
				console.error("Failed to save draft:", error);
			}
		}, 2000);

		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [step, step1Data, step2Data, role]);

	const handleNext = (data: EmployeeFormData) => {
		if (role === "ops") {
			return;
		}
		setStep1Data((prev) => ({ ...prev, ...data }));
		setStep(2);
	};

	const handleBack = () => {
		if (role === "ops") {
			return;
		}
		setStep(1);
	};

	const handleSuccess = () => {
		alert("Employee data submitted successfully!");
		const initialStep = role === "admin" ? 1 : role === "ops" ? 2 : 1;
		setStep(initialStep);
		setStep1Data({});
		setStep2Data({});
		setHasDraft(false);
		localStorage.removeItem(`${DRAFT_KEY_PREFIX}${role}`);
	};

	const handleClearDraft = () => {
		const initialStep = role === "admin" ? 1 : role === "ops" ? 2 : 1;
		setStep(initialStep);
		setStep1Data({});
		setStep2Data({});
		setHasDraft(false);
		localStorage.removeItem(`${DRAFT_KEY_PREFIX}${role}`);
	};

	return (
		<div className="wizard-page">
			{step === 1 && (
				<EmployeeFormStep1
					onNext={handleNext}
					initialData={step1Data}
					onChange={setStep1Data}
					hasDraft={hasDraft}
					onClearDraft={handleClearDraft}
				/>
			)}
			{step === 2 && (
				<EmployeeFormStep2
					onBack={role === "ops" ? undefined : handleBack}
					onSuccess={handleSuccess}
					step1Data={convertToBasicInfo(step1Data)}
					initialData={step2Data}
					onChange={setStep2Data}
					hasDraft={hasDraft}
					onClearDraft={handleClearDraft}
					role={role}
				/>
			)}
		</div>
	);
};

export default WizardPage;
