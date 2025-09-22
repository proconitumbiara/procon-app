import { CalendarDays, TicketX, UserPlus2, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  totalAppointments: number;
  totalClients: number;
  totalCanceledTickets: number;
  averageTreatmentDuration: number; // novo campo
}

const StatsCards = ({
  totalAppointments,
  totalClients,
  totalCanceledTickets,
  averageTreatmentDuration,
}: StatsCardsProps) => {
  const stats = [
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
      title: "Novos consumidores",
      value: totalClients.toString(),
      icon: UserPlus2,
    },
    {
      title: "Média de tempo de atendimento",
      value: `${averageTreatmentDuration} min`,
      icon: UsersIcon,
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
