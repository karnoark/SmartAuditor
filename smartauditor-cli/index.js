#!/usr/bin/env node

const {Command} = require('commander')

const inquirer = require('inquirer')

const {analyzeContract} = require('./src/ai-prompt')

const fs = require('fs')

const path = require('path')

const program = new Command();

program.name('auditai').description('A CLI tool for smart contract auditing using openai').version('1.0.0');

const getApiKey = async () => {

    const {apiKey} = await inquirer.prompt([
        {
            type: 'input',
            name: 'apiKey',
            message: 'Enter your OpenAI API key',
            validate: (input) => input.length > 0 || 'API key is required'
        }
    ]);

    return apiKey;
}

program.command('check <file>').description('Analyze a smart contract').action(async (file) => {

    try {
        const apiKey = await getApiKey();

        const contractPath = path.resolve(process.cwd(), file);

        console.log(`checking file at path: ${contractPath}`);

        if(!fs.existsSync(contractPath)){
            console.error('File not found')
            process.exit(1)
        }

        if(fs.statSync(contractPath).isDirectory()){
            console.error('File is a directory, please provide a file ->  ', contractPath)
            process.exit(1)
        }

        const contract = fs.readFileSync(contractPath, 'utf-8');

        await analyzeContract(contract, apiKey)
    } catch (error) {
        console.error("Error analyzing contract: ", error)
    }
})

program.parse(process.argv);


