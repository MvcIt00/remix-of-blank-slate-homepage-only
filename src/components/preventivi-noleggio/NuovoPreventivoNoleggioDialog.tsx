import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormDialogLayout } from "@/components/layout/FormDialogLayout";
import { PreventivoNoleggioForm } from "./PreventivoNoleggioForm";
import { PreventivoNoleggioInput } from "@/types/preventiviNoleggio";

interface NuovoPreventivoNoleggioDialogProps {
  onSave: (values: PreventivoNoleggioInput) => Promise<void>;
}

export function NuovoPreventivoNoleggioDialog({ onSave }: NuovoPreventivoNoleggioDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSave = async (values: PreventivoNoleggioInput) => {
    await onSave(values);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nuovo preventivo</Button>
      <FormDialogLayout open={open} onOpenChange={setOpen} title="Nuovo preventivo noleggio">
        <PreventivoNoleggioForm onSubmit={handleSave} submitLabel="Crea preventivo" />
      </FormDialogLayout>
    </>
  );
}
