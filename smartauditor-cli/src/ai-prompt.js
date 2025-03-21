const OpenAI = require('openai')

const analyzeContract = async (contract, apiKey) =>{

    const openai = new OpenAI({
        apiKey: apiKey,
    })

    /*
    const params = {

        model: 'gpt-4o-mini',
        response_format: { type: "json_object" },
        messages: [
            {
                role: 'user',
                content: `
                Your role and goal is to be an AI smart contract auditor. Your job is to perform an audit on the given smart contract.
                here is the smart contract: ${contract}

                Please provide the results in the following array json format for easy front-end display

                [
                    {
                        'section': 'Audit Report',
                        'details': 'A detailed audit report of the smart contract, covering security, performance, and any other relevant aspects'
                    },
                    {
                        'section': 'Metric Scores',
                        'details': [
                            {
                                'metric': 'Security',
                                'score': 0-10,
                            },
                            {
                                'metric': 'Performance',  
                                'score': 0-10,
                            },
                            {
                                'metric': 'Other key areas',
                                'score': 0-10,
                            },
                            {
                                'metric': 'Gas Efficiency',
                                'score': 0-10,
                            },
                            {
                                'metric': 'Code Quality',
                                'score': 0-10,
                            },
                            {
                                'metric': 'Documentation',
                                'score': 0-10,
                            },
                        ]
                    },

                    {
                    'sections': 'Suggestions for Improvement',
                    'detais': 'A list of suggestions for improving the smart contract in terms of security, performance, and any other identified weakness'
                    }
                ]
                Thank You.
                `
            }
        ]
    }
    */

    console.log("Starting contract analysis... This may take a minute")

    try {
    const params = {

        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'user',
                content: `Analyze this smart contract: ${contract}`
            }
        ],
        functions:[
            {
                name: 'generate_audit_report',
                description: "Generate a detailed audit report for a smart contract",
                parameters: {
                    type: "object",
                    properties: {
                        auditReport:{
                            type: "string",
                            description: "A detailed audit report of the smart contract"
                        },
                        metricScores: {
                            type: "array",
                            descirption: "An array containing exactly 6 specific metrics with scores from 0-10",
                            items: {
                                type: "object",
                                properties: {
                                    metric: {
                                        type: "string",
                                        enum: ["Security", "Performance", "Gas Efficiency", "Code Quality", "Documentation", "Other Key Areas"],
                                    },
                                    score: {
                                        type: "integer",
                                        minimum: 0,
                                        maximum: 10,
                                        description: "Score from 0-10, where 10 is the best"
                                    },
                                    explanation: {
                                        type: 'string',
                                        description: 'Brief Explanation for the score provided'
                                    }
                                },
                                required: ["metric", "score"]
                            },
                            minItems: 6,
                            maxItems: 6
                        },
                        suggestionForImprovement: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    category: {
                                        type: 'string',
                                        description: "Category of the suggestion(e.g. Security, Performance, Code Quality)"
                                    },
                                    suggestion: {
                                        type: 'string',
                                        description: 'Detailed suggestion for improvement'
                                    },
                                    priority: {
                                        type: 'string',
                                        enum: ["Critical", "High", "Medium", "Low"],
                                        description: 'Priority of the suggestion'
                                    }
                                },
                                required: ["category", "suggestion", "priority"]
                            },
                            description: "A list of suggestions for improving the smart contract in terms of security, performance, and any other identified weakness"
                        }
                    },
                    required: ["auditReport", "metricScores", "suggestionForImprovement"]
                }
            }
        ],
        function_call: {name: "generate_audit_report"}
    }

    console.log("Sending contract for OpenAI for analysis...")  
    const chatCompletion = await openai.chat.completions.create(params);

    const functionCall = chatCompletion.choices[0].message.function_call

    if(!functionCall){
        throw new Error("Expected function call in response but received none")
    }

    // console.log("functionCall", functionCall)

    const auditResults = JSON.parse(functionCall.arguments)

    // Ensure all required metrics are present and in the correct order
    const requiredMetrics = ["Security", "Performance", "Gas Efficiency", "Code Quality", "Documentation", "Other Key Areas"]

    // Create a map for quick lookup and for preserving explanations
    const metricMap = {};
    auditResults.metricScores.forEach(metric => {
        metricMap[metric.metric] = {
            score: metric.score,
            explanation: metric.explanation || ""
        };
    });

    // Rebuild the metric array in the required order, with fallbacks if any are missing
    auditResults.metricScores = requiredMetrics.map(metricName => {
        return {
            metric: metricName,
            score: metricMap[metricName]?.score || 0,  // Default to 0 if missing
            explanation: metricMap[metricName]?.explanation || "No explanation provided"
        }
    }
    )

    // Display the results
    console.log('\n ==================================')
    console.log("           AUDIT REPORT") 
    console.log('\n ================================== \n')

    console.log(auditResults.auditReport)

    console.log('\n ==================================')
    console.log("           METRIC SCORES") 
    console.log('\n ================================== \n')

    auditResults.metricScores.forEach(metric => {
        console.log(`${metric.metric}: ${metric.score}/10`)
        console.log(`Explanation: ${metric.explanation}`)
        console.log() // add empty line for readability 
    })

    console.log('\n ==================================')
    console.log("           SUGGESTIONS FOR IMPROVEMENTS") 
    console.log('\n ================================== \n')

    auditResults.suggestionForImprovement.forEach(suggestion => {
        console.log(`Category: ${suggestion.category}`)
        console.log(`Priority: ${suggestion.priority}`)
        console.log(`Suggestion: ${suggestion.suggestion}`)
        console.log() // add empty line for readability 
    })


    return auditResults

} catch (error) {
        console.error("Error during contract analysis: ", error)
}


    // const chatCompletion = await openai.chat.completions.create(params)

    // const responseContent = chatCompletion.choices[0].message.content

    // let auditResults;

    // try {
    //     auditResults = JSON.parse(responseContent);

    //     // Log the structure to help with debugging
    //     console.log("Response Structure: ", JSON.stringify(auditResults, null, 2))

    //     // Check if auditResults is directly an array
    //     if(Array.isArray(auditResults)){
    //         // Original Expected format
    //         console.log("Audit Reports")
    //         console.log(auditResults.find(r => r.section === "Metric Scores")?.details)

    //         console.log("\nMetric Scores")
    //         const metricScores = auditResults.find(r => r.section === "Metric Scores")?.details
    //         if(Array.isArray(metricScores)){
    //             metricScores.forEach(metric => {
    //                 console.log(`${metric.metric}: ${metric.score}/10`)
    //             })
    //         }

    //         console.log('\nSuggestions for Improvements')
    //         console.log(auditResults.find(r => r.section === "Suggestions for Improvement")?.details || 'Not Found')
    //     }

    // } catch (error) {
        
    // }



    /*
    console.log('auditResults', auditResults)

    console.log('Audit Reports')

    console.log( auditResults.find((r)=> r.section === 'Audit Report').details)

    console.log('\nMetric Scores')

    auditResults.find((r) => r.section === 'Metric Scores').details.forEach((metric) =>{
        console.log(`${metric.metric}: ${metric.score}/10`)
    })

    console.log('\nSuggestions for Improvements')
    console.log(auditResults.find((r)=> r.section === 'Suggestions for Improvement').details)
    */
}

module.exports = {analyzeContract}