const contractABI = [
  "function unlockTime() view returns (uint256)",
  "function withdraw()",
];

const DEFAULT_ETH_JSONRPC_URL = "http://127.0.0.1:8545";
const DEFAULT_CHAIN_ID = 31337;
console.log("Ethers object:", typeof ethers);

async function getContractAddress() {
  const response = await fetch('./contractAddress.json');
  if (!response.ok) throw new Error('Failed to load contract address');
  const data = await response.json();
  return data.lockAddress;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const contractAddress = await getContractAddress();
    document.getElementById("contractAddress").value = contractAddress;
  } catch (err) {
    console.error("Gagal memuat contractAddress.json:", err);
    document.getElementById("status").textContent = "Error loading contract address";
  }
});

async function getProviderAndSigner() {
  const APP_NAME = "Lock Contract App";

  const wallet = new CoinbaseWalletSDK({
    appName: APP_NAME,
    darkMode: false,
  });

  const ethereum = wallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);
  await ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  return { provider, signer };
}

async function getContracts() {
  const contractAddress = await getContractAddress();
  const { provider, signer } = await getProviderAndSigner();

  const lockRead = new ethers.Contract(contractAddress, contractABI, provider);
  const lockWrite = new ethers.Contract(contractAddress, contractABI, signer);

  return { lockRead, lockWrite };
}

document.getElementById("checkTime").addEventListener("click", async () => {
  try {
    const { lockRead } = await getContracts();
    const unlockTime = await lockRead.unlockTime();
    const date = new Date(Number(unlockTime) * 1000);
    document.getElementById("status").textContent = `Unlock Time: ${date.toLocaleString()}`;
  } catch (err) {
    console.error(err);
    document.getElementById("status").textContent = "Error: " + err.message;
  }
});

document.getElementById("withdrawBtn").addEventListener("click", async () => {
  try {
    const { lockWrite } = await getContracts();
    const tx = await lockWrite.withdraw();
    document.getElementById("status").textContent = "Transaction sent...";
    await tx.wait();
    document.getElementById("status").textContent = "Withdrawal successful!";
  } catch (err) {
    console.error("Withdrawal error:", err); // Log error lengkap ke konsol untuk debugging
    let errorMessage = "Withdrawal failed: Unknown error.";

    // Cek jika error adalah CALL_EXCEPTION dari ethers.js v6 dengan alasan revert
    if (err.code === "CALL_EXCEPTION" && err.reason) {
      errorMessage = `Withdrawal failed: ${err.reason}`;
    } else if (err.message) {
      // Untuk error lain yang memiliki properti message
      errorMessage = `Withdrawal failed: ${err.message}`;
    }

    document.getElementById("status").textContent = errorMessage;
  }
});