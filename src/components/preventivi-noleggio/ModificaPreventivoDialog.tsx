import { useState } from "react";
import { FormModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { PreventivoNoleggioForm } from "./PreventivoNoleggioForm";
import { PreventivoNoleggio, PreventivoNoleggioInput, StatoPreventivo } from "@/types/preventiviNoleggio";
import { Loader2, Edit } from "lucide-react";
import { DettaglioModificaDisplay } from "./DettaglioModificaDisplay";

interface ModificaPreventivoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preventivo: PreventivoNoleggio | null;
    onSave: (values: PreventivoNoleggioInput) => Promise<void>;
}

export function ModificaPreventivoDialog({
    open,
    onOpenChange,
    preventivo,
    onSave,
}: ModificaPreventivoDialogProps) {
    // Reset form when dialog opens/closes or preventivo changes is handled by key prop

    if (!preventivo) return null;

    const defaultValues = {
        id_anagrafica: preventivo.id_anagrafica,
        id_mezzo: preventivo.id_mezzo,
        id_anagrafica_fornitore: preventivo.id_anagrafica_fornitore,
        sede_operativa: preventivo.sede_operativa,
        data_inizio: preventivo.data_inizio,
        data_fine: preventivo.data_fine,
        tempo_indeterminato: preventivo.tempo_indeterminato,
        prezzo_noleggio: preventivo.prezzo_noleggio,
        prezzo_trasporto: preventivo.prezzo_trasporto,
        tipo_canone: preventivo.tipo_canone,
        note: preventivo.note,
    };

    // We need to wrap the handleSave to manage closing? 
    // No, the parent handles closing, but the form needs to submit.
    // The PreventivoNoleggioForm accepts onSubmit.

    const footer = (
        // The form has its own submit button internally?
        // Checking PreventivoNoleggioForm: Yes it renders a button "Salva preventivo".
        // But FormModal usually wants the button in the footer prop.
        // However, PreventivoNoleggioForm is a self-contained form with submit.
        // Ideally I should refactor PreventivoNoleggioForm to accept a footer portal or similar,
        // OR I can just pass null to footer and let the form render its button.
        // BUT FormModal footer is sticky. 
        // Let's check PreventivoNoleggioForm again.
        // It has `div className="flex justify-end"` at the bottom.
        // I can hide that via generic CSS or refactoring, but for now I'll just let it be.
        // Wait, FormModal footer prop is cleaner.
        // For this task, I will leave the button inside the form to avoid breaking the "New Quote" flow 
        // which uses the old layout.
        // The FormModal sticky footer slot will be empty.
        undefined
    );

    // Hack: The form has its own submit button. 
    // FormModal expects content.
    // If we want sticky footer, we'd need to extract the button.
    // For now: Just render form inside.

    return (
        <FormModal
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Modifica Preventivo
                </div>
            }
            size="lg"
        // No sticky footer for now, the form has its own button.
        >
            <div className="p-1 space-y-4">
                {/* Banner modifica richiesta - solo per stato IN_REVISIONE */}
                {preventivo.stato === StatoPreventivo.IN_REVISIONE && preventivo.dettaglio_modifica && (
                    <DettaglioModificaDisplay
                        dettaglio={preventivo.dettaglio_modifica}
                        variant="banner"
                    />
                )}
                <PreventivoNoleggioForm
                    key={preventivo.id_preventivo} // Force re-render on change
                    defaultValues={defaultValues}
                    onSubmit={onSave}
                    submitLabel="Salva Modifiche"
                />
            </div>
        </FormModal>
    );
}
