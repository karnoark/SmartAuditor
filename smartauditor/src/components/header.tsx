import { BackgroundLines } from "./ui/background-lines";
import { WavyBackground } from "./ui/wavy-background";

export default function Header() {
  return (
    <WavyBackground className="max-w-4xl mx-auto pb-20">
      <p className="text-2xl md:text-8xl text-white font-bold text-center">
        AI Powered Smart Contract Auditor
      </p>
      <p className="text-base md:text-2xl mt-4 text-white font-normal text-center">
        Smart Auditor helps you audit your smart contracts with the power of AI.
        It can detect vulnerabilities and suggest improvements.
      </p>
    </WavyBackground>
  );
}
