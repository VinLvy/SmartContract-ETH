const contractABI = [
  "function unlockTime() view returns (uint256)",
  "function withdraw()",
];

const DEFAULT_ETH_JSONRPC_URL = "http://127.0.0.1:8545";
const DEFAULT_CHAIN_ID = 31337;

// Variabel global untuk menyimpan alamat kontrak, provider, dan signer setelah diinisialisasi
let lockContractAddress = null;
let lockReadContract = null;
let lockWriteContract = null;

console.log("Ethers object:", typeof ethers);

// --- 1. Fungsi untuk mendapatkan alamat kontrak dari file JSON ---
async function getContractAddress() {
  if (lockContractAddress) return lockContractAddress; // Hindari fetch berulang

  try {
    const response = await fetch('./contractAddress.json');
    if (!response.ok) throw new Error('Failed to load contract address');
    const data = await response.json();
    lockContractAddress = data.lockAddress;
    document.getElementById("contractAddress").value = lockContractAddress; // Update UI langsung
    return lockContractAddress;
  } catch (err) {
    console.error("Gagal memuat contractAddress.json:", err);
    document.getElementById("status").textContent = "Error loading contract address";
    throw err; // Re-throw agar error ditangani di tempat panggilan
  }
}

// --- 2. Fungsi untuk mendapatkan provider dan signer ---
async function getProviderAndSigner() {
  const APP_NAME = "Lock Contract App";

  const wallet = new CoinbaseWalletSDK({
    appName: APP_NAME,
    darkMode: false,
  });

  const ethereum = wallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);
  // eth_requestAccounts hanya perlu dipanggil sekali atau saat diperlukan koneksi ulang
  // Menggunakannya setiap kali getProviderAndSigner dipanggil bisa memicu popup berulang
  // Idealnya, ini dipanggil saat tombol connect wallet pertama kali diklik
  // Untuk tujuan pengujian, kita biarkan di sini tapi perhatikan perilakunya.
  await ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  return { provider, signer };
}

// --- 3. Fungsi untuk menginisialisasi atau mendapatkan instance kontrak ---
async function initializeContracts() {
  if (lockReadContract && lockWriteContract) {
    return { lockRead: lockReadContract, lockWrite: lockWriteContract }; // Gunakan instance yang sudah ada
  }

  const contractAddress = await getContractAddress();
  const { provider, signer } = await getProviderAndSigner();

  lockReadContract = new ethers.Contract(contractAddress, contractABI, provider);
  lockWriteContract = new ethers.Contract(contractAddress, contractABI, signer);

  return { lockRead: lockReadContract, lockWrite: lockWriteContract };
}

// --- 4. Fungsi untuk memperbarui status dan memeriksa kondisi kontrak ---
async function updateStatus() {
  try {
    const { lockRead } = await initializeContracts(); // Gunakan fungsi inisialisasi yang baru
    const contractAddress = await getContractAddress(); // Pastikan alamat kontrak tersedia

    // Periksa saldo kontrak
    const contractBalance = await lockRead.runner.provider.getBalance(contractAddress);
    
    // Periksa unlock time
    const unlockTime = await lockRead.unlockTime();
    const currentTime = Math.floor(Date.now() / 1000); // Waktu sekarang dalam detik Unix
    const date = new Date(Number(unlockTime) * 1000);

    // Default status dan tombol
    let statusMessage = "";
    let isWithdrawDisabled = true;

    if (Number(contractBalance) === 0) {
      statusMessage = "Contract balance is 0. Nothing to withdraw.";
    } else if (currentTime < Number(unlockTime)) {
      statusMessage = `Unlock Time: ${date.toLocaleString()} (Locked)`;
    } else {
      statusMessage = `Unlock Time: ${date.toLocaleString()} (Ready to withdraw)`;
      isWithdrawDisabled = false; // Aktifkan tombol jika waktu sudah tiba dan ada dana
    }

    document.getElementById("status").textContent = statusMessage;
    document.getElementById("withdrawBtn").disabled = isWithdrawDisabled;

  } catch (err) {
    console.error("Error updating status:", err);
    let errorMessage = "Error updating status. Check console.";

    if (err.code === "CALL_EXCEPTION" && err.reason) {
      errorMessage = `Error Status: ${err.reason}`;
    } else if (err.message) {
      errorMessage = `Error Status: ${err.message}`;
    }
    document.getElementById("status").textContent = errorMessage;
    document.getElementById("withdrawBtn").disabled = true; // Nonaktifkan tombol jika ada error status
  }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", async () => {
  // Panggil updateStatus saat DOM dimuat untuk menampilkan info awal dan mengisi alamat
  await updateStatus(); // updateStatus akan memanggil getContractAddress
});

document.getElementById("checkTime").addEventListener("click", async () => {
  // Cukup panggil updateStatus, karena ini sudah mencakup pengecekan waktu dan status lainnya
  await updateStatus();
});

document.getElementById("withdrawBtn").addEventListener("click", async () => {
  // Langsung nonaktifkan tombol untuk mencegah klik ganda selama proses
  document.getElementById("withdrawBtn").disabled = true;
  document.getElementById("status").textContent = "Initiating withdrawal...";

  try {
    const { lockWrite } = await initializeContracts(); // Gunakan instance yang sudah ada

    // Periksa kembali saldo kontrak sebelum mengirim transaksi
    const contractAddress = await getContractAddress();
    const contractBalance = await lockWrite.runner.provider.getBalance(contractAddress);
    if (Number(contractBalance) === 0) {
        document.getElementById("status").textContent = "Contract balance is 0. Nothing to withdraw.";
        document.getElementById("withdrawBtn").disabled = true;
        return; // Hentikan eksekusi
    }

    // Periksa unlock time juga untuk kepastian ganda sebelum transaksi
    const unlockTime = await lockWrite.unlockTime(); // Gunakan lockWrite untuk konsistensi atau lockRead juga bisa
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime < Number(unlockTime)) {
        document.getElementById("status").textContent = `Withdrawal failed: Unlock time not reached yet.`;
        await updateStatus(); // Perbarui status
        return; // Hentikan eksekusi
    }


    const tx = await lockWrite.withdraw();
    document.getElementById("status").textContent = "Transaction sent, waiting for confirmation...";
    await tx.wait(); // Tunggu konfirmasi

    document.getElementById("status").textContent = "Withdrawal successful!";
    await updateStatus(); // Setelah berhasil withdraw, panggil updateStatus lagi untuk memperbarui kondisi

  } catch (err) {
    console.error("Withdrawal error:", err); // Tetap log error lengkap ke konsol untuk debugging

    let errorMessage = "Withdrawal failed: Unknown error.";

    if (err.code === 4001 || err.code === "ACTION_REJECTED") {
      errorMessage = "Withdrawal failed: Transaction rejected by user.";
    } else if (err.code === "CALL_EXCEPTION" && err.reason) {
      errorMessage = `Withdrawal failed: ${err.reason}`;
    } else if (err.message && err.message.includes("insufficient funds")) {
      errorMessage = "Withdrawal failed: Insufficient funds in wallet for gas fee.";
    } else if (err.message) {
      errorMessage = `Withdrawal failed: ${err.message}`;
    }

    document.getElementById("status").textContent = errorMessage;
    await updateStatus(); // Perbarui status dan aktifkan/nonaktifkan tombol sesuai kondisi
  }
});