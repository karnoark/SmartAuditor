import { analyzeContract } from "@/utils/api";
import { useMutation } from "@tanstack/react-query";

export function useContractAnalysis() {
  return useMutation({
    mutationFn: (contract: string) => analyzeContract(contract),
    onError: (error) => {
      console.error("Error analyzing contract:", error);
    },
  });
}
