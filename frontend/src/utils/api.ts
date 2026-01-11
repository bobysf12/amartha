const API_STEP1_BASE_URL = "http://localhost:4001";
const API_STEP2_BASE_URL = "http://localhost:4002";

const transformDepartment = (dept: Department): DepartmentWithCode => ({
	...dept,
	id: Number(dept.id),
	code: dept.name.substring(0, 3).toUpperCase(),
});

const transformDepartments = (departments: Department[]): DepartmentWithCode[] => {
	return departments.map(transformDepartment);
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(baseUrl: string, endpoint: string, method: HttpMethod = "GET", body?: unknown): Promise<T> {
	const url = `${baseUrl}${endpoint}`;
	const options: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
		},
	};

	if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(url, options);

	if (!response.ok) {
		throw new Error(`API error: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}

export const apiStep1 = {
	getDepartments: async (): Promise<DepartmentWithCode[]> => {
		const departments = await request<Department[]>(API_STEP1_BASE_URL, "/departments");
		return transformDepartments(departments);
	},
	getDepartmentsByName: async (name: string): Promise<DepartmentWithCode[]> => {
		const departments = await request<Department[]>(API_STEP1_BASE_URL, `/departments?name_like=${name}`);
		return transformDepartments(departments);
	},
	getBasicInfo: async (): Promise<BasicInfo[]> => {
		const [basicInfo, departments] = await Promise.all([
			request<BasicInfo[]>(API_STEP1_BASE_URL, "/basicInfo"),
			request<Department[]>(API_STEP1_BASE_URL, "/departments"),
		]);
		const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
		return basicInfo.map((info) => ({
			...info,
			departmentName: departmentMap.get(info.departmentId),
		}));
	},
	getBasicInfoById: (id: number) => request<BasicInfo>(API_STEP1_BASE_URL, `/basicInfo/${id}`),
	createBasicInfo: (data: Omit<BasicInfo, "id">) =>
		request<BasicInfo>(API_STEP1_BASE_URL, "/basicInfo", "POST", data),
	updateBasicInfo: (id: number, data: Partial<BasicInfo>) =>
		request<BasicInfo>(API_STEP1_BASE_URL, `/basicInfo/${id}`, "PUT", data),
	patchBasicInfo: (id: number, data: Partial<BasicInfo>) =>
		request<BasicInfo>(API_STEP1_BASE_URL, `/basicInfo/${id}`, "PATCH", data),
	deleteBasicInfo: (id: number) => request<void>(API_STEP1_BASE_URL, `/basicInfo/${id}`, "DELETE"),
};

export const apiStep2 = {
	getLocations: () => request<Location[]>(API_STEP2_BASE_URL, "/locations"),
	getDetails: () => request<Detail[]>(API_STEP2_BASE_URL, "/details"),
	getDetailsById: (id: number) => request<Detail>(API_STEP2_BASE_URL, `/details/${id}`),
	createDetails: (data: Omit<Detail, "id">) => request<Detail>(API_STEP2_BASE_URL, "/details", "POST", data),
	updateDetails: (id: number, data: Partial<Detail>) =>
		request<Detail>(API_STEP2_BASE_URL, `/details/${id}`, "PUT", data),
	patchDetails: (id: number, data: Partial<Detail>) =>
		request<Detail>(API_STEP2_BASE_URL, `/details/${id}`, "PATCH", data),
	deleteDetails: (id: number) => request<void>(API_STEP2_BASE_URL, `/details/${id}`, "DELETE"),
};

export type Department = {
	id: number;
	name: string;
};

export type DepartmentWithCode = Department & {
	code: string;
};

export type BasicInfo = {
	id: number;
	name: string;
	email: string;
	departmentId: number;
	role: string;
	employeeId: string;
	departmentName?: string;
};

export type Location = {
	id: number;
	name: string;
};

export type Detail = {
	id: number;
	basicInfoId: number;
	locationId: number;
	startDate: string;
	endDate?: string;
	salary?: number;
};
