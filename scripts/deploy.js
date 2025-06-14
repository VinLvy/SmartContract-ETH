const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const unlockTime = Math.floor(Date.now() / 1000) + 60;
  const lockedAmount = hre.ethers.parseEther("0.01");

  // Deploy kontrak
  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.waitForDeployment();

  console.log(`Lock deployed to: ${lock.target}`);

  // Simpan alamat kontrak ke folder frontend
  const addressData = {
    lockAddress: lock.target,
  };

  const outputPath = path.join(__dirname, "..", "frontend", "contractAddress.json");

  fs.writeFileSync(outputPath, JSON.stringify(addressData, null, 2));
  console.log(`✅ contractAddress.json saved to: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
