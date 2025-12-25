import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, FileWarning, Minus, Download, RefreshCw, Eye, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ContrattoUploadDialog } from "./ContrattoUploadDialog";
import { DocumentoFirmatoDialog } from "@/components/pdf/DocumentoFirmatoDialog";
import { GeneraContrattoDialogWrapper } from "./GeneraContrattoDialogWrapper";
import { NOLEGGIO_BUCKET } from "@/utils/noleggioStorage";

interface ContrattoFirmato {
  id_documento: string;
  file_path: string;
  nome_file_originale: string | null;
  created_at: string;
}

interface ContrattoStatusButtonProps {
  noleggioId: string;
  contrattoFirmato: ContrattoFirmato | null;
  richiedeContratto: boolean;
  onUploadSuccess: () => void;
  hasDraftContract?: boolean;
}

export function ContrattoStatusButton({
  noleggioId,
  contrattoFirmato,
  richiedeContratto,
  onUploadSuccess,
  hasDraftContract = false,
}: ContrattoStatusButtonProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [firmatoDialogOpen, setFirmatoDialogOpen] = useState(false);

  // Stato 1: Contratto non richiesto (grigio)
  if (!richiedeContratto) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground cursor-default"
        title="Contratto non richiesto per questo cliente"
      >
        <Minus className="h-4 w-4" />
      </Button>
    );
  }

  // Stato 2: Contratto firmato MANCANTE (Blu)
  if (!contrattoFirmato) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          onClick={() => setPreviewDialogOpen(true)}
          title="Genera Contratto"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <GeneraContrattoDialogWrapper
          noleggioId={noleggioId}
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          onSuccess={onUploadSuccess}
        />

        <ContrattoUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          noleggioId={noleggioId}
          onUploadSuccess={onUploadSuccess}
        />
      </>
    );
  }

  // Stato 3: Contratto presente (verde) - popover con opzioni
  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700"
            title="Contratto firmato presente"
          >
            <FileCheck className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="end">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full"
              onClick={() => {
                setPopoverOpen(false);
                setFirmatoDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizza
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full"
              onClick={() => {
                setPopoverOpen(false);
                setUploadDialogOpen(true);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sostituisci
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ContrattoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        noleggioId={noleggioId}
        existingDocumentId={contrattoFirmato.id_documento}
        existingFilePath={contrattoFirmato.file_path}
        onUploadSuccess={onUploadSuccess}
      />

      <DocumentoFirmatoDialog
        open={firmatoDialogOpen}
        onOpenChange={setFirmatoDialogOpen}
        filePath={contrattoFirmato.file_path}
        bucket={NOLEGGIO_BUCKET}
        title="Contratto Firmato"
        fileName={contrattoFirmato.nome_file_originale || "contratto_firmato.pdf"}
      />
    </>
  );
}

