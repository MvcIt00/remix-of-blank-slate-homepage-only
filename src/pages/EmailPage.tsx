import { EmailClientPage } from "@/components/email/EmailClientPage";
import { AIBriefingsMVP } from "@/components/ai/AIBriefingsMVP";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Mail } from "lucide-react";

export default function EmailPage() {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    // Fetch all active email accounts
    const { data: accounts = [] } = useQuery({
        queryKey: ["email-accounts"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("account_email" as any)
                .select("*")
                .eq("stato", "attivo");
            if (error) throw error;
            return data as any[];
        },
    });

    // Compute active account (selected or first available)
    const activeAccount = useMemo(() =>
        accounts.find(a => a.id === selectedAccountId) || accounts[0],
        [accounts, selectedAccountId]
    );

    // Auto-select first account on mount
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accounts, selectedAccountId]);

    return (
        <div className="p-6 space-y-4">
            {/* Header with Account Selector */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Posta Elettronica</h1>

                {/* Account Switcher (show if multiple accounts) */}
                {accounts.length > 1 && activeAccount && (
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedAccountId || ""} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="w-64 h-9 text-sm">
                                <SelectValue placeholder="Seleziona account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id} className="text-sm">
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">{acc.label || acc.nome_account || acc.email}</span>
                                            <span className="text-xs opacity-60 text-muted-foreground">{acc.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <Tabs defaultValue="email-client" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="email-client">
                        📧 Email Classica
                    </TabsTrigger>
                    <TabsTrigger value="ai-briefings">
                        🤖 AI Briefings (BETA)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="email-client">
                    <EmailClientPage activeAccount={activeAccount} />
                </TabsContent>

                <TabsContent value="ai-briefings">
                    <AIBriefingsMVP activeAccount={activeAccount} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
