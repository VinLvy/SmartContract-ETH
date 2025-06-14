Lock Contract DApp
Replace this with an actual screenshot of your DApp for better visual appeal!

This project is a simple Decentralized Application (DApp) that interacts with a Lock Smart Contract on an Ethereum-compatible blockchain. The contract allows users to deposit Ether (ETH) which can only be withdrawn after a predefined unlock time has passed. The DApp provides a user-friendly interface to check the unlock time and initiate withdrawals.

Features
Deposit Ether: Ether is deposited into the contract at the time of deployment (configured in the deployment script).
Time-Locked Withdrawal: Funds can only be withdrawn after a specific unlockTime has been reached.
Owner Agnostic Withdrawal (for this version): This version of the contract has been modified for easier local testing, allowing any connected address to trigger the withdrawal (the funds will go to the address that triggers the withdrawal, as modified). Note: In a production scenario, withdrawal would typically be restricted to the contract owner or specific beneficiaries.
Real-time Status Updates: The DApp dynamically updates the status messages to inform the user about the unlock time, contract balance, and transaction progress.
User-Friendly Error Handling: Clear and concise error messages are displayed for common issues like transaction rejection or insufficient funds.
Dark Mode Support: The DApp features a modern UI with an automatic and togglable dark mode for better user experience.
Prerequisites
Before you begin, ensure you have the following installed:

Node.js & npm: Download and install Node.js (npm is included).
Hardhat: This project uses Hardhat as its Ethereum development environment.
Coinbase Wallet Extension: Install the Coinbase Wallet browser extension for Chrome, Firefox, or Brave.
Getting Started
Follow these steps to set up and run the Lock Contract DApp on your local machine.

1. Clone the Repository (or navigate to your project)
   If you haven't already, clone this repository:

Bash

git clone <your-repository-url>
cd smart-contract-eth # Or your project folder name 2. Install Dependencies
Navigate into your project directory and install the necessary Node.js packages:

Bash

npm install # or yarn install 3. Prepare Your Smart Contract
Ensure your contracts/Lock.sol file contains the logic you intend to test. For this DApp, it's assumed you're using a version of Lock.sol where the withdraw() function does not strictly enforce onlyOwner checks, allowing the msg.sender to receive the funds upon withdrawal.

Example contracts/Lock.sol (Simplified for testing):

Solidity

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract Lock {
uint public unlockTime;
address payable public owner;

    event Withdrawal(uint amount, uint when);

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );
        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        // The original 'require(msg.sender == owner, "You aren't the owner");' is removed for testing purposes.
        emit Withdrawal(address(this).balance, block.timestamp);
        payable(msg.sender).transfer(address(this).balance); // Funds sent to the caller
    }

    function unlockTime() public view returns (uint256) {
        return unlockTime;
    }

} 4. Edit the Deployment Script
Open scripts/deploy.js and ensure it's configured to deploy the Lock contract with an initial amount of Ether and saves the deployed contract address to contractAddress.json.

Example scripts/deploy.js:

JavaScript

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
const [deployer] = await hre.ethers.getSigners();
console.log("Deploying contracts with the account:", deployer.address);

// Set unlock time to 1 minute from now for quick testing
const ONE_MINUTE_IN_SECS = 60;
const unlockTime = Math.floor(Date.now() / 1000) + ONE_MINUTE_IN_SECS;

const Lock = await hre.ethers.getContractFactory("Lock");
// Deposit 0.01 ETH into the contract upon deployment
const initialEth = hre.ethers.parseEther("0.01");
const lock = await Lock.deploy(unlockTime, { value: initialEth });

await lock.waitForDeployment();
const lockAddress = await lock.getAddress();
console.log(`Lock contract deployed to: ${lockAddress}`);

// Save the contract address to contractAddress.json
const contractsDir = path.join(\_\_dirname, '..', 'contractAddress.json');
const data = JSON.stringify({ lockAddress: lockAddress }, null, 2);
fs.writeFileSync(contractsDir, data);

console.log(`Contract address saved to ${path.relative(process.cwd(), contractsDir)}`);
}

main().catch((error) => {
console.error(error);
process.exitCode = 1;
}); 5. Compile Your Smart Contract
Compile your Solidity contract using Hardhat:

