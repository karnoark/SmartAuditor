"use client";

import CustomCodeEditor from "@/components/contract-input";
import Header from "@/components/header";
import ResultsModal from "@/components/results-modal";
import { analyzeContract, AuditResults } from "@/utils/ai-prompt";
import { useState } from "react";

export default function Home() {
  const [contract, setContract] = useState("");
  const [results, setResults] = useState<AuditResults | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setIsModalOpen(true);
    await analyzeContract(contract, setResults, setLoading);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between p-24">
      <Header />
      <CustomCodeEditor
        analyze={analyze}
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
