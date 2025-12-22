import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, FileDown } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { LavorazioneForm } from "@/components/interventi/lavorazione_form";

interface ProdottoLavorazione {
  id_lav_prod: string;
  id_prodotto: string;
  n_prodotto_uscita_prevista: number | null;
  costo_prodotto_lavorazione: number | null;
  prezzo_prodotto_lavorazione: number | null;
  Prodotti: {
    nome: string | null;
    codice: string | null;
  };
}

interface Lavorazione {
  id_lavorazione: string;
  nome_lavorazione: string | null;
  descrizione_lavorazione: string | null;
  data_da_prevista: string | null;
  data_a_prevista: string | null;
  durata_prevista: string | null;
  n_tecnici_previsti: number | null;
  prezzo_lavorazione: number | null;
  prodotti?: ProdottoLavorazione[];
}

interface Intervento {
  codice_intervento: string;
  descrizione_intervento: string | null;
  id_anagrafica: string | null;
  Mezzi: {
    marca: string | null;
    modello: string | null;
    matricola: string | null;
    id_interno: string | null;
    ubicazione: string | null;
  };
}

interface Anagrafica {
  ragione_sociale: string;
  partita_iva: string | null;
}

interface Preventivo {
  id_preventivo: string;
  nome_preventivo: string | null;
  created_at: string;
}

const ModificaIntervento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [intervento, setIntervento] = useState<Intervento | null>(null);
  const [anagrafica, setAnagrafica] = useState<Anagrafica | null>(null);
  const [descrizioneIntervento, setDescrizioneIntervento] = useState("");
  const [lavorazioni, setLavorazioni] = useState<Lavorazione[]>([]);
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [prezzoManodopera, setPrezzoManodopera] = useState<number>(0);
  const [mostraNuovaLavorazione, setMostraNuovaLavorazione] = useState(false);

  useEffect(() => {
    if (id) {
      loadIntervento();
    }
  }, [id]);

  // Real-time subscription per aggiornamenti lavorazioni
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('lavorazioni-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'int_lavorazioni',
          filter: `id_intervento=eq.${id}`
        },
        () => {
          loadIntervento();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'int_lav_prod'
        },
        () => {
          loadIntervento();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const loadIntervento = async () => {
    setLoading(true);
    
    // Carica intervento
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
      .eq("id_intervento", id)
      .single();

    if (interventoError) {
      toast.error("Errore nel caricamento dell'intervento");
      console.error(interventoError);
      setLoading(false);
      return;
    }

    setIntervento(interventoData);
    setDescrizioneIntervento(interventoData.descrizione_intervento || "");

    // Carica anagrafica
    if (interventoData.id_anagrafica) {
      const { data: anagraficaData } = await supabase
        .from("Anagrafiche")
        .select("ragione_sociale, partita_iva")
        .eq("id_anagrafica", interventoData.id_anagrafica)
        .single();

      setAnagrafica(anagraficaData);

      // Carica prezzo manodopera
      const { data: datiAmm } = await supabase
        .from("an_dati_amministrativi")
        .select("prezzo_manodopera")
        .eq("id_anagrafica", interventoData.id_anagrafica)
        .single();

      setPrezzoManodopera(datiAmm?.prezzo_manodopera || 0);
    }

    // Carica lavorazioni con prodotti
    const { data: lavorazioniData } = await supabase
      .from("int_lavorazioni")
      .select(`
        *,
        int_lav_prod!left (
          id_lav_prod,
          id_prodotto,
          n_prodotto_uscita_prevista,
          costo_prodotto_lavorazione,
          prezzo_prodotto_lavorazione,
          Prodotti!inner (
            nome,
            codice
          )
        )
      `)
      .eq("id_intervento", id)
      .eq("is_cancellato", false)
      .order("created_at", { ascending: true });

    // Transform data to include prodotti array
    const lavorazioniWithProdotti = (lavorazioniData || []).map((lav: any) => ({
      ...lav,
      prodotti: lav.int_lav_prod || []
    }));

    setLavorazioni(lavorazioniWithProdotti);

    // Carica preventivi
    const { data: preventiviData } = await supabase
      .from("prev_interventi")
      .select(`
        Preventivi!inner (
          id_preventivo,
          created_at
        ),
        nome_preventivo
      `)
      .eq("id_intervento", id)
      .order("created_at", { ascending: false });

    if (preventiviData) {
      setPreventivi(preventiviData.map((p: any) => ({
        id_preventivo: p.Preventivi.id_preventivo,
        nome_preventivo: p.nome_preventivo,
        created_at: p.Preventivi.created_at
      })));
    }

    setLoading(false);
  };


  const eliminaLavorazione = async (idLavorazione: string) => {
    const { error } = await supabase
      .from("int_lavorazioni")
      .update({ is_cancellato: true })
      .eq("id_lavorazione", idLavorazione);

    if (error) {
      toast.error("Errore nell'eliminazione della lavorazione");
      return;
    }

    toast.success("Lavorazione eliminata");
  };

  const calcolaTotaleLavorazione = (lav: Lavorazione) => {
    const prezzoManodopera = lav.prezzo_lavorazione || 0;
    const prezzoProdotti = (lav.prodotti || []).reduce(
      (sum, prod) => sum + (prod.prezzo_prodotto_lavorazione || 0) * (prod.n_prodotto_uscita_prevista || 0),
      0
    );
    return prezzoManodopera + prezzoProdotti;
  };

  const calcolaTotalePreventivo = () => {
    return lavorazioni.reduce((sum, lav) => sum + calcolaTotaleLavorazione(lav), 0);
  };

  const handleSalva = async () => {
    setSaving(true);

    // Aggiorna descrizione intervento e imposta stato_intervento 'aperto'
    const { error: updateError } = await supabase
      .from("Interventi")
      .update({ 
        descrizione_intervento: descrizioneIntervento,
        stato_intervento: 'aperto'
      })
      .eq("id_intervento", id);

    if (updateError) {
      toast.error("Errore nel salvataggio");
      setSaving(false);
      return;
    }

    toast.success("Intervento salvato con stato 'aperto'");
    setSaving(false);
    loadIntervento();
  };

  const handleCreaPreventivo = async () => {
    setSaving(true);

    // Crea nuovo preventivo
    const { data: nuovoPreventivo, error: prevError } = await supabase
      .from("Preventivi")
      .insert({
        id_anagrafica: intervento?.id_anagrafica
      })
      .select()
      .single();

    if (prevError || !nuovoPreventivo) {
      toast.error("Errore nella creazione del preventivo");
      setSaving(false);
      return;
    }

    const { error: prevIntError } = await supabase
      .from("prev_interventi")
      .insert({
        id_preventivo: nuovoPreventivo.id_preventivo,
        id_intervento: id,
        nome_preventivo: `Preventivo ${intervento?.codice_intervento}`,
        stato_preventivo: "bozza"
      });

    if (prevIntError) {
      toast.error("Errore nel collegamento del preventivo");
      setSaving(false);
      return;
    }

    // Aggiorna lo stato dell'intervento
    await supabase
      .from("Interventi")
      .update({ stato_preventivo: 'bozza', stato_intervento: 'preventivazione' })
      .eq("id_intervento", id);

    toast.success("Preventivo creato con successo");
    setSaving(false);
    loadIntervento();
  };

  const PreventivoDocument = ({ preventivo }: { preventivo: Preventivo }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>PREVENTIVO</Text>
          <Text style={styles.subtitle}>{preventivo.nome_preventivo}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text>Ragione Sociale: {anagrafica?.ragione_sociale}</Text>
          <Text>P.IVA: {anagrafica?.partita_iva}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mezzo</Text>
          <Text>Marca/Modello: {intervento?.Mezzi.marca} {intervento?.Mezzi.modello}</Text>
          <Text>Matricola: {intervento?.Mezzi.matricola}</Text>
          <Text>ID Interno: {intervento?.Mezzi.id_interno}</Text>
          <Text>Ubicazione: {intervento?.Mezzi.ubicazione || "N/D"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lavorazioni</Text>
          {lavorazioni.map((lav, index) => (
            <View key={lav.id_lavorazione} style={styles.lavorazione}>
              <Text style={styles.lavNome}>{index + 1}. {lav.nome_lavorazione}</Text>
              <Text>Descrizione: {lav.descrizione_lavorazione || "N/D"}</Text>
              <Text>Periodo: {lav.data_da_prevista || "N/D"} - {lav.data_a_prevista || "N/D"}</Text>
              <Text>Durata: {lav.durata_prevista || "N/D"} ore</Text>
              <Text>Tecnici: {lav.n_tecnici_previsti || "N/D"}</Text>
              <Text>Prezzo: €{lav.prezzo_lavorazione?.toFixed(2) || "0.00"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totale}>
          <Text style={styles.totaleText}>
            Totale: €{lavorazioni.reduce((sum, lav) => sum + (lav.prezzo_lavorazione || 0), 0).toFixed(2)}
          </Text>
        </View>
      </Page>
    </Document>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/preventivi-assistenza")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Preventivi
          </Button>
          <h1 className="text-2xl font-bold mt-2">
            Modifica Intervento {intervento?.codice_intervento}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna sinistra - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dati intervento */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Dati Intervento</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Codice Intervento</Label>
                  <Input value={intervento?.codice_intervento} disabled />
                </div>

                <div>
                  <Label>Descrizione Intervento</Label>
                  <Textarea
                    value={descrizioneIntervento}
                    onChange={(e) => setDescrizioneIntervento(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Lavorazioni */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Lavorazioni</h2>

              {/* Lavorazioni esistenti */}
              <div className="space-y-4 mb-6">
                {lavorazioni.map((lav) => (
                  <LavorazioneForm
                    key={lav.id_lavorazione}
                    idIntervento={id!}
                    lavorazione={lav}
                    prezzoManodopera={prezzoManodopera}
                    onSuccess={loadIntervento}
                    onDelete={eliminaLavorazione}
                  />
                ))}
              </div>

              {/* Nuova lavorazione */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Aggiungi Nuova Lavorazione</h3>
                  <Button
                    onClick={() => setMostraNuovaLavorazione(!mostraNuovaLavorazione)}
                    variant={mostraNuovaLavorazione ? "outline" : "default"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {mostraNuovaLavorazione ? "Annulla" : "Nuova Lavorazione"}
                  </Button>
                </div>

                {mostraNuovaLavorazione && (
                  <LavorazioneForm
                    idIntervento={id!}
                    lavorazione={null}
                    prezzoManodopera={prezzoManodopera}
                    onSuccess={() => {
                      setMostraNuovaLavorazione(false);
                      loadIntervento();
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Pulsanti separati */}
            <div className="flex gap-3">
              <Button onClick={handleSalva} disabled={saving} className="flex-1" size="lg" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvataggio..." : "Salva Intervento"}
              </Button>
              <Button onClick={handleCreaPreventivo} disabled={saving} className="flex-1" size="lg">
                <FileDown className="h-4 w-4 mr-2" />
                {saving ? "Creazione..." : "Crea Preventivo"}
              </Button>
            </div>
          </div>

          {/* Colonna destra - 1/3 */}
          <div className="space-y-6">
            {/* Recap Preventivo in Tempo Reale */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Riepilogo Preventivo</h2>
              
              <div className="space-y-4">
                {/* Dati Cliente */}
                <div className="border-b pb-3">
                  <h3 className="font-semibold text-sm mb-1">Cliente</h3>
                  <p className="text-sm">{anagrafica?.ragione_sociale}</p>
                  <p className="text-xs text-muted-foreground">P.IVA: {anagrafica?.partita_iva}</p>
                </div>

                {/* Dati Mezzo */}
                <div className="border-b pb-3">
                  <h3 className="font-semibold text-sm mb-1">Mezzo</h3>
                  <p className="text-sm">{intervento?.Mezzi.marca} {intervento?.Mezzi.modello}</p>
                  <p className="text-xs text-muted-foreground">
                    Matricola: {intervento?.Mezzi.matricola}
                  </p>
                </div>

                {/* Lavorazioni */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Lavorazioni</h3>
                  {lavorazioni.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nessuna lavorazione presente
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {lavorazioni.map((lav, index) => (
                        <div key={lav.id_lavorazione} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">
                              {index + 1}. {lav.nome_lavorazione}
                            </p>
                          </div>
                          
                          <div className="text-xs space-y-1 text-muted-foreground">
                            <p>Periodo: {lav.data_da_prevista || "N/D"} - {lav.data_a_prevista || "N/D"}</p>
                            <p>Ore: {lav.durata_prevista || "N/D"} | Tecnici: {lav.n_tecnici_previsti || "N/D"}</p>
                            <p className="font-semibold text-foreground">
                              Manodopera: €{lav.prezzo_lavorazione?.toFixed(2) || "0.00"}
                            </p>
                          </div>

                          {/* Prodotti */}
                          {lav.prodotti && lav.prodotti.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-xs font-semibold mb-1">Prodotti:</p>
                              {lav.prodotti.map((prod) => (
                                <div key={prod.id_lav_prod} className="flex justify-between text-xs">
                                  <span>
                                    {prod.Prodotti.nome} x{prod.n_prodotto_uscita_prevista}
                                  </span>
                                  <span className="font-medium">
                                    €{((prod.prezzo_prodotto_lavorazione || 0) * (prod.n_prodotto_uscita_prevista || 0)).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t border-border/50 text-right">
                            <p className="text-sm font-bold">
                              Totale: €{calcolaTotaleLavorazione(lav).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totale Generale */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">TOTALE PREVENTIVO</span>
                    <span className="font-bold text-lg">
                      €{calcolaTotalePreventivo().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Gestione PDF Preventivi */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Preventivi Generati</h2>
              
              {preventivi.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm font-medium">{preventivi[0].nome_preventivo}</p>
                    <p className="text-xs text-muted-foreground">
                      Creato: {new Date(preventivi[0].created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>

                  <PDFDownloadLink
                    document={<PreventivoDocument preventivo={preventivi[0]} />}
                    fileName={`${preventivi[0].nome_preventivo}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button className="w-full" disabled={pdfLoading}>
                        <FileDown className="h-4 w-4 mr-2" />
                        {pdfLoading ? "Generazione..." : "Scarica PDF Attuale"}
                      </Button>
                    )}
                  </PDFDownloadLink>

                  {/* Storico preventivi */}
                  {preventivi.length > 1 && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="font-semibold text-sm mb-2">Versioni Precedenti</h3>
                      <div className="space-y-2">
                        {preventivi.slice(1).map((prev) => (
                          <div key={prev.id_preventivo} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                            <div>
                              <p className="font-medium text-xs">{prev.nome_preventivo}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(prev.created_at).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                            <PDFDownloadLink
                              document={<PreventivoDocument preventivo={prev} />}
                              fileName={`${prev.nome_preventivo}.pdf`}
                            >
                              <Button variant="ghost" size="sm">
                                <FileDown className="h-3 w-3" />
                              </Button>
                            </PDFDownloadLink>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nessun preventivo generato. Salva l'intervento per creare il primo preventivo.
                </p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: "1pt solid black",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  lavorazione: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  lavNome: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  totale: {
    marginTop: 20,
    borderTop: "1pt solid black",
    paddingTop: 10,
    alignItems: "flex-end",
  },
  totaleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ModificaIntervento;
