# SmartAuditor CLI

A command-line interface tool that leverages OpenAI's GPT models to perform automated audits on smart contracts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

SmartAuditor CLI helps developers analyze smart contracts for security vulnerabilities, code quality issues, gas inefficiencies, and other potential problems. It generates comprehensive audit reports with quantified metrics and prioritized improvement suggestions.

## Features

- **Automated Smart Contract Analysis**: Analyze Solidity smart contracts with a single command
- **Comprehensive Audit Reports**: Receive detailed feedback on contract security, performance, and code quality
- **Metric Scoring**: Get quantifiable scores across six key metrics:
  - Security
  - Performance
  - Gas Efficiency
  - Code Quality
  - Documentation
  - Other Key Areas
- **Prioritized Suggestions**: Receive actionable improvement suggestions categorized by priority level
- **OpenAI Integration**: Powered by OpenAI's GPT-4o-mini model for intelligent analysis

## Installation

You can install SmartAuditor CLI globally via npm:

```bash
npm install -g smartauditor-cli
```

Or use it directly with npx:

```bash
npx smartauditor-cli check <path-to-contract>
```

## Prerequisites

- Node.js (v12 or higher)
- An OpenAI API key

## Usage

### Basic Usage

```bash
auditai check <path-to-contract>
```

The tool will prompt you for your OpenAI API key and then analyze the specified smart contract file.

### Example

```bash
auditai check ./contracts/MyToken.sol
```

Output:

```
 ==================================
           AUDIT REPORT
 ==================================

This smart contract, named 'MyToken', implements a basic ERC20 token with...

 ==================================
           METRIC SCORES
 ==================================

Security: 7/10
Explanation: Good overall security but lacks reentrancy protection.

Performance: 8/10
Explanation: Efficiently implemented token transfers with minimal gas usage.

...

 ==================================
           SUGGESTIONS FOR IMPROVEMENTS
 ==================================

Category: Security
Priority: High
Suggestion: Implement OpenZeppelin's ReentrancyGuard for additional protection.

...
```

## How It Works

SmartAuditor CLI:

1. Reads your Solidity smart contract file
2. Connects to OpenAI's API using your provided key
3. Sends the contract for analysis using a specialized prompt
4. Processes the AI's response into a structured format
5. Displays the comprehensive audit results in your terminal

## Configuration

No additional configuration is required beyond providing your OpenAI API key when prompted.

## Technical Implementation

SmartAuditor CLI is built with:

- **Commander.js**: For parsing command-line arguments
- **Inquirer.js**: For interactive command-line prompts
- **OpenAI Node.js SDK**: For API communication with OpenAI
- **Function Calling**: Leverages OpenAI's function calling feature for structured responses

## Limitations

- Smart contract audits performed by AI should complement, not replace, traditional security audits by human experts
- Analysis quality depends on the OpenAI model used (currently gpt-4o-mini)
- Very large smart contracts may hit token limits

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for providing the AI capabilities
- The Ethereum and Solidity communities

## Author

Karnoark

---

**Disclaimer**: Always verify AI-generated audit results and consult with professional security auditors before deploying smart contracts to production environments. SmartAuditor CLI is meant as a supplementary tool to help identify potential issues but may not catch all vulnerabilities.