import { useState, useEffect, useRef } from "react";
import { EmployeeFormStep1, type EmployeeFormData } from "../../components/features/wizard/EmployeeFormStep1";
import { EmployeeFormStep2, type EmployeeFormDataStep2 } from "../../components/features/wizard/EmployeeFormStep2";

const DRAFT_KEY = "wizard-autodraft";

type DraftData = {
	step: number;
	step1Data: Partial<EmployeeFormData>;
	step2Data: Partial<EmployeeFormDataStep2>;
};

const WizardPage = () => {
	const [step, setStep] = useState(1);
	const [step1Data, setStep1Data] = useState<Partial<EmployeeFormData>>({});
	const [step2Data, setStep2Data] = useState<Partial<EmployeeFormDataStep2>>({});
	const [hasDraft, setHasDraft] = useState(false);
	const saveTimeoutRef = useRef<number>(null);

	useEffect(() => {
		const loadDraft = () => {
			try {
				const draft = localStorage.getItem(DRAFT_KEY);
				if (draft) {
					const parsed: DraftData = JSON.parse(draft);
					setStep(parsed.step);
					setStep1Data(parsed.step1Data || {});
					setStep2Data(parsed.step2Data || {});
					setHasDraft(true);
				} else {
					setHasDraft(false);
				}
			} catch (error) {
				console.error("Failed to load draft:", error);
			}
		};

		loadDraft();
	}, []);

	useEffect(() => {
		if (saveTimeoutRef.current) {
			window.clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			try {
				const draft: DraftData = { step, step1Data, step2Data };
				localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
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
	}, [step, step1Data, step2Data]);

	const handleNext = (data: EmployeeFormData) => {
		setStep1Data((prev) => ({ ...prev, ...data }));
		setStep(2);
	};

	const handleBack = () => {
		setStep(1);
	};

	const handleSuccess = () => {
		alert("Employee data submitted successfully!");
		setStep(1);
		setStep1Data({});
		setStep2Data({});
		setHasDraft(false);
		localStorage.removeItem(DRAFT_KEY);
	};

	const handleClearDraft = () => {
		setStep(1);
		setStep1Data({});
		setStep2Data({});
		setHasDraft(false);
		localStorage.removeItem(DRAFT_KEY);
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
					onBack={handleBack}
					onSuccess={handleSuccess}
					step1Data={step1Data}
					initialData={step2Data}
					onChange={setStep2Data}
					hasDraft={hasDraft}
					onClearDraft={handleClearDraft}
				/>
			)}
		</div>
	);
};

export default WizardPage;
