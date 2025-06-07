const contractABI = [
  "function unlockTime() view returns (uint256)",
  "function withdraw()",
];

const DEFAULT_ETH_JSONRPC_URL = "http://127.0.0.1:8545";
const DEFAULT_CHAIN_ID = 31337;

async function getContractAddress() {
  const response = await fetch('contractAddress.json');
  if (!response.ok) throw new Error('Failed to load contract address');
  const data = await response.json();
  return data.lockAddress;
}

async function getContract() {
  const contractAddress = await getContractAddress();

  const APP_NAME = "Lock Contract App";

  const wallet = new CoinbaseWalletSDK({
    appName: APP_NAME,
    darkMode: false,
  });

  const ethereum = wallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);
  await ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  return new ethers.Contract(contractAddress, contractABI, signer);
}

document.getElementById("checkTime").addEventListener("click", async () => {
  try {
    const lock = await getContract();
    const unlockTime = await lock.unlockTime();
    const date = new Date(unlockTime.toNumber() * 1000);
    document.getElementById("status").textContent = `Unlock Time: ${date.toLocaleString()}`;
  } catch (err) {
    console.error(err);
    document.getElementById("status").textContent = "Error: " + err.message;
  }
});

document.getElementById("withdrawBtn").addEventListener("click", async () => {
  try {
    const lock = await getContract();
    const tx = await lock.withdraw();
    document.getElementById("status").textContent = "Transaction sent...";
    await tx.wait();
    document.getElementById("status").textContent = "Withdrawal successful!";
  } catch (err) {
    console.error(err);
    document.getElementById("status").textContent = "Withdrawal failed: " + err.message;
  }
});
