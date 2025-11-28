'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ComboBoxOption {
    value: string;
    label: string;
    search?: string;
}

interface ComboBoxProps {
    options: ComboBoxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    [key: string]: any;
}

export function ComboboxDemo({ options, value, onChange, placeholder = 'Select...', ...props }: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);

    const selectedLabel = options.find((option) => option.value === value)?.label;

    // No manual search state; rely on cmdk built-in filtering

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" {...props}>
                    {selectedLabel || placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search by Employee ID or Name..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={`${option.label} ${option.search ?? option.value}`}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                    <Check className={cn('ml-auto', value === option.value ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
