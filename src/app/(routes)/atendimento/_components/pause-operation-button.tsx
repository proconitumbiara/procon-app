"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pause } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { startPause } from "@/actions/pauses/start-pause";
import { PAUSE_REASONS } from "@/actions/pauses/start-pause/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  reason: z.enum(PAUSE_REASONS, {
    message: "Selecione o motivo da pausa",
  }),
});

interface PauseOperationButtonProps {
  disabled?: boolean;
}

const PauseOperationButton = ({ disabled }: PauseOperationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: undefined,
    },
  });

  const { execute, status } = useAction(startPause, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success("Pausa iniciada.");
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      const msg =
        error.error?.serverError ||
        error.error?.validationErrors?.reason?._errors?.[0] ||
        "Erro ao iniciar pausa";
      toast.error(msg);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    execute({ reason: values.reason });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline">
          <Pause className="h-4 w-4" />
          Pausar operação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Pausar operação</DialogTitle>
        <DialogDescription>Selecione o motivo da pausa.</DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={status === "executing"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAUSE_REASONS.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? "Realizando pausa..." : "Realizar pausa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PauseOperationButton;
