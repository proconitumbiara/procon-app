"use client";

import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultFromStr: string;
  defaultToStr: string;
}

/**
 * Formata uma string "YYYY-MM-DD" para exibição.
 * parseISO trata date-only strings como meia-noite no fuso local do navegador,
 * o que é correto para exibição ao usuário.
 */
function formatDateStr(dateStr: string): string {
  return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
}

export function DatePicker({
  className,
  defaultFromStr,
  defaultToStr,
}: DatePickerProps) {
  // Armazena as datas como strings YYYY-MM-DD na URL (fuso local do navegador,
  // que o servidor interpreta como datas de São Paulo).
  const [from, setFrom] = useQueryState(
    "from",
    parseAsString.withDefault(defaultFromStr),
  );
  const [to, setTo] = useQueryState(
    "to",
    parseAsString.withDefault(defaultToStr),
  );

  // Converte as strings para Date apenas para o calendário (usa fuso local)
  const fromDate = parseISO(from);
  const toDate = parseISO(to);

  const handleDateSelect = (dateRange: DateRange | undefined) => {
    const newFrom = dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : defaultFromStr;

    const newTo = dateRange?.to
      ? format(dateRange.to, "yyyy-MM-dd")
      : // Se o usuário selecionou apenas o início, usa o mesmo dia como fim
        newFrom;

    setFrom(newFrom, { shallow: false });
    setTo(newTo, { shallow: false });
  };

  const handleCurrentMonth = () => {
    const today = new Date();
    setFrom(format(startOfMonth(today), "yyyy-MM-dd"), { shallow: false });
    setTo(format(endOfMonth(today), "yyyy-MM-dd"), { shallow: false });
  };

  const handleReset = () => {
    setFrom(null, { shallow: false });
    setTo(null, { shallow: false });
  };

  const isDefault =
    from === defaultFromStr && to === defaultToStr;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from && to ? (
              from === to ? (
                formatDateStr(from)
              ) : (
                <>
                  {formatDateStr(from)} – {formatDateStr(to)}
                </>
              )
            ) : (
              <span>Selecionar período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={fromDate}
            selected={{ from: fromDate, to: toDate }}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={handleCurrentMonth}
            >
              Mês atual
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="icon"
        onClick={handleReset}
        disabled={isDefault}
        aria-label="Resetar período para o padrão (mês atual)"
        title="Resetar período"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
