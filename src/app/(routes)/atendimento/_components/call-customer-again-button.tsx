"use client";

import { Volume2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { callTheCustomerAgain } from "@/actions/call-the-customer-again";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import EndServiceForm from "./end-service-form";

interface CallCustomerAgainButtonProps {
  ticket: { id: string };
  treatment: { id: string };
}

const CallCustomerAgainButton = ({
  ticket,
  treatment,
}: CallCustomerAgainButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, setError] = useState<string | null>(null);

  const { execute, status } = useAction(callTheCustomerAgain, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error);
        setError(result.data.error);
        return;
      }
      toast.success("Consumidor chamado novamente com sucesso!");
      setError(null);
    },
    onError: (error) => {
      const msg =
        error.error?.serverError || "Erro ao chamar o consumidor novamente";
      toast.error(msg);
      setError(msg);
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={status === "executing"}
          onClick={() => execute()}
        >
          <Volume2 className="mr-2 h-4 w-4" />
          {status === "executing" ? "Chamando..." : "Chamar novamente"}
        </Button>
      </DialogTrigger>
      <EndServiceForm
        ticket={ticket}
        treatment={treatment}
        onSuccess={() => setIsDialogOpen(false)}
      />
    </Dialog>
  );
};

export default CallCustomerAgainButton;
