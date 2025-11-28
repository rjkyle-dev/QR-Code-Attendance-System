import type { ComponentProps } from 'react';
import AdminManage from './admin-manage';

type AdminManageProps = ComponentProps<typeof AdminManage>;

export default function Index(props: AdminManageProps) {
    return <AdminManage {...props} />;
}
