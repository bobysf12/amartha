const API_STEP1_BASE_URL = import.meta.env.VITE_API_STEP1_BASE_URL || "http://localhost:4001";
const API_STEP2_BASE_URL = import.meta.env.VITE_API_STEP2_BASE_URL || "http://localhost:4002";

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
	getLocationsByName: async (name: string): Promise<Location[]> => {
		const locations = await request<Location[]>(API_STEP2_BASE_URL, `/locations?name_like=${name}`);
		return locations;
	},
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
	employmentType?: string;
	notes?: string;
	image?: string;
};

export type Employee = {
	id: number;
	name: string;
	departmentName: string;
	role: string;
	locationName: string;
	photoUrl?: string;
};

type PaginatedEmployees = {
	items: Employee[];
	totalCount: number;
};

export const getEmployees = async (page: number, limit: number): Promise<PaginatedEmployees> => {
	const [basicInfoResponse, detailsList, departments, locations] = await Promise.all([
		fetch(`${API_STEP1_BASE_URL}/basicInfo?_page=${page}&_limit=${limit}`),
		request<Detail[]>(API_STEP2_BASE_URL, `/details?_page=${page}&_limit=${limit}`),
		request<Department[]>(API_STEP1_BASE_URL, "/departments"),
		request<Location[]>(API_STEP2_BASE_URL, "/locations"),
	]);

	if (!basicInfoResponse.ok) {
		throw new Error(`API error: ${basicInfoResponse.status} ${basicInfoResponse.statusText}`);
	}

	const basicInfoList = (await basicInfoResponse.json()) as BasicInfo[];
	const totalCountHeader = basicInfoResponse.headers.get("X-Total-Count");
	const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;

	const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
	const locationMap = new Map(locations.map((l) => [l.id, l.name]));
	const detailMap = new Map(detailsList.map((d) => [d.basicInfoId, d]));

	const employees: Employee[] = basicInfoList.map((info) => {
		const detail = detailMap.get(info.id);
		return {
			id: info.id,
			name: info.name,
			departmentName: departmentMap.get(info.departmentId) || "N/A",
			role: info.role,
			locationName: detail ? locationMap.get(detail.locationId) || "N/A" : "N/A",
			photoUrl: detail?.image,
		};
	});

	return {
		items: employees,
		totalCount,
	};
};
