import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BanIcon, CheckCircle2Icon, ClockIcon, TrendingUpIcon, XCircleIcon } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

interface SectionCardsProps {
    leaveStats: {
        totalLeaves: number;
        approvedLeaves: number;
        rejectedLeaves: number;
        pendingLeaves: number;
        cancelledLeaves: number;
    };
}

export function SectionCards({
    leaveStats = {
        totalLeaves: 0,
        approvedLeaves: 0,
        rejectedLeaves: 0,
        pendingLeaves: 0,
        cancelledLeaves: 0,
    },
}: SectionCardsProps) {
    const { totalLeaves, approvedLeaves, rejectedLeaves, pendingLeaves, cancelledLeaves } = leaveStats;
    const totalLeavesCount = useCountUp(totalLeaves, 1000);
    const approvedLeavesCount = useCountUp(approvedLeaves, 1000);
    const pendingLeavesCount = useCountUp(pendingLeaves, 1000);
    const rejectedLeavesCount = useCountUp(rejectedLeaves, 1000);
    const cancelledLeavesCount = useCountUp(cancelledLeaves, 1000);
    const rejectedAndCancelledCount = useCountUp(rejectedLeaves + cancelledLeaves, 1000);
    return (
        <div className="grid grid-cols-1 gap-3 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">  
            {/* Total Leaves */}
            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold text-primary dark:text-white">Total Leaves</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{totalLeavesCount}</CardTitle>
                    <div className="absolute top-4 right-4">
                        <Badge
                            variant="outline"
                            className="flex gap-1 rounded-lg border-muted-foreground bg-muted text-xs text-primary dark:bg-main dark:text-blue-200"
                        >
                            <TrendingUpIcon className="size-3" />
                            {totalLeavesCount}
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="flex gap-2 font-medium text-primary dark:text-white">Total leave requests</div>
                    <div className="text-muted-foreground">All time</div>
                </CardFooter>
            </Card>

            {/* Approved Leaves */}
            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold text-green-900 dark:text-green-200">Approved</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{approvedLeavesCount}</CardTitle>
                    <div className="absolute top-4 right-4">
                        <Badge
                            variant="outline"
                            className="flex gap-1 rounded-lg border-green-700 bg-green-100 text-xs text-green-700 dark:bg-green-800 dark:text-green-200"
                        >
                            <CheckCircle2Icon className="size-3" />
                            {approvedLeavesCount}
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="flex gap-2 font-medium text-green-800 dark:text-green-200">Approved leaves</div>
                    <div className="text-muted-foreground">Successfully processed</div>
                </CardFooter>
            </Card>

            {/* Pending Leaves */}
            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold text-yellow-900 dark:text-yellow-200">Pending</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{pendingLeavesCount}</CardTitle>
                    <div className="absolute top-4 right-4">
                        <Badge
                            variant="outline"
                            className="flex gap-1 rounded-lg border-yellow-700 bg-yellow-100 text-xs text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                        >
                            <ClockIcon className="size-3" />
                            {pendingLeavesCount}
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="flex gap-2 font-medium text-yellow-800 dark:text-yellow-200">Pending approval</div>
                    <div className="text-muted-foreground">Awaiting action</div>
                </CardFooter>
            </Card>

            {/* Rejected & Cancelled Leaves */}
            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold text-red-900 dark:text-red-200">Rejected / Cancelled</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{rejectedAndCancelledCount}</CardTitle>
                    <div className="absolute top-4 right-4 flex gap-1">
                        <Badge
                            variant="outline"
                            className="flex gap-1 rounded-lg border-red-700 bg-red-100 text-xs text-red-700 dark:bg-red-800 dark:text-red-200"
                        >
                            <XCircleIcon className="size-3" />
                            {rejectedLeavesCount}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="flex gap-1 rounded-lg border-gray-700 bg-gray-100 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                            <BanIcon className="size-3" />
                            {cancelledLeavesCount}
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="flex gap-2 font-medium text-red-800 dark:text-red-200">
                        Rejected: {rejectedLeavesCount} | Cancelled: {cancelledLeavesCount}
                    </div>
                    <div className="text-muted-foreground">Not approved or withdrawn</div>
                </CardFooter>
            </Card>
        </div>
    );
}
