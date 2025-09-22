"use client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks"
import { useState } from "react";
import { toast } from "sonner";

import { deleteSector } from "@/actions/delete-sector";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { sectorsTable, servicePointsTable } from "@/db/schema";

import ServicePointCard from "./service-point-cards";
import UpsertSectorForm from "./upsert-sector-form";
import UpsertServicePointForm from "./upsert-service-point-form";

interface SectorsGridProps {
    sectors: (typeof sectorsTable.$inferSelect & {
        servicePoints: typeof servicePointsTable.$inferSelect[]
    })[]
}

const SectorsGrid = ({ sectors }: SectorsGridProps) => {
    const [openSectorForm, setOpenSectorForm] = useState<string | null>(null);
    const [openServicePointForm, setOpenServicePointForm] = useState<string | null>(null);

    // Hook deve ser chamado no topo do componente!
    const deleteSectorAction = useAction(deleteSector, {
        onSuccess: () => {
            toast.success("Setor deletado com sucesso!");
        },
        onError: () => {
            toast.error(`Erro ao deletar setor.`);
        },
    });

    const handleDeleteSector = (sectorId: string) => {
        if (!sectorId) {
            toast.error("Setor não encontrado.");
            return;
        }
        deleteSectorAction.execute({ id: sectorId });
    };

    return (
        <div className="overflow-x-auto w-full">
            <div className="flex flex-wrap gap-6 w-full">
                {sectors.map((sector) => (
                    <div key={sector.id} className="bg-card border rounded-lg flex flex-col min-w-[280px] w-full">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-base font-semibold">{sector.name}</h3>
                            <div className="flex gap-2">
                                <Dialog
                                    open={openSectorForm === sector.id}
                                    onOpenChange={(open) => setOpenSectorForm(open ? sector.id : null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" className="w-auto">
                                            <Pencil className="h-4 w-4 cursor-pointer" />
                                        </Button>
                                    </DialogTrigger>
                                    <UpsertSectorForm sector={{ ...sector }} onSuccess={() => setOpenSectorForm(null)} />
                                </Dialog>
                                <Dialog
                                    open={openServicePointForm === sector.id}
                                    onOpenChange={(open) => setOpenServicePointForm(open ? sector.id : null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-auto">
                                            <Plus className="h-4 w-4 cursor-pointer" />
                                        </Button>
                                    </DialogTrigger>
                                    <UpsertServicePointForm servicePoint={{ sectorId: sector.id }} onSuccess={() => setOpenServicePointForm(null)} />
                                </Dialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="w-auto">
                                            <Trash2 className="h-4 w-4 cursor-pointer" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza que deseja deletar esse setor?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Essa ação não pode ser desfeita. Todos os dados relacionados a esse setor serão perdidos permanentemente.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteSector(sector.id)}>Deletar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex-1 flex flex-col p-4 gap-2">
                            <h4 className="text-base font-semibold">Pontos de atendimento em {sector.name}</h4>
                            <div className="grid grid-cols-5 gap-6">
                                {sector.servicePoints.map(servicePoint => (
                                    <ServicePointCard
                                        key={servicePoint.id}
                                        servicePoint={servicePoint}
                                        sectors={sectors}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SectorsGrid;