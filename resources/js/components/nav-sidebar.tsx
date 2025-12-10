import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/user-permission';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function NavSidebar({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { can } = usePermission();
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    const toggleDropdown = (title: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    // Build visible items respecting permissions:
    // - Show a parent if it has permission OR any of its children are permitted
    const visibleItems = items
        .map((item) => {
            const parentAllowed = !item.permission || can(item.permission);

            if (item.items && item.items.length > 0) {
                const filteredSubItems = item.items.filter((subItem) => !subItem.permission || can(subItem.permission));

                if (parentAllowed || filteredSubItems.length > 0) {
                    return { ...item, items: filteredSubItems };
                }
                return null;
            }

            return parentAllowed ? item : null;
        })
        .filter(Boolean) as NavItem[];

    return (
        <SidebarGroup className="px-2 py-8">
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu className="font-semibold text-cfar-50">
                {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {/* Handle NavItem with items */}
                        {'items' in item && item.items && item.items.length > 0 ? (
                            <Collapsible open={openDropdowns[item.title]} onOpenChange={() => toggleDropdown(item.title)}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="mt-2 w-full" tooltip={{ children: item.title }}>
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                        <ChevronDown
                                            className={`ml-auto h-4 w-4 transition-transform duration-200 ${openDropdowns[item.title] ? 'rotate-180' : ''} group-data-[collapsible=icon]:hidden`}
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                                                                 <SidebarMenuSubButton asChild isActive={subItem.href === page.url} className="text-white">
                                                    <Link href={subItem.href}>
                                                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        ) : (
                            <SidebarMenuButton className="mt-2" asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                                <Link className="font-semibold" href={item.href}>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
