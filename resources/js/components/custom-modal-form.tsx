import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DialogClose } from '@radix-ui/react-dialog';
import InputError from './input-error';
import { Input } from './ui/input';

interface AddButtonProps {
    id: string;
    label: string;
    className: string;
    icon: string;
    type: 'button' | 'submit' | 'reset' | undefined;
    variant: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | undefined;
}

interface FieldProps {
    id: string;
    key: string;
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    autocomplete?: string;
    tabIndex: number;
    autoFocus?: boolean;
    rows?: number;
    accept?: string;
    className?: string;
}

interface ButtonProps {
    key: string;
    type: 'button' | 'submit' | 'reset' | undefined;
    label: string;
    variant: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | undefined;
    className: string;
}

interface CustomModalFormProps {
    addButton: AddButtonProps;
    title: string;
    description: string;
    fields: FieldProps[];
    buttons: ButtonProps[];
    data: Record<string, any>;
    setData: (name: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    handleSubmit: (data: any) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'view' | 'edit';
    previewImage?: string | null;
}

export const CustomModalForm = ({
    addButton,
    title,
    description,
    fields,
    buttons,
    data,
    setData,
    errors,
    processing,
    handleSubmit,
    open,
    onOpenChange,
    mode = 'create',
    previewImage,
}: CustomModalFormProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            {/* Button will trigger modal */}
            <DialogTrigger asChild>
                <Button type={addButton.type} id={addButton.id} variant={addButton.variant} className={addButton.className}>
                    {addButton.icon && <addButton.icon />} {addButton.label}
                </Button>
            </DialogTrigger>

            {/* Dialog content */}
            <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-6">
                        {fields.map((field) => (
                            <div key={field.key} className="grid gap-2">
                                <Label htmlFor={field.id}>{field.label} </Label>

                                {field.type === 'textarea' ? (
                                    <textarea
                                        id={field.id}
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        rows={field.rows}
                                        autoComplete={field.autocomplete}
                                        tabIndex={field.tabIndex}
                                        className={field.className}
                                        onChange={(e) => setData(field.name, e.target.value)}
                                        value={data[field.name] || ''}
                                        disabled={processing || mode === 'view'}
                                    />
                                ) : field.type === 'file' ? (
                                    <div className="space-y-2">
                                        {/* Image preview only */}
                                        {mode !== 'create' && previewImage && (
                                            <img src={previewImage} alt={data?.[field.key]} className="h-32 w-32 rounded object-cover" />
                                        )}

                                        {/* File input */}
                                        {mode !== 'view' && (
                                            <Input
                                                id={field.id}
                                                name={field.name}
                                                type="file"
                                                accept={field.accept}
                                                tabIndex={field.tabIndex}
                                                onChange={(e) => setData(field.name, e.target.files ? e.target.files[0] : null)}
                                                disabled={processing}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <Input
                                        id={field.id}
                                        name={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        autoComplete={field.autocomplete}
                                        tabIndex={field.tabIndex}
                                        autoFocus={field.autoFocus}
                                        onChange={(e) => setData(field.name, e.target.value)}
                                        value={data[field.name] || ''}
                                        disabled={processing || mode === 'view'}
                                    />
                                )}

                                {/* Form Validation error */}
                                <InputError message={errors?.[field.name]} />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        {buttons.map((button) => {
                            if (button.key === 'cancel') {
                                return (
                                    <DialogClose asChild key={button.key}>
                                        <Button key={button.key} type={button.type} variant={button.variant} className={button.className}>
                                            {button.label}
                                        </Button>
                                    </DialogClose>
                                );
                            } else if (mode !== 'view') {
                                return (
                                    <Button key={button.key} type={button.type} variant={button.variant} className={button.className}>
                                        {button.label}
                                    </Button>
                                );
                            }
                        })}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
