import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees, type Employee } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import "./EmployeesPage.css";

const EmployeesPage = () => {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [items, setItems] = useState<Employee[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedRole, setSelectedRole] = useState("admin");

	const navigate = useNavigate();

	const totalPages = Math.ceil(totalCount / limit);

	useEffect(() => {
		const fetchEmployees = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await getEmployees(page, limit);
				setItems(result.items);
				setTotalCount(result.totalCount);
			} catch (err) {
				setError("Failed to load employees");
			} finally {
				setLoading(false);
			}
		};

		fetchEmployees();
	}, [page, limit]);

	const handlePrevious = () => {
		if (page > 1) setPage(page - 1);
	};

	const handleNext = () => {
		if (page < totalPages) setPage(page + 1);
	};

	const handleAddEmployee = () => {
		navigate(`/wizard?role=${selectedRole}`);
	};

	if (loading) return <div className="employees-page__loading">Loading...</div>;
	if (error) return <div className="employees-page__error">{error}</div>;

	return (
		<div className="employees-page">
			<h1 className="employees-page__title">Employees</h1>

			<div className="employees-page__controls">
				<Select
					id="role-selector"
					name="role"
					label=""
					value={selectedRole}
					options={[
						{ value: "admin", label: "Admin" },
						{ value: "ops", label: "Ops" },
					]}
					onChange={(value) => setSelectedRole(value)}
				/>
				<Button variant="primary" onClick={handleAddEmployee}>
					Add Employee
				</Button>
			</div>

			<table className="employees-table">
				<thead>
					<tr>
						<th>Photo</th>
						<th>Name</th>
						<th>Department</th>
						<th>Role</th>
						<th>Location</th>
					</tr>
				</thead>
				<tbody>
					{items.map((employee) => (
						<tr key={employee.id}>
							<td>
								<img
									src={employee.photoUrl || "/placeholder-avatar.png"}
									alt={employee.name}
									className="employees-table__photo"
								/>
							</td>
							<td>{employee.name}</td>
							<td>{employee.departmentName}</td>
							<td>{employee.role}</td>
							<td>{employee.locationName}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className="employees-pagination">
				<Button variant="secondary" disabled={page === 1} onClick={handlePrevious}>
					Previous
				</Button>
				<span className="employees-pagination__info">
					Page {page} of {totalPages}
				</span>
				<Button variant="secondary" disabled={page >= totalPages} onClick={handleNext}>
					Next
				</Button>
			</div>
		</div>
	);
};

export default EmployeesPage;
