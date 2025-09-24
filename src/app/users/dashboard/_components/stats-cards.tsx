import { CalendarDays, Clock, Hourglass, TicketX, UserPlus2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  totalAppointments: number;
  totalClients: number;
  totalCanceledTickets: number;
  averageTreatmentDuration: number; // novo campo
  averageWaitingTimeMinutes: number; // novo campo
}

const StatsCards = ({
  totalAppointments,
  totalClients,
  totalCanceledTickets,
  averageTreatmentDuration,
  averageWaitingTimeMinutes,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Consumidores cadastrados",
      value: totalClients.toString(),
      icon: UserPlus2,
    },
    {
      title: "Atendimentos realizados",
      value: totalAppointments.toString(),
      icon: CalendarDays,
    },
    {
      title: "Tickets cancelados",
      value: totalCanceledTickets.toString(),
      icon: TicketX,
    },
    {
      title: "Média de tempo de atendimento",
      value: `${averageTreatmentDuration} min`,
      icon: Clock,
    },
    {
      title: "Média de tempo de espera",
      value: `${averageWaitingTimeMinutes} min`,
      icon: Hourglass,
    },
  ];

  return (
    <div className="flex w-full flex-row items-center justify-between gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="w-full gap-2">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                <Icon className="text-primary h-4 w-4" />
              </div>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.title}
              </CardTitle>
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
