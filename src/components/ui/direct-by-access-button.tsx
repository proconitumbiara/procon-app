import { UserIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "./button";

const DirectByAccessButton = () => {
    return (
        <div className="flex gap-2 justify-center items-center">
            <Link href="/collaborators-authentication">
                <Button>
                    <UserIcon className="w-4 h-4" />
                    Entrar como colaborador
                </Button>
            </Link>
            <Link href="/admin-authentication">
                <Button>
                    <UserIcon className="w-4 h-4" />
                    Entrar como administrador
                </Button>
            </Link>
        </div>
    );
}

export default DirectByAccessButton;