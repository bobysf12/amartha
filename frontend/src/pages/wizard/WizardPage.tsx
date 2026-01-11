import { useState } from 'react';
import { EmployeeFormStep1, type EmployeeFormData } from '../../components/features/wizard/EmployeeFormStep1';
import { EmployeeFormStep2 } from '../../components/features/wizard/EmployeeFormStep2';

const WizardPage = () => {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<Partial<EmployeeFormData>>({});

	const handleNext = (data: EmployeeFormData) => {
		setFormData((prev) => ({ ...prev, ...data }));
		setStep(2);
	};

	const handleBack = () => {
		setStep(1);
	};

	const handleSuccess = () => {
		alert('Employee data submitted successfully!');
		setStep(1);
		setFormData({});
	};

	return (
		<div className="wizard-page">
			{step === 1 && <EmployeeFormStep1 onNext={handleNext} />}
			{step === 2 && <EmployeeFormStep2 onBack={handleBack} onSuccess={handleSuccess} step1Data={formData} />}
		</div>
	);
};

export default WizardPage;
