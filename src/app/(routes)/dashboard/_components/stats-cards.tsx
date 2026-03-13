import {
  CalendarDays,
  Clock,
  HelpCircle,
  Hourglass,
  TicketX,
  Timer,
  UserPlus2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsCardsProps {
  totalAppointments: number;
  totalClients: number;
  totalCanceledTickets: number;
  averageTreatmentDuration: number;
  averageWaitingTimeMinutes: number;
  averageTotalWaitingTimeMinutes: number;
}

const TOOLTIPS = {
  averageTreatmentDuration:
    "Média do tempo entre o chamado do ticket e o encerramento do atendimento (tempo em que o consumidor ficou no guichê). Considerados apenas atendimentos do período com data de chamado e de finalização.",
  averageWaitingTime:
    "Média do tempo entre a criação do ticket e o início do atendimento (tempo de espera na fila até ser chamado). Considerados todos os atendimentos iniciados no período.",
  averageTotalWaitingTime:
    "Média do tempo total entre a criação do ticket e o encerramento do atendimento (espera na fila + tempo no guichê). Considerados apenas atendimentos finalizados no período.",
} as const;

const StatsCards = ({
  totalAppointments,
  totalClients,
  totalCanceledTickets,
  averageTreatmentDuration,
  averageWaitingTimeMinutes,
  averageTotalWaitingTimeMinutes,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Consumidores cadastrados",
      description: "Total de consumidores cadastrados no período.",
      value: totalClients.toString(),
      icon: UserPlus2,
      tooltipKey: null as keyof typeof TOOLTIPS | null,
    },
    {
      title: "Atendimentos realizados",
      description: "Total de atendimentos realizados no período.",
      value: totalAppointments.toString(),
      icon: CalendarDays,
      tooltipKey: null as keyof typeof TOOLTIPS | null,
    },
    {
      title: "Tickets cancelados",
      description: "Total de tickets cancelados no período.",
      value: totalCanceledTickets.toString(),
      icon: TicketX,
      tooltipKey: null as keyof typeof TOOLTIPS | null,
    },
    {
      title: "Tempo de atendimento",
      description: "Média de tempo de duração do atendimento.",
      value: `${averageTreatmentDuration} min`,
      icon: Clock,
      tooltipKey: "averageTreatmentDuration" as const,
    },
    {
      title: "Tempo de espera",
      description: "Média de tempo de espera na fila.",
      value: `${averageWaitingTimeMinutes} min`,
      icon: Hourglass,
      tooltipKey: "averageWaitingTime" as const,
    },
    {
      title: "Tempo total de espera",
      description: "Média de tempo total de espera na fila e no guichê.",
      value: `${averageTotalWaitingTimeMinutes} min`,
      icon: Timer,
      tooltipKey: "averageTotalWaitingTime" as const,
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const tooltipText = stat.tooltipKey
          ? TOOLTIPS[stat.tooltipKey]
          : null;
        return (
          <Card key={stat.title} className="w-full gap-2">
            <CardHeader className="flex flex-row items-start gap-2 space-y-0 pb-2">
              <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-primary h-4 w-4" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                  <span>{stat.title}</span>
                  {tooltipText && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="inline-flex cursor-help shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label="Explicação do cálculo"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px]">
                        {tooltipText}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardTitle>
                {stat.description && (
                  <p className="text-muted-foreground text-xs">{stat.description}</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
