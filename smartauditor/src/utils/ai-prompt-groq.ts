import Groq from "groq-sdk";
import {
  ChatCompletionMessageParam,
  ChatCompletion,
  ChatCompletionTool,
  ChatCompletionCreateParams,
} from "groq-sdk/resources/chat/completions";

// Define types for our audit report
interface MetricScore {
  metric: string;
  score: number;
  explanation?: string;
}

interface MetricMapItem {
  score: number;
  explanation: string;
}

export interface AuditResults {
  auditReport: string;
  metricScores: MetricScore[];
  suggestionForImprovement: Array<{
    category: string;
    suggestion: string;
    priority: "Critical" | "High" | "Medium" | "Low";
  }>;
}

// Define types for the state setter function
type SetResults = (results: AuditResults) => void;
type SetLoading = (loading: boolean) => void;

const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

const openai = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

export const analyzeContractGroq = async (
  contract: string,
  setResults: SetResults,
  setLoading: SetLoading,
) => {
  setLoading(true);

  try {
    if (!apiKey) {
      console.error("Groq API key is missing");
      setLoading(false);
      return;
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: `Analyze this smart contract: ${contract}`,
      },
    ];

    const tools: ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "generate_audit_report",
          description: "Generate a detailed audit report for a smart contract",
          parameters: {
            type: "object",
            properties: {
              auditReport: {
                type: "string",
                description: "A detailed audit report of the smart contract",
              },
              metricScores: {
                type: "array",
                descirption:
                  "An array containing exactly 6 specific metrics with scores from 0-10",
                items: {
                  type: "object",
                  properties: {
                    metric: {
                      type: "string",
                      enum: [
                        "Security",
                        "Performance",
                        "Gas Efficiency",
                        "Code Quality",
                        "Documentation",
                        "Other Key Areas",
                      ],
                    },
                    score: {
                      type: "integer",
                      minimum: 0,
                      maximum: 10,
                      description: "Score from 0-10, where 10 is the best",
                    },
                    explanation: {
                      type: "string",
                      description: "Brief Explanation for the score provided",
                    },
                  },
                  required: ["metric", "score"],
                },
                minItems: 6,
                maxItems: 6,
              },
              suggestionForImprovement: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      description:
                        "Category of the suggestion(e.g. Security, Performance, Code Quality)",
                    },
                    suggestion: {
                      type: "string",
                      description: "Detailed suggestion for improvement",
                    },
                    priority: {
                      type: "string",
                      enum: ["Critical", "High", "Medium", "Low"],
                      description: "Priority of the suggestion",
                    },
                  },
                  required: ["category", "suggestion", "priority"],
                },
                description:
                  "A list of suggestions for improving the smart contract in terms of security, performance, and any other identified weakness",
              },
            },
            required: [
              "auditReport",
              "metricScores",
              "suggestionForImprovement",
            ],
          },
        },
      },
    ];

    const params: ChatCompletionCreateParams = {
      model: "deepseek-r1-distill-llama-70b",
      messages,
      stream: false,
      tools,
    };

    const chatCompletion = (await openai.chat.completions.create(
      params,
    )) as ChatCompletion;

    const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("Expected function call in response but received none");
    }

    console.log("toolCall", toolCall);

    // Parse the argument with proper type
    const auditResults: AuditResults = JSON.parse(toolCall.function.arguments);

    // Ensure all required metrics are present and in the correct order
    const requiredMetrics = [
      "Security",
      "Performance",
      "Gas Efficiency",
      "Code Quality",
      "Documentation",
      "Other Key Areas",
    ];

    // Create a map for quick lookup and for preserving explanations
    const metricMap: Record<string, MetricMapItem> = {};
    auditResults.metricScores.forEach((metric: MetricScore) => {
      metricMap[metric.metric] = {
        score: metric.score,
        explanation: metric.explanation || "",
      };
    });

    // Rebuild the metric array in the required order, with fallbacks if any are missing
    auditResults.metricScores = requiredMetrics.map((metricName) => {
      return {
        metric: metricName,
        score: metricMap[metricName]?.score || 0, // Default to 0 if missing
        explanation:
          metricMap[metricName]?.explanation || "No explanation provided",
      };
    });

    // Set the results
    setResults(auditResults);
    setLoading(false);
  } catch (err) {
    console.error("Error analyzing contract:", err);
    setLoading(false);
  }
};
