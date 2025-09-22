import { eq } from "drizzle-orm";
import { Headset, Smile, UserRoundCog } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const Home = async () => {

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/");
    }

    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, session.user.id),
    });

    if (user?.role === "administrator") {
        redirect("/users/dashboard");
    }
    if (user?.role === "professional") {
        redirect("/users/professionals-services");
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 mt-10">
            <Image src="/LogoProcon.svg" alt="Procon Logo" width={500} height={0} />
            <div className="flex flex-col w-full h-full gap-4">
                <div className="flex flex-col items-center justify-center gap-2">
                    <h1 className="text-2xl font-bold text-secondary-foreground">Seja bem vindo ao sistema de atendimento do Procon Itumbiara</h1>
                    <p className="text-md text-secondary-foreground">Escolha uma das opções abaixo para continuar</p>
                </div>
                <div className="grid grid-cols-3 w-full h-auto gap-4 px-4">
                    <a href="/users/dashboard">
                        <Button className="w-full h-[100px] flex items-center justify-center gap-2 text-lg" variant="outline">
                            <UserRoundCog />
                            Sou administrador
                        </Button>
                    </a>
                    <a href="/users/clients">
                        <Button className="w-full h-[100px] flex items-center justify-center gap-2 text-lg" variant="outline">
                            <Smile />
                            Sou recepcionista
                        </Button>
                    </a>
                    <a href="/users/professionals-services">
                        <Button className="w-full h-[100px] flex items-center justify-center gap-2 text-lg" variant="outline">
                            <Headset />
                            Sou sou atendente
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Home;