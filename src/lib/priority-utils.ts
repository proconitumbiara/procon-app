/**
 * Converte o valor numérico de prioridade (0/1) para texto ("Comum"/"Prioritário")
 * @param priority - Valor numérico da prioridade (0 = Comum, 1 = Prioritário)
 * @returns String com o label da prioridade
 */
export function getPriorityLabel(priority: number): "Comum" | "Prioritário" {
  return priority === 1 ? "Prioritário" : "Comum";
}

