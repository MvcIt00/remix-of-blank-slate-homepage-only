import { useEffect, useState } from "react";
import { Building2, MapPin, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  EditAnagraficaDialog,
  EditSediDialog,
  EditDatiAmministrativiDialog,
  EditContattiDialog,
} from "@/components/anagrafica";
import { DraggableWindow } from "@/components/ui/draggable-window";

interface AnagraficaCardProps {
  anagraficaId: string;
  onClose: () => void;
}

interface AnagraficaData {
  id_anagrafica: string;
  ragione_sociale: string;
  partita_iva: string | null;
  is_cliente: boolean | null;
  is_fornitore: boolean | null;
  is_owner: boolean | null;
}

interface DatiAmministrativi {
  pec: string | null;
  codice_univoco: string | null;
  iban: string | null;
  pagamento: string | null;
  partita_iva_estera: string | null;
  esente_iva: boolean | null;
  prezzo_manodopera: number | null;
}

interface Sede {
  id_sede: string;
  nome_sede: string | null;
  indirizzo: string | null;
  citta: string | null;
  provincia: string | null;
  cap: number | null;
  is_legale: boolean | null;
  is_operativa: boolean | null;
  is_nave: boolean | null;
  is_banchina: boolean | null;
  is_officina: boolean | null;
}

interface Contatto {
  id_contatto: string;
  nome: string | null;
  email: string | null;
  telefono: string | null;
  is_aziendale: boolean | null;
  is_referente: boolean | null;
}

