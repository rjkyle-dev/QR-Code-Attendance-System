import { usePage } from '@inertiajs/react';

type AuthProps = {
	auth?: {
		permissions?: string[];
	};
};

export function usePermission() {
	const { props } = usePage<AuthProps>();
	const permissions = props.auth?.permissions || [];

	const can = (permission: string): boolean => permissions.includes(permission);

	return { can };
}
