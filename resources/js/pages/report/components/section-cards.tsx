import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'




export function SectionCards() {
    return (
        <div className="grid grid-cols-1 gap-3 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold dark:text-darkMain">Total Employee</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"></CardTitle>
                    <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            +12.5%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Visitors for the last 6 months</div>
                </CardFooter>
            </Card>

            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold dark:text-darkMain">Department</CardDescription>
                    {/* Display the count here */}
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"></CardTitle>
                    <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingDownIcon className="size-3" />
                            -20%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Down 20% this period <TrendingDownIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Acquisition needs attention</div>
                </CardFooter>
            </Card>

            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold dark:text-darkMain">Active Accounts</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">45,678</CardTitle>
                    <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            +12.5%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Strong user retention <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Engagement exceed targets</div>
                </CardFooter>
            </Card>

            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="font-semibold dark:text-darkMain">Growth Rate</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">4.5%</CardTitle>
                    <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            +4.5%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Steady performance <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Meets growth projections</div>
                </CardFooter>
            </Card>
        </div>
    );
}