export function AnagraficaCard({ anagraficaId, onClose }: AnagraficaCardProps) {
  const [anagrafica, setAnagrafica] = useState<AnagraficaData | null>(null);
  const [datiAmministrativi, setDatiAmministrativi] = useState<DatiAmministrativi | null>(null);
  const [sedi, setSedi] = useState<Sede[]>([]);
  const [contatti, setContatti] = useState<Contatto[]>([]);
  const [tipiFornitore, setTipiFornitore] = useState({
    mezzi: false,
    ricambi: false,
    servizi: false,
    trasporti: false,
    sconto: null as number | null,
    tariffa_oraria: null as number | null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnagraficaData();
  }, [anagraficaId]);

  async function fetchAnagraficaData() {
    try {
      setLoading(true);

      // Fetch anagrafica base
      const { data: anagraficaData, error: anagraficaError } = await supabase
        .from("Anagrafiche")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .single();

      if (anagraficaError) throw anagraficaError;
      setAnagrafica(anagraficaData);

      // Fetch dati amministrativi
      const { data: datiAmm } = await supabase
        .from("an_dati_amministrativi")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .maybeSingle();

      setDatiAmministrativi(datiAmm);

      // Fetch sedi
      const { data: sediData } = await supabase
        .from("Sedi")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .eq("is_cancellato", false);

      setSedi(sediData || []);

      // Fetch contatti
      const { data: contattiData } = await supabase
        .from("an_contatti")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .eq("is_cancellato", false);

      setContatti(contattiData || []);

      // Fetch tipi fornitore
      if (anagraficaData.is_fornitore) {
        const [mezzi, ricambi, servizi, trasporti] = await Promise.all([
          supabase.from("frn_mezzi").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
          supabase.from("frn_ricambi").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
          supabase.from("frn_servizi").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
          supabase.from("frn_trasporti").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
        ]);

        setTipiFornitore({
          mezzi: !!mezzi.data,
          ricambi: !!ricambi.data,
          servizi: !!servizi.data,
          trasporti: !!trasporti.data,
          sconto: ricambi.data?.sconto || null,
          tariffa_oraria: servizi.data?.tariffa_oraria || null,
        });
      }
    } catch (error) {
      console.error("Error fetching anagrafica:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DraggableWindow
        open={true}
        onClose={onClose}
        title="Caricamento..."
        width="wide"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </DraggableWindow>
    );
  }

  if (!anagrafica) {
    return (
      <DraggableWindow
        open={true}
        onClose={onClose}
        title="Errore"
      >
        <p>Anagrafica non trovata</p>
      </DraggableWindow>
    );
  }

  return (
    <DraggableWindow
      open={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <span>{anagrafica.ragione_sociale}</span>
        </div>
      }
      width="wide"
    >
      <div className="space-y-6">
        {/* Dati Anagrafica */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Dati Anagrafica</h3>
            </div >
            <EditAnagraficaDialog
              anagraficaId={anagraficaId}
              onSuccess={fetchAnagraficaData}
            />
          </div >
          <div className="grid grid-cols-2 gap-4 text-sm">
            {anagrafica.partita_iva && (
              <div>
                <span className="text-muted-foreground">Partita IVA:</span>
                <p className="font-medium">{anagrafica.partita_iva}</p>
              </div>
            )}
            {datiAmministrativi?.prezzo_manodopera && (
              <div>
                <span className="text-muted-foreground">Prezzo Manodopera:</span>
                <p className="font-medium">€ {datiAmministrativi.prezzo_manodopera}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            {anagrafica.is_cliente && <Badge variant="secondary">Cliente</Badge>}
            {anagrafica.is_fornitore && <Badge variant="secondary">Fornitore</Badge>}
            {anagrafica.is_owner && <Badge variant="secondary">Owner</Badge>}
          </div>
        </section >

        {/* Tipi Fornitore */}
        {
          anagrafica.is_fornitore && (tipiFornitore.mezzi || tipiFornitore.ricambi || tipiFornitore.servizi || tipiFornitore.trasporti) && (
            <>
              <Separator />
              <section>
                <h3 className="text-lg font-semibold mb-4">Tipologie Fornitore</h3>
                <div className="flex flex-wrap gap-2">
                  {tipiFornitore.mezzi && <Badge>Mezzi</Badge>}
                  {tipiFornitore.ricambi && <Badge>Ricambi</Badge>}
                  {tipiFornitore.servizi && <Badge>Servizi</Badge>}
                  {tipiFornitore.trasporti && <Badge>Trasporti</Badge>}
                </div>
                {tipiFornitore.sconto && (
                  <p className="text-sm mt-2"><span className="text-muted-foreground">Sconto:</span> {tipiFornitore.sconto}%</p>
                )}
                {tipiFornitore.tariffa_oraria && (
                  <p className="text-sm mt-2"><span className="text-muted-foreground">Tariffa Oraria:</span> € {tipiFornitore.tariffa_oraria}</p>
                )}
              </section>
            </>
          )
        }

        {/* Sedi */}
        <Separator />
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Sedi</h3>
            </div>
            <EditSediDialog
              anagraficaId={anagraficaId}
              onSuccess={fetchAnagraficaData}
            />
          </div>
          {sedi.length > 0 ? (
            <div className="space-y-3">
              {sedi.map((sede) => (
                <div key={sede.id_sede} className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium">{sede.nome_sede}</p>
                  {sede.indirizzo && (
                    <p className="text-sm text-muted-foreground">
                      {sede.indirizzo}, {sede.citta} ({sede.provincia}) - {sede.cap}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {sede.is_legale && <Badge variant="outline" className="text-xs">Legale</Badge>}
                    {sede.is_operativa && <Badge variant="outline" className="text-xs">Operativa</Badge>}
                    {sede.is_nave && <Badge variant="outline" className="text-xs">Nave</Badge>}
                    {sede.is_banchina && <Badge variant="outline" className="text-xs">Banchina</Badge>}
                    {sede.is_officina && <Badge variant="outline" className="text-xs">Officina</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nessuna sede registrata</p>
          )}
        </section>

        {/* Contatti */}
        <Separator />
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Contatti</h3>
            </div>
            <EditContattiDialog
              anagraficaId={anagraficaId}
              onSuccess={fetchAnagraficaData}
            />
          </div>
          {contatti.length > 0 ? (
            <div className="space-y-3">
              {contatti.map((contatto) => (
                <div key={contatto.id_contatto} className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium">{contatto.nome}</p>
                  {contatto.email && <p className="text-sm text-muted-foreground">{contatto.email}</p>}
                  {contatto.telefono && <p className="text-sm text-muted-foreground">{contatto.telefono}</p>}
                  <div className="flex gap-2 mt-2">
                    {contatto.is_aziendale && <Badge variant="outline" className="text-xs">Aziendale</Badge>}
                    {contatto.is_referente && <Badge variant="outline" className="text-xs">Referente</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nessun contatto registrato</p>
          )}
        </section>

        {/* Dati Amministrativi */}
        <Separator />
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Dati Amministrativi</h3>
            </div>
            <EditDatiAmministrativiDialog
              anagraficaId={anagraficaId}
              onSuccess={fetchAnagraficaData}
            />
          </div>
          {datiAmministrativi ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {datiAmministrativi.pec && (
                <div>
                  <span className="text-muted-foreground">PEC:</span>
                  <p className="font-medium">{datiAmministrativi.pec}</p>
                </div>
              )}
              {datiAmministrativi.codice_univoco && (
                <div>
                  <span className="text-muted-foreground">Codice Univoco:</span>
                  <p className="font-medium">{datiAmministrativi.codice_univoco}</p>
                </div>
              )}
              {datiAmministrativi.iban && (
                <div>
                  <span className="text-muted-foreground">IBAN:</span>
                  <p className="font-medium">{datiAmministrativi.iban}</p>
                </div>
              )}
              {datiAmministrativi.pagamento && (
                <div>
                  <span className="text-muted-foreground">Pagamento:</span>
                  <p className="font-medium">{datiAmministrativi.pagamento}</p>
                </div>
              )}
              {datiAmministrativi.partita_iva_estera && (
                <div>
                  <span className="text-muted-foreground">P.IVA Estera:</span>
                  <p className="font-medium">{datiAmministrativi.partita_iva_estera}</p>
                </div>
              )}
              {datiAmministrativi.esente_iva && (
                <div>
                  <Badge variant="secondary">Esente IVA</Badge>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nessun dato amministrativo registrato</p>
          )}
        </section>
      </div >
    </DraggableWindow >
  );
}
