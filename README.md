# Lock Contract DApp

A simple Decentralized Application (DApp) built on Ethereum-compatible blockchains. This DApp interacts with a **Lock Smart Contract** that allows users to deposit ETH, which can only be withdrawn after a predefined unlock time has passed.

---

## Features

- **Deposit Ether:** ETH is deposited into the contract during deployment.
- **Time-Locked Withdrawal:** ETH can only be withdrawn after the unlock time is reached.
- **Open Withdrawal (Testing Mode):** Any connected address can trigger withdrawals for testing purposes.
- **Real-time Status Updates:** Live updates on unlock time, balance, and transaction status.
- **User-Friendly Errors:** Clear error messages for common issues like rejections or 0 balance.
- **Dark Mode:** Built-in support for light/dark UI themes.

---

## Prerequisites

Make sure the following are installed:

- [Node.js & npm](https://nodejs.org/)
- [Hardhat](https://hardhat.org/)
- [Coinbase Wallet Extension](https://www.coinbase.com/wallet)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd smart-contract-eth
```

### 2. Install Dependencies

```bash
npm install
```
---

## Compile & Deploy Contract

### Compile the Contract

```bash
npx hardhat compile
```

### Start Local Hardhat Node

```bash
npx hardhat node
```
Keep this terminal open to see transaction logs.

### Deploy the Contract

In a second terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```
This will generate a contractAddress.json file containing your deployed address.

## Wallet Setup

### Import Local Account to Coinbase Wallet

1. Copy a private key from the Hardhat node terminal.
2. Open Coinbase Wallet → Settings → "Import using private key".
3. Paste the key. You’ll see 10,000 ETH (testnet).
4. Connect to the Localhost 8545 network:

```yaml
Network Name: Hardhat Localhost
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
```

## Run the DApp Frontend

### Using VS Code Live Server (Recommended)

1. install the Live Server extension.
2. Right-click index.html → Open with Live Server.

### OR Use http-server

```bash
npm install -g http-server
http-server -c-1
```
Then open: http://localhost:8080

## Interact with the DApp

- Open the DApp in your browser.
- Connect your wallet.
- Use the UI to check unlock time and initiate withdrawals.
- Watch terminal logs and wallet balance updates.

## Project Structure

```bash
smart-contract-eth/
├── contracts/               # Smart contract (.sol)
├── scripts/                # Deployment scripts
├── test/                   # Contract tests (optional)
├── frontend/               # Frontend files (index.html, main.js, etc.)
├── hardhat.config.js       # Hardhat config
├── package.json            # NPM project file
└── README.md               # Project documentation
```

## Customization
- **Unlock Time:** Modify in scripts/deploy.js.
- **Initial ETH:** Adjust initial value in deploy script.
- **Frontend UI:** Update index.html and main.js to suit your branding.

## Contributing
Feel free to open issues or PRs for bugs, ideas, or enhancements!
