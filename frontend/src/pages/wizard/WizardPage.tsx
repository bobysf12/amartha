import { useState } from 'react';
import { EmployeeFormStep1, type EmployeeFormData } from '../../components/features/wizard/EmployeeFormStep1';

const WizardPage = () => {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<Partial<EmployeeFormData>>({});

	const handleNext = (data: EmployeeFormData) => {
		setFormData((prev) => ({ ...prev, ...data }));
		setStep(2);
	};

	return (
		<div className="wizard-page">
			{step === 1 && <EmployeeFormStep1 onNext={handleNext} />}
		</div>
	);
};

export default WizardPage;
