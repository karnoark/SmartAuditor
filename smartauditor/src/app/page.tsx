"use client";

import CustomCodeEditor from "@/components/contract-input";
import Header from "@/components/header";
import ResultsModal from "@/components/results-modal";
import { AuditResults } from "@/utils/ai-prompt";
// import { analyzeContractGroq } from "@/utils/ai-prompt-groq";
import { Suspense, useState } from "react";

export default function Home() {
  const [contract, setContract] = useState("");
  const [results, setResults] = useState<AuditResults | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // const analyze = async () => {
  //   setLoading(true);
  //   setIsModalOpen(true);
  //   await analyzeContractGroq(contract, setResults, setLoading);
  // };

  const analyzeUsingRouteHandler = async () => {
    setLoading(true);
    setIsModalOpen(true);
    try {
      const response = await fetch("/api/contract-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contract }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await response.json();
      console.log(data);
      setResults(data.results);
    } catch (error) {
      console.error("Error analyzing contract: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between p-24 bg-black">
      <Header />
      <CustomCodeEditor
        analyze={analyzeUsingRouteHandler}
        contract={contract}
        setContract={setContract}
      />
      <ResultsModal
        closeModal={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        results={results}
        loading={loading}
        fixIssues={() => {}}
      />
    </main>
  );
}
