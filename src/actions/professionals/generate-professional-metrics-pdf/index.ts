"use server";

import jsPDF from "jspdf";
import { z } from "zod";

import { getProfessionalMetrics } from "@/data/get-professional-metrics";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes } from "./schema";

export const generateProfessionalMetricsPDF = actionClient
  .schema(
    z.object({
      professionalId: z.string(),
      professionalName: z.string(),
      from: z.date().optional(),
      to: z.date().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const { professionalId, professionalName, from, to } = parsedInput;

      // Buscar as métricas do profissional
      const metrics = await getProfessionalMetrics({
        professionalId,
        from,
        to,
      });

      // Criar o PDF
      const doc = new jsPDF();

      // Configurar fonte e cores
      const primaryColor = "#1e40af";
      const secondaryColor = "#64748b";
      const textColor = "#1f2937";

      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(primaryColor);
      doc.text("Relatório de Métricas do Profissional", 20, 30);

      // Informações do profissional
      doc.setFontSize(14);
      doc.setTextColor(textColor);
      doc.text(`Profissional: ${professionalName}`, 20, 50);

      // Período
      const periodText =
        from && to
          ? `Período: ${from.toLocaleDateString("pt-BR")}`
          : "Período: Todos os dados";
      doc.text(periodText, 20, 60);

      // Função para formatar tempo
      const formatTime = (minutes: number) => {
        if (minutes < 60) {
          return `${minutes}min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
      };

      // Métricas principais
      let yPosition = 90;
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text("Métricas Principais", 20, yPosition);

      yPosition += 20;

      // Card de Operações
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text("Operações", 20, yPosition);
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text(metrics.totalOperations.toString(), 20, yPosition + 10);
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text(
        `Tempo médio: ${formatTime(metrics.averageOperationTime)}`,
        20,
        yPosition + 18,
      );

      // Card de Pausas
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text("Pausas", 110, yPosition);
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text(metrics.totalPauses.toString(), 110, yPosition + 10);
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text(
        `Tempo médio: ${formatTime(metrics.averagePauseTime)}`,
        110,
        yPosition + 18,
      );

      yPosition += 30;

      // Card de Atendimentos
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text("Atendimentos", 20, yPosition);
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text(metrics.totalTreatments.toString(), 20, yPosition + 10);
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text(
        `Tempo médio: ${formatTime(metrics.averageTreatmentTime)}`,
        20,
        yPosition + 18,
      );

      // Card de Média por Operação
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text("Média por Operação", 110, yPosition);
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      const avgPerOperation =
        metrics.totalOperations > 0
          ? (metrics.totalTreatments / metrics.totalOperations).toFixed(1)
          : "0.0";
      doc.text(`~${avgPerOperation}`, 110, yPosition + 10);
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text("Atendimentos por operação", 110, yPosition + 18);

      // Detalhes das pausas por motivo
      if (metrics.averagePauseTimeByReason.length > 0) {
        yPosition += 40;
        doc.setFontSize(16);
        doc.setTextColor(primaryColor);
        doc.text("Pausas por Motivo", 20, yPosition);

        yPosition += 15;
        doc.setFontSize(12);
        doc.setTextColor(textColor);

        metrics.averagePauseTimeByReason.forEach((pause) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
          }

          doc.text(
            `${pause.reason.charAt(0).toUpperCase() + pause.reason.slice(1)}`,
            20,
            yPosition,
          );
          doc.text(
            `${pause.count} pausas • ${formatTime(pause.averageTime)} médio`,
            120,
            yPosition,
          );
          yPosition += 10;
        });
      }

      // Data de geração
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      doc.text(
        `Relatório gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
        20,
        doc.internal.pageSize.height - 10,
      );

      // Gerar o PDF como base64
      const pdfBase64 = doc.output("datauristring");
      const pdfData = pdfBase64.split(",")[1]; // Remove o prefixo data:application/pdf;base64,

      return {
        success: true,
        pdfData: pdfData,
        fileName: `metricas-${professionalName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
      };
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      return {
        error: {
          type: ErrorTypes.PDF_GENERATION_ERROR,
          message: ErrorMessages[ErrorTypes.PDF_GENERATION_ERROR],
        },
      };
    }
  });
