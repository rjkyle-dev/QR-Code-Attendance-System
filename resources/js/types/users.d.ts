import { Pagination } from './pagination';
import { SingleRole } from './role_permission';

export interface SingleUser {
	id: number;
	firstname: string;
	middlename?: string;
	lastname: string;
	fullname: string;
	email: string;
	department?: string;
	profile_image?: string;
	roles: string[];
	role_ids?: number[];
	created_at: string;
}

export interface User extends Pagination {
	data: SingleUser[];
}

export interface UserRole extends SingleUser {
	roles: SingleRole[];
}
