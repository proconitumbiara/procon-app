"use client";

import { ShieldClose } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Card } from "./card";

export const AccessDenied = () => {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push("/users/professionals-services");
        }, 3000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
            <Card className="w-full max-w-md p-6 space-y-4">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center justify-center gap-2">
                        <ShieldClose size={24} />
                        Acesso negado!
                    </h2>
                    <p className="text-muted-foreground">
                        Você não tem permissão para acessar esta página.
                    </p>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-primary transition-all duration-[3000ms] ease-linear w-0 animate-progress"
                        style={{ animationDuration: "3000ms" }}
                    />
                </div>
            </Card>
        </div>
    );
}; 