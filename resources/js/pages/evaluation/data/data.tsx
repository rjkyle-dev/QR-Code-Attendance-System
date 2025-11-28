import { departments as departmentsData, positions as positionsData, workStatus as workStatusData } from '@/hooks/data';

export const departments = departmentsData.map((department) => ({
    label: department,
    value: department,
}));

export const positions = positionsData.map((position) => ({
    label: position,
    value: position,
}));

export const workStatus = workStatusData.map((status) => ({
    label: status,
    value: status,
}));
