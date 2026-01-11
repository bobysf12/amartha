import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeesPage from "./pages/employees/EmployeesPage";
import WizardPage from "./pages/wizard/WizardPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<EmployeesPage />} />
				<Route path="/wizard" element={<WizardPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
