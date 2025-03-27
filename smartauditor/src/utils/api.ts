import { AuditResults } from "./ai-prompt-groq";

export async function analyzeContract(contract: string): Promise<AuditResults> {
  const response = await fetch("/api/contract-analysis", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ contract }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "API request failed");
  }

  const data = await response.json();
  return data.results;
}
