"use client";
import { Briefcase, IdCard, Lock, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks"
import { useState } from "react";
import { toast } from "sonner";

import { deleteUser } from "@/actions/users/delete-user";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { usersTable } from "@/db/schema";

import UpdateUserForm from "./update-user-form";

interface UserCardProps {
    user: typeof usersTable.$inferSelect
}

const UserCard = ({ user }: UserCardProps) => {

    const [isUpsertPRofessionalFormOpen, setIsUpsertProfessionalFormOpen] = useState(false);

    const professionalInitials = (user.name as string)
        .split(" ")
        .map((name: string) => name[0])
        .join("");

    const deleteUserAction = useAction(deleteUser, {
        onSuccess: () => {
            toast.success("Usuário deletado com sucesso!");
        },
        onError: () => {
            toast.error(`Erro ao deletar usuário.`);
        },
    });

    const handleDeleteUser = () => {
        if (!user?.id) {
            toast.error("Usuário não encontrado.");
            return;
        }
        deleteUserAction.execute({ id: user?.id || "" });
        setIsUpsertProfessionalFormOpen(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 relative">
                        <AvatarFallback>{professionalInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-sm font-medium">{user.name}</h3>
                    </div>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-2">
                <Badge variant="outline">
                    <Briefcase className="mr-1" />
                    Contato: {user.phoneNumber?.replace(/^(\d{2})(\d{1})?(\d{4})(\d{4})$/, "($1) $2 $3-$4")}
                </Badge>
                <Badge variant="outline">
                    <IdCard className="mr-1" />
                    CPF: {user.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                </Badge>
                <Badge variant="outline">
                    <Lock className="mr-1" />
                    Acesso: {user.role === "admin" ? "Administrador" : "Profissional"}
                </Badge>

            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col gap-2">
                <Dialog
                    open={isUpsertPRofessionalFormOpen}
                    onOpenChange={setIsUpsertProfessionalFormOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar profissional
                        </Button>
                    </DialogTrigger>
                    <UpdateUserForm user={user} onSuccess={() => setIsUpsertProfessionalFormOpen(false)} />
                </Dialog>

                {user && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full hover:bg-red-500 hover:text-white">
                                <Trash2 />
                                Deletar profissional
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza que deseja deletar esse profissional?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Todos os dados relacionados a esse profissional serão perdidos permanentemente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteUser}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

            </CardFooter>
        </Card>
    );
}

export default UserCard;