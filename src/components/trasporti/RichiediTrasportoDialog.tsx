import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnagraficaSelettore } from "@/components/selettori/anagrafica_selettore";
import { SedeSelettore } from "@/components/selettori/sede_selettore";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
    id_mezzo: z.string().uuid().or(z.literal('')),
    id_vettore: z.string().uuid().or(z.literal('')).optional(),
    id_anagrafica_partenza: z.string().uuid("Seleziona anagrafica partenza").or(z.literal('')),
    id_sede_partenza: z.string().uuid("Seleziona sede partenza").or(z.literal('')),
    id_anagrafica_arrivo: z.string().uuid("Seleziona anagrafica arrivo").or(z.literal('')),
    id_sede_arrivo: z.string().uuid("Seleziona sede arrivo").or(z.literal('')),
    data_programmata: z.string().optional(),
    prezzo_cliente: z.string().optional(),
    costo_vettore: z.string().optional(),
    note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RichiediTrasportoDialogProps {
    idNoleggio: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RichiediTrasportoDialog({ idNoleggio, open, onOpenChange }: RichiediTrasportoDialogProps) {
    const queryClient = useQueryClient();
    const [manualAnagraficaPartenza, setManualAnagraficaPartenza] = useState<boolean>(false);
    const [manualAnagraficaArrivo, setManualAnagraficaArrivo] = useState<boolean>(false);
    const [tipoTrasporto, setTipoTrasporto] = useState<'consegna' | 'ritiro' | null>(null);

    // Fetch noleggio info
    const { data: noleggio, isLoading: noleggioLoading } = useQuery({
        queryKey: ['noleggio', idNoleggio],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vw_noleggi_completi' as any)
                .select('*')
                .eq('id_noleggio', idNoleggio)
                .single();

            if (error) throw error;
            return data as any;
        },
        enabled: open && !!idNoleggio,
    });

    // Fetch owner data (for Ritiro -> Sede Legale Owner)
    const { data: ownerSedeLegale } = useQuery({
        queryKey: ['owner_sede_legale'],
        queryFn: async () => {
            const { data: anagraficaOwner, error: anagraficaError } = await supabase
                .from('Anagrafiche')
                .select('id_anagrafica')
                .eq('is_owner', true)
                .single();

            if (anagraficaError || !anagraficaOwner) return null;

            const { data: sedeLegale, error: sedeError } = await supabase
                .from('Sedi')
                .select('id_sede, id_anagrafica')
                .eq('id_anagrafica', anagraficaOwner.id_anagrafica)
                .eq('is_legale', true)
                .single();

            if (sedeError) return null;
            return sedeLegale;
        },
        enabled: open
    });

    // Fetch anagrafica partenza (based on noleggio.id_sede_ubicazione)
    const { data: anagraficaPartenzaData } = useQuery({
        queryKey: ['sede_partenza_info', noleggio?.id_sede_ubicazione],
        queryFn: async () => {
            if (!noleggio?.id_sede_ubicazione) return null;

            const { data, error } = await supabase
                .from('Sedi')
                .select('id_anagrafica')
                .eq('id_sede', noleggio.id_sede_ubicazione)
                .single();

            if (error) return null;
            return data;
        },
        enabled: !!noleggio?.id_sede_ubicazione && !manualAnagraficaPartenza,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id_mezzo: '',
            id_vettore: '',
            id_anagrafica_partenza: '',
            id_sede_partenza: '',
            id_anagrafica_arrivo: '',
            id_sede_arrivo: '',
            data_programmata: new Date().toISOString().split('T')[0],
            prezzo_cliente: '',
            costo_vettore: '',
            note: '',
        },
    });

    // Reactive fetching of Sedi based on selected Anagrafica
    const anagraficaPartenzaId = form.watch('id_anagrafica_partenza');
    const anagraficaArrivoId = form.watch('id_anagrafica_arrivo');

    const { data: sediPartenza = [] } = useQuery({
        queryKey: ['sedi', anagraficaPartenzaId],
        queryFn: async () => {
            if (!anagraficaPartenzaId) return [];
            const { data, error } = await supabase
                .from('Sedi')
                .select('*')
                .eq('id_anagrafica', anagraficaPartenzaId);
            if (error) return [];
            return data;
        },
        enabled: !!anagraficaPartenzaId,
    });

    const { data: sediArrivo = [] } = useQuery({
        queryKey: ['sedi', anagraficaArrivoId],
        queryFn: async () => {
            if (!anagraficaArrivoId) return [];
            const { data, error } = await supabase
                .from('Sedi')
                .select('*')
                .eq('id_anagrafica', anagraficaArrivoId);
            if (error) return [];
            return data;
        },
        enabled: !!anagraficaArrivoId,
    });

    // Pre-populate id_mezzo (always, regardless of ubicazione)
    useEffect(() => {
        if (noleggio?.id_mezzo) {
            form.setValue('id_mezzo', noleggio.id_mezzo);
        }
    }, [noleggio, form]);

    // Pre-populate prezzo_cliente
    useEffect(() => {
        if (noleggio?.prezzo_trasporto) {
            form.setValue('prezzo_cliente', String(noleggio.prezzo_trasporto));
        }
    }, [noleggio, form]);

    // Pre-populate partenza (only if ubicazione exists)
    useEffect(() => {
        if (noleggio?.id_sede_ubicazione && anagraficaPartenzaData?.id_anagrafica) {
            form.setValue('id_anagrafica_partenza', anagraficaPartenzaData.id_anagrafica);
            form.setValue('id_sede_partenza', noleggio.id_sede_ubicazione);
        }
    }, [noleggio, anagraficaPartenzaData, form]);

    // Pre-populate arrivo (conditional on tipo)
    useEffect(() => {
        if (tipoTrasporto === 'consegna' && noleggio?.id_sede_operativa && noleggio?.id_anagrafica) {
            form.setValue('id_anagrafica_arrivo', noleggio.id_anagrafica);
            form.setValue('id_sede_arrivo', noleggio.id_sede_operativa);
        } else if (tipoTrasporto === 'ritiro' && ownerSedeLegale) {
            form.setValue('id_anagrafica_arrivo', ownerSedeLegale.id_anagrafica);
            form.setValue('id_sede_arrivo', ownerSedeLegale.id_sede);
        } else {
            if (!manualAnagraficaArrivo) {
                form.setValue('id_anagrafica_arrivo', '');
                form.setValue('id_sede_arrivo', '');
            }
        }
    }, [tipoTrasporto, noleggio, ownerSedeLegale, form, manualAnagraficaArrivo]);

    // Create trasporto mutation
    const createMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const insertData = {
                id_mezzo: values.id_mezzo,
                id_vettore: values.id_vettore || null,
                id_sede_partenza: values.id_sede_partenza,
                id_sede_arrivo: values.id_sede_arrivo,
                data_programmata: values.data_programmata || null,
                prezzo_cliente: values.prezzo_cliente ? parseFloat(values.prezzo_cliente) : null,
                costo_vettore: values.costo_vettore ? parseFloat(values.costo_vettore) : null,
                note: values.note || null,
                stato: 'richiesto',
            };

            const { data, error } = await supabase
                .from('trasporti' as any)
                .insert(insertData)
                .select('id_trasporto')
                .single();

            if (error) throw error;

            // Link to noleggio
            const { error: linkError } = await supabase
                .from('noleggi_trasporti' as any)
                .insert({
                    id_noleggio: idNoleggio,
                    id_trasporto: (data as any).id_trasporto,
                });

            if (linkError) throw linkError;
        },
        onSuccess: () => {
            toast.success("Richiesta trasporto creata con successo");
            form.reset();
            setTipoTrasporto(null);
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ['noleggi'] });
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const onSubmit = (values: FormValues) => {
        createMutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Richiedi Trasporto</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* 1. Mezzo Info (Read Only) */}
                        <div className="bg-muted p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Mezzo da Trasportare</h3>
                            {noleggioLoading ? (
                                <p>Caricamento...</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block">Marca</span>
                                        <span className="font-medium">{noleggio?.mezzo_marca || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Modello</span>
                                        <span className="font-medium">{noleggio?.mezzo_modello || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Matricola</span>
                                        <span className="font-medium">{noleggio?.mezzo_matricola || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* 2. Tipo Trasporto Selector */}
                        <div className="flex justify-center gap-4">
                            <Button
                                type="button"
                                variant={tipoTrasporto === 'consegna' ? 'default' : 'outline'}
                                onClick={() => setTipoTrasporto('consegna')}
                                className="w-32"
                            >
                                Consegna
                            </Button>
                            <Button
                                type="button"
                                variant={tipoTrasporto === 'ritiro' ? 'default' : 'outline'}
                                onClick={() => setTipoTrasporto('ritiro')}
                                className="w-32"
                            >
                                Ritiro
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* 3. Punto di Partenza */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium flex items-center gap-2">
                                        Punto di Partenza
                                    </h4>
                                    {!noleggio?.id_sede_ubicazione && (
                                        <p className="text-xs text-red-600 font-medium mt-1">
                                            ⚠️ Ubicazione del mezzo non registrata
                                        </p>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="id_anagrafica_partenza"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Anagrafica</FormLabel>
                                            <FormControl>
                                                <AnagraficaSelettore
                                                    key={`partenza-anag-${field.value}`}
                                                    placeholder="Seleziona partenza"
                                                    onSelectAnagrafica={(id) => {
                                                        field.onChange(id);
                                                        setManualAnagraficaPartenza(true);
                                                    }}
                                                    defaultValue={field.value}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="id_sede_partenza"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sede</FormLabel>
                                            <FormControl>
                                                <SedeSelettore
                                                    sedi={sediPartenza}
                                                    value={field.value}
                                                    onSelectSede={(sedeId) => field.onChange(sedeId)}
                                                    placeholder="Seleziona sede partenza"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* 4. Punto di Arrivo */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    Punto di Arrivo
                                </h4>

                                <FormField
                                    control={form.control}
                                    name="id_anagrafica_arrivo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Anagrafica</FormLabel>
                                            <FormControl>
                                                <AnagraficaSelettore
                                                    key={`arrivo-anag-${field.value}`}
                                                    placeholder={tipoTrasporto ? "Seleziona anagrafica arrivo" : "Seleziona tipo trasporto prima"}
                                                    onSelectAnagrafica={(id) => {
                                                        field.onChange(id);
                                                        setManualAnagraficaArrivo(true);
                                                    }}
                                                    defaultValue={field.value}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="id_sede_arrivo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sede</FormLabel>
                                            <FormControl>
                                                <SedeSelettore
                                                    sedi={sediArrivo}
                                                    value={field.value}
                                                    onSelectSede={(sedeId) => field.onChange(sedeId)}
                                                    placeholder={tipoTrasporto ? "Seleziona sede arrivo" : "Seleziona tipo trasporto prima"}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* 5. Vettore (Opzionale) e Costi */}
                        <Separator />
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="id_vettore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vettore (Opzionale)</FormLabel>
                                        <FormControl>
                                            <AnagraficaSelettore
                                                placeholder="Seleziona vettore"
                                                filterView="trasportatori"
                                                onSelectAnagrafica={(id) => field.onChange(id)}
                                                defaultValue={field.value}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="costo_vettore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Costo Vettore (€)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="prezzo_cliente"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prezzo Cliente (€)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* 6. Data e Note */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="data_programmata"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data Programmata</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Eventuali note per il trasportatore..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Annulla
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Salvataggio..." : "Salva Richiesta"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
