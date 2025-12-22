import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface PreventivoData {
  preventivo: {
    id_preventivo: string;
    nome_preventivo: string;
    created_at: string;
  };
  anagrafica: {
    ragione_sociale: string;
    partita_iva: string | null;
  };
  mezzo: {
    marca: string | null;
    modello: string | null;
    matricola: string | null;
    id_interno: string | null;
    ubicazione: string | null;
  };
  intervento: {
    codice_intervento: string;
    descrizione_intervento: string | null;
  };
  lavorazioni: Array<{
    nome_lavorazione: string | null;
    descrizione_lavorazione: string | null;
    data_da_prevista: string | null;
    data_a_prevista: string | null;
    durata_prevista: string | null;
    n_tecnici_previsti: number | null;
  }>;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 120,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
    border: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: 1,
    borderBottomColor: '#ddd',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#eee',
    padding: 8,
  },
  tableCol: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
    borderTop: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
});

const PreventivoPDF = ({ data }: { data: PreventivoData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.preventivo.nome_preventivo}</Text>
        <Text style={styles.subtitle}>
          Data: {new Date(data.preventivo.created_at).toLocaleDateString('it-IT')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dati Cliente</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Ragione Sociale:</Text>
          <Text style={styles.value}>{data.anagrafica.ragione_sociale}</Text>
        </View>
        {data.anagrafica.partita_iva && (
          <View style={styles.row}>
            <Text style={styles.label}>Partita IVA:</Text>
            <Text style={styles.value}>{data.anagrafica.partita_iva}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dati Mezzo</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Codice Intervento:</Text>
          <Text style={styles.value}>{data.intervento.codice_intervento}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mezzo:</Text>
          <Text style={styles.value}>
            {data.mezzo.marca && data.mezzo.modello
              ? `${data.mezzo.marca} ${data.mezzo.modello}`
              : data.mezzo.marca || data.mezzo.modello || '-'}
          </Text>
        </View>
        {data.mezzo.matricola && (
          <View style={styles.row}>
            <Text style={styles.label}>Matricola:</Text>
            <Text style={styles.value}>{data.mezzo.matricola}</Text>
          </View>
        )}
        {data.mezzo.id_interno && (
          <View style={styles.row}>
            <Text style={styles.label}>ID Interno:</Text>
            <Text style={styles.value}>{data.mezzo.id_interno}</Text>
          </View>
        )}
        {data.mezzo.ubicazione && (
          <View style={styles.row}>
            <Text style={styles.label}>Ubicazione:</Text>
            <Text style={styles.value}>{data.mezzo.ubicazione}</Text>
          </View>
        )}
        {data.intervento.descrizione_intervento && (
          <View style={styles.row}>
            <Text style={styles.label}>Descrizione:</Text>
            <Text style={styles.value}>{data.intervento.descrizione_intervento}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lavorazioni Previste</Text>
        {data.lavorazioni.length > 0 ? (
          data.lavorazioni.map((lav, index) => (
            <View key={index} style={{ marginBottom: 15, paddingBottom: 10, borderBottom: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                {index + 1}. {lav.nome_lavorazione}
              </Text>
              {lav.descrizione_lavorazione && (
                <Text style={{ marginBottom: 5, color: '#666' }}>{lav.descrizione_lavorazione}</Text>
              )}
              <View style={{ flexDirection: 'row', fontSize: 9, color: '#666' }}>
                {lav.data_da_prevista && (
                  <Text style={{ marginRight: 15 }}>
                    Da: {new Date(lav.data_da_prevista).toLocaleDateString('it-IT')}
                  </Text>
                )}
                {lav.data_a_prevista && (
                  <Text style={{ marginRight: 15 }}>
                    A: {new Date(lav.data_a_prevista).toLocaleDateString('it-IT')}
                  </Text>
                )}
                {lav.durata_prevista && (
                  <Text style={{ marginRight: 15 }}>Durata: {lav.durata_prevista}</Text>
                )}
                {lav.n_tecnici_previsti && (
                  <Text>Tecnici: {lav.n_tecnici_previsti}</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: '#999' }}>Nessuna lavorazione prevista</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text>Preventivo generato il {new Date().toLocaleDateString('it-IT')}</Text>
      </View>
    </Page>
  </Document>
);

interface VisualizzaPreventivoDialogProps {
  interventoId: string;
}

export const VisualizzaPreventivoDialog = ({ interventoId }: VisualizzaPreventivoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preventivoData, setPreventivoData] = useState<PreventivoData | null>(null);

  useEffect(() => {
    if (open) {
      loadPreventivoData();
    }
  }, [open, interventoId]);

  const loadPreventivoData = async () => {
    setLoading(true);

    try {
      // 1. Carica dati preventivo
      const { data: prevInterventoData, error: prevError } = await supabase
        .from("prev_interventi")
        .select(`
          Preventivi!inner (
            id_preventivo,
            nome_preventivo:prev_interventi(nome_preventivo),
            created_at
          )
        `)
        .eq("id_intervento", interventoId)
        .single();

      if (prevError) throw prevError;

      // 2. Carica dati intervento e mezzo
      const { data: interventoData, error: interventoError } = await supabase
        .from("Interventi")
        .select(`
          codice_intervento,
          descrizione_intervento,
          id_anagrafica,
          Mezzi!inner (
            marca,
            modello,
            matricola,
            id_interno,
            ubicazione
          )
        `)
        .eq("id_intervento", interventoId)
        .single();

      if (interventoError) throw interventoError;

      // 3. Carica dati anagrafica
      const { data: anagraficaData, error: anagraficaError } = await supabase
        .from("Anagrafiche")
        .select("ragione_sociale, partita_iva")
        .eq("id_anagrafica", interventoData.id_anagrafica)
        .single();

      if (anagraficaError) throw anagraficaError;

      // 4. Carica lavorazioni
      const { data: lavorazioniData, error: lavorazioniError } = await supabase
        .from("int_lavorazioni")
        .select("nome_lavorazione, descrizione_lavorazione, data_da_prevista, data_a_prevista, durata_prevista, n_tecnici_previsti")
        .eq("id_intervento", interventoId)
        .eq("is_cancellato", false)
        .order("created_at", { ascending: true });

      if (lavorazioniError) throw lavorazioniError;

      // 5. Recupera il nome del preventivo
      const { data: nomePreventivo } = await supabase
        .from("prev_interventi")
        .select("nome_preventivo")
        .eq("id_intervento", interventoId)
        .single();

      setPreventivoData({
        preventivo: {
          id_preventivo: (prevInterventoData.Preventivi as any).id_preventivo,
          nome_preventivo: nomePreventivo?.nome_preventivo || "Preventivo",
          created_at: (prevInterventoData.Preventivi as any).created_at,
        },
        anagrafica: anagraficaData,
        mezzo: interventoData.Mezzi,
        intervento: {
          codice_intervento: interventoData.codice_intervento,
          descrizione_intervento: interventoData.descrizione_intervento,
        },
        lavorazioni: lavorazioniData || [],
      });
    } catch (error) {
      console.error("Errore caricamento preventivo:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati del preventivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FileText className="h-4 w-4 mr-1" />
          Visualizza Preventivo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preventivo PDF</DialogTitle>
          <DialogDescription>
            Visualizza e scarica il preventivo in formato PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento dati preventivo...
            </div>
          ) : preventivoData ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">{preventivoData.preventivo.nome_preventivo}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cliente: {preventivoData.anagrafica.ragione_sociale}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Mezzo: {preventivoData.mezzo.marca} {preventivoData.mezzo.modello} - {preventivoData.mezzo.matricola}
                </p>
                <p className="text-sm text-muted-foreground">
                  Lavorazioni: {preventivoData.lavorazioni.length}
                </p>
              </div>

              <PDFDownloadLink
                document={<PreventivoPDF data={preventivoData} />}
                fileName={`${preventivoData.preventivo.nome_preventivo.replace(/\s+/g, '_')}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button className="w-full" disabled={pdfLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    {pdfLoading ? "Generazione PDF..." : "Scarica PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nessun dato disponibile
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