Bash

npx hardhat compile
Running the DApp
Follow these steps to launch the local blockchain and the frontend DApp.

1. Start the Hardhat Local Node
   Open your first terminal and run the Hardhat Network. This simulates an Ethereum blockchain on your local machine and provides accounts with test ETH.

Bash

npx hardhat node
Keep this terminal open. It will display logs of all transactions and interactions with your smart contract.
Note the accounts and their private keys displayed in this terminal. You'll need one of these private keys to fund your Coinbase Wallet. 2. Deploy Your Contract
Open a second terminal and, in your project directory, deploy your Lock contract to the Hardhat local node:

Bash

npx hardhat run scripts/deploy.js --network localhost
This command will deploy your contract, and its address will be saved in contractAddress.json.
Verify that contractAddress.json has been updated with the new contract address. 3. Fund Your Wallet (Coinbase Wallet)
Your Coinbase Wallet (or any browser wallet) needs ETH to pay for transaction fees on the local Hardhat Network.

A. Get a Private Key: From the first terminal running npx hardhat node, copy the private key of one of the accounts (e.g., the first one: 0xf39Fd6e51aad88F6F4ce6Ab8827279cffFb92266). These accounts are pre-funded with 10,000 ETH.
Security Warning: Never use these private keys on a public network (like Ethereum Mainnet) or share them with anyone, as they control real funds in those environments!
B. Import to Coinbase Wallet:
Open your Coinbase Wallet browser extension.
Go to Settings or the account selection menu.
Look for an option to "Add account" or "Import wallet" using a "Private Key".
Paste the private key you copied from the Hardhat node terminal.
Once imported, switch to this newly imported account in your Coinbase Wallet. It should show a balance of 10,000 ETH.
C. Connect to Localhost Network: Ensure your Coinbase Wallet is connected to the "Localhost 8545" network. If not, you might need to add it manually:
Network Name: Hardhat Localhost
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH (optional) 4. Run the Frontend DApp
You need a local web server to serve your index.html and main.js files.

Using VS Code Live Server (Recommended):

If you use VS Code, install the "Live Server" extension.
Right-click on your index.html file in the VS Code explorer.
Select "Open with Live Server".

<!-- end list -->

This will open your DApp in your default web browser (e.g., at http://127.0.0.1:5500/index.html).
Alternatively, using http-server (if Live Server isn't an option):

Install http-server globally: npm install -g http-server
In a third terminal, navigate to your project directory.
Run: http-server -c-1
Open your browser and go to http://127.0.0.1:8080 (or the address displayed in the terminal). 5. Interact with the DApp
Open the DApp in your browser.
Your contract address should automatically populate the input field.
Click "Check Unlock Time": Your Coinbase Wallet will prompt you to connect. Approve the connection. The DApp will then display the unlock time.
Click "Withdraw":
If the unlock time hasn't passed or the contract balance is 0, a message will appear, and the transaction won't proceed.
If conditions are met, Coinbase Wallet will prompt you to confirm the transaction. Confirm it using the imported account that has ETH.
Observe the status messages on the DApp indicating transaction progress.
Check your Coinbase Wallet balance; it should decrease slightly (for gas) and then increase with the withdrawn ETH from the contract.
Check your first terminal running npx hardhat node to see the transaction details.
Project Structure
smart-contract-eth/
├── contracts/
│ └── Lock.sol # Your smart contract code
├── scripts/
│ └── deploy.js # Script to deploy the contract
├── node_modules/ # Project dependencies
├── test/ # Smart contract tests (if any)
├── hardhat.config.js # Hardhat configuration
├── package.json # Node.js project file
├── contractAddress.json # Deployed contract address (generated by deploy.js)
├── index.html # The frontend DApp HTML
└── main.js # The frontend DApp JavaScript logic

Customization
Unlock Time: Modify scripts/deploy.js to change the unlockTime for your contract.
Initial ETH: Adjust the initialEth value in scripts/deploy.js to control how much Ether is sent to the contract upon deployment.
UI/UX: Further customize index.html and main.js using Tailwind CSS classes or custom CSS/JS to enhance the user interface.
Feel free to open issues or pull requests if you encounter any problems or have suggestions for improvements!
