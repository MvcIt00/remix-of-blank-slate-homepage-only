import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, FileWarning, Minus, Download, RefreshCw, Eye, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ContrattoUploadDialog } from "./ContrattoUploadDialog";
import { ContrattoFirmatoPreviewDialog } from "./ContrattoFirmatoPreviewDialog";
import { GeneraContrattoDialogWrapper } from "./GeneraContrattoDialogWrapper";

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

  // Stato 2: Contratto mancante o bozza (Blue/Arancione)
  if (!contrattoFirmato) {
    return (
      <>
        {/* Caso Bozza Presente (Arancione) - Popover con scelte */}
        {hasDraftContract ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                title="Bozza presente - In attesa di firma"
              >
                <FileWarning className="h-4 w-4" />
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
                    setPreviewDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizza Bozza
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
                  <Download className="h-4 w-4 mr-2" />
                  Allega Firmato
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          /* Caso Nessun Contratto (Blu) - Generazione */
          <Button
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => setPreviewDialogOpen(true)}
            title="Genera Contratto"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Dialoghi Condivisi per i flussi sopra */}
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
                setPreviewDialogOpen(true);
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

      <ContrattoFirmatoPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        filePath={contrattoFirmato.file_path}
        fileName={contrattoFirmato.nome_file_originale || undefined}
      />
    </>
  );
}
