import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, FileText, Clock, ListChecks } from "lucide-react";

export default function NoleggiLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine current tab based on path
    const currentTab = location.pathname.split("/").pop() || "attivi";
    // If we are at /noleggi/ (root of layout), default to attivi in UI but router should redirect
    const activeValue = location.pathname.includes("preventivi") ? "preventivi"
        : location.pathname.includes("disponibili") ? "disponibili"
            : location.pathname.includes("storico") ? "storico"
                : "attivi";

    const handleTabChange = (value: string) => {
        switch (value) {
            case "attivi":
                navigate("/noleggi/attivi");
                break;
            case "preventivi":
                navigate("/noleggi/preventivi");
                break;
            case "disponibili":
                navigate("/noleggi/disponibili");
                break;
            case "storico":
                navigate("/noleggi/storico");
                break;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="border-b bg-card">
                <div className="container py-4">
                    <Tabs value={activeValue} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                            <TabsTrigger value="attivi" className="flex items-center gap-2">
                                <ListChecks className="h-4 w-4" />
                                Noleggi Attivi
                            </TabsTrigger>
                            <TabsTrigger value="preventivi" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Preventivi
                            </TabsTrigger>
                            <TabsTrigger value="disponibili" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Mezzi Disponibili
                            </TabsTrigger>
                            <TabsTrigger value="storico" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Storico
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
            <div className="flex-1 bg-background">
                <Outlet />
            </div>
        </div>
    );
}
