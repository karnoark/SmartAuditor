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

const apiKey = process.env.GROQ_API_KEY;

export async function POST(request: Request) {
  const { contract } = await request.json();
  //   console.log(`Prompt=> \nAnalyze this smart contract: ${contract}`);
  //   console.log("----------------------------");
  //   const auditResults = {
  //     auditReport:
  //       "The provided smart contract is a Decentralized Voting system with multiple functionalities. It allows registration of voters, creation of proposals, voting, and execution of proposals. The contract uses modifiers to restrict certain functions to admins or registered voters. It also includes events for tracking important actions and functions to retrieve voting results and check voter participation.",
  //     metricScores: [
  //       {
  //         metric: "Security",
  //         score: 8,
  //         explanation:
  //           "The contract uses modifiers to restrict access and includes event emissions for transparency. However, there are no explicit reentrancy guards, which could be a security risk.",
  //       },
  //       {
  //         metric: "Performance",
  //         score: 9,
  //         explanation:
  //           "The contract is efficient with state variable usage and minimizes gas costs where possible, such as in bulk registration.",
  //       },
  //       {
  //         metric: "Gas Efficiency",
  //         score: 8,
  //         explanation:
  //           "The contract uses mappings and arrays efficiently, but some functions could benefit from further optimization to reduce gas consumption.",
  //       },
  //       {
  //         metric: "Code Quality",
  //         score: 9,
  //         explanation:
  //           "The code is well-structured, readable, and includes comprehensive comments and documentation.",
  //       },
  //       {
  //         metric: "Documentation",
  //         score: 8,
  //         explanation:
  //           "The contract includes NatSpec comments, but some functions could benefit from more detailed explanations.",
  //       },
  //       {
  //         metric: "Other Key Areas",
  //         score: 7,
  //         explanation:
  //           "The contract lacks some features like proposal expiration or advanced access control, which could enhance its functionality.",
  //       },
  //     ],
  //     suggestionForImprovement: [
  //       {
  //         category: "Security",
  //         priority: "Critical",
  //         suggestion:
  //           "Implement reentrancy guards to prevent potential reentrancy attacks.",
  //       },
  //       {
  //         category: "Performance",
  //         priority: "Medium",
  //         suggestion:
  //           "Optimize gas costs in functions with loops by using more efficient data structures or algorithms.",
  //       },
  //       {
  //         category: "Code Quality",
  //         priority: "Low",
  //         suggestion:
  //           "Consider adding more detailed comments for complex functions to improve readability.",
  //       },
  //       {
  //         category: "Documentation",
  //         priority: "Low",
  //         suggestion:
  //           "Enhance NatSpec comments with more detailed explanations for each function's purpose and behavior.",
  //       },
  //       {
  //         category: "Other Key Areas",
  //         priority: "High",
  //         suggestion:
  //           "Add functionality for proposal expiration to handle proposals that never reach a conclusion.",
  //       },
  //     ],
  //   };

  try {
    if (!apiKey) {
      console.error("Groq API key is missing");
      return Response.json(
        { error: "API key is not configured" },
        { status: 500 },
      );
    }

    const openai = new Groq({
      apiKey: apiKey,
    });

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
                description:
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
      return Response.json(
        { error: "No tool call found in the response" },
        { status: 500 },
      );
    }

    // Parse the argument with proper type
    const auditResults: AuditResults = JSON.parse(toolCall.function.arguments);

    // console.log("auditResults", auditResults);

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

    return Response.json({ results: auditResults });
  } catch (error) {
    console.log("Error analyzing contract: ", error);
    return new Response("Failed to analyze the contract", { status: 500 });
  }
}
