import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FUNCOES_ORDER = [
  "Montador de andaime",
  "Soldador",
  "Pedreiro",
  "Servente",
  "Eletricista",
  "Pintor",
  "Carpinteiro",
  "Armador"
];

export function sortFuncoes(funcoes: { id: string, nome: string }[]) {
  return [...funcoes].sort((a, b) => {
    let indexA = FUNCOES_ORDER.indexOf(a.nome);
    let indexB = FUNCOES_ORDER.indexOf(b.nome);
    
    // Fallback if a name is not in the array
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    
    if (indexA !== indexB) return indexA - indexB;
    return a.nome.localeCompare(b.nome); // tie-breaker alphabetically
  });
}
