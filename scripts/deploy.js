const hre = require("hardhat");

async function main() {
  const unlockTime = Math.floor(Date.now() / 1000) + 60; 
  const lockedAmount = hre.ethers.parseEther("0.01");

  const Lock = await hre.ethers.deployContract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  await Lock.waitForDeployment();

  console.log(`Lock deployed to: ${Lock.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
