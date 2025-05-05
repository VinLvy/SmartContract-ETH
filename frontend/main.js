const contractABI = [
    "function unlockTime() view returns (uint256)",
    "function withdraw()",
  ];
  
  const contractAddress = document.getElementById("contractAddress").value;
  
  async function getContract() {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!");
      return null;
    }
  
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
  
    return new ethers.Contract(contractAddress, contractABI, signer);
  }
  
  document.getElementById("checkTime").addEventListener("click", async () => {
    const lock = await getContract();
    if (!lock) return;
  
    const unlockTime = await lock.unlockTime();
    const date = new Date(unlockTime.toNumber() * 1000);
    document.getElementById("status").textContent = `Unlock Time: ${date.toLocaleString()}`;
  });
  
  document.getElementById("withdrawBtn").addEventListener("click", async () => {
    const lock = await getContract();
    if (!lock) return;
  
    try {
      const tx = await lock.withdraw();
      document.getElementById("status").textContent = "Transaction sent...";
      await tx.wait();
      document.getElementById("status").textContent = "Withdrawal successful!";
    } catch (err) {
      console.error(err);
      document.getElementById("status").textContent = "Withdrawal failed: " + err.message;
    }
  });
  