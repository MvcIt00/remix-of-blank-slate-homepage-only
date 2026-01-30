import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCompletaTrasporto } from "@/hooks/useTrasportiMutations";
import { format } from "date-fns";

const completaSchema = z.object({
    data_effettiva: z.string().min(1, "Inserisci la data effettiva"),
});

type CompletaFormValues = z.infer<typeof completaSchema>;

interface CompletaTrasportoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trasportoId: string | null;
    trasportoInfo?: {
        mezzo: string;
        tratta: string;
    };
    onSuccess?: () => void; // Callback per refresh dashboard
}

export function CompletaTrasportoDialog({
    open,
    onOpenChange,
    trasportoId,
    trasportoInfo,
    onSuccess,
}: CompletaTrasportoDialogProps) {
    const completaMutation = useCompletaTrasporto();

    const form = useForm<CompletaFormValues>({
        resolver: zodResolver(completaSchema),
        defaultValues: {
            data_effettiva: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        },
    });

    const onSubmit = async (values: CompletaFormValues) => {
        if (!trasportoId) return;
        await completaMutation.mutateAsync({
            id: trasportoId,
            data_effettiva: values.data_effettiva,
        });
        onOpenChange(false);
        form.reset();
        if (onSuccess) onSuccess();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Completare trasporto?</DialogTitle>
                    <DialogDescription>
                        Il trasporto passerà dallo stato "Confermato" a "Completato".
                        {trasportoInfo && (
                            <div className="mt-2 space-y-1">
                                <div><strong>Mezzo:</strong> {trasportoInfo.mezzo}</div>
                                <div><strong>Tratta:</strong> {trasportoInfo.tratta}</div>
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="data_effettiva"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data Effettiva *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Annulla
                            </Button>
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={completaMutation.isPending}
                            >
                                {completaMutation.isPending ? "Completamento..." : "Completa Trasporto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
