"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks"
import { useState } from "react";
import { toast } from "sonner";

import { deleteServicePoint } from "@/actions/delete-service-point";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { servicePointsTable } from "@/db/schema";

import UpsertServicePointForm from "./upsert-service-point-form";



interface ServicePointCardProps {
    servicePoint: typeof servicePointsTable.$inferSelect;
}

const ServicePointCard = ({ servicePoint }: ServicePointCardProps) => {

    const [isUpsertSectorFormOpen, setIsUpsertSectorFormOpen] = useState(false);

    const deleteServicePointAction = useAction(deleteServicePoint, {
        onSuccess: () => {
            toast.success("Ponto de atendimento deletado com sucesso!");
        },
        onError: () => {
            toast.error(`Erro ao deletar ponto de atendimento.`);
        },
    });

    const handleDeleteServicePoint = () => {
        if (!servicePoint?.id) {
            toast.error("Ponto de atendimento não encontrado.");
            return;
        }
        deleteServicePointAction.execute({ id: servicePoint?.id || "" });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium">{servicePoint.name}</h3>
                    {servicePoint.availability === "free" && (
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
                            Livre
                        </Badge>
                    )}
                    {servicePoint.availability === "operating" && (
                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                            Operando
                        </Badge>
                    )}
                    {servicePoint.availability === "paused" && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                            Pausado
                        </Badge>
                    )}
                    {(!["free", "operating", "paused"].includes(servicePoint.availability as string)) && (
                        <Badge className="text-xs bg-red-100 text-red-800 border-red-300">
                            Indisponível
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <Separator />
            <CardFooter className="flex items-center justify-end gap-2">
                <Dialog
                    open={isUpsertSectorFormOpen}
                    onOpenChange={setIsUpsertSectorFormOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default" className="w-auto">
                            <Pencil className="h-4 w-4 cursor-pointer" />
                            Editar
                        </Button>
                    </DialogTrigger>
                    <UpsertServicePointForm servicePoint={servicePoint} onSuccess={() => setIsUpsertSectorFormOpen(false)} />
                </Dialog>

                {servicePoint && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-auto">
                                <Trash2 className="h-4 w-4 cursor-pointer" />
                                Deletar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza que deseja deletar esse ponto de atendimento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Todos os dados relacionados a esse ponto de atendimento serão perdidos permanentemente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteServicePoint}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

            </CardFooter>
        </Card>
    );
}

export default ServicePointCard;