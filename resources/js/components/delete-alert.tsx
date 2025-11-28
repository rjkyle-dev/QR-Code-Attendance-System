'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteConfirmationDialogProps {
    onConfirm: () => void;
}

const DeleteConfirmationDialog = ({ onConfirm }: DeleteConfirmationDialogProps) => {

  const [open, setOpen] = useState(false);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="hover-lift w-full space-y-4 rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-red-50 dark:border-red-200/10 dark:bg-red-700/10">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                        {/* <Trash2 className="size-8 text-red-600" /> */}
                        Delete Employee?
                    </AlertDialogTitle>
                    <AlertDialogDescription>Please proceed with caution, this cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>

                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm(); // perform delete
                            setOpen(false); // manually close after
                        }}
                    >
                        Confirm
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        // <AlertDialog>
        //     <AlertDialogTrigger asChild>
        //         <Button size="sm" variant="outline" className="hover-lift w-full border-red-300 text-red-600 hover:bg-red-50">
        //             <Trash2 className="h-4 w-4" />
        //             Delete
        //         </Button>
        //     </AlertDialogTrigger>
        //     <AlertDialogContent>
        //         <AlertDialogHeader>
        //             <AlertDialogTitle className="text-lg font-semibold text-red-600">Are you sure you want to delete this employee?</AlertDialogTitle>
        //         </AlertDialogHeader>
        //         <AlertDialogFooter>
        //             <AlertDialogCancel>Cancel</AlertDialogCancel>
        //             <Button onClick={onConfirm} variant="destructive" className="bg-red-600 text-white hover:bg-red-700">
        //                 Yes, Delete
        //             </Button>
        //         </AlertDialogFooter>
        //     </AlertDialogContent>
        // </AlertDialog>
    );
};

export default DeleteConfirmationDialog;
