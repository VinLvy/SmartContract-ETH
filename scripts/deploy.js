const hre = require("hardhat");

async function main() {
  const unlockTime = Math.floor(Date.now() / 1000) + 60;
  const lockedAmount = hre.ethers.parseEther("0.01");

  // Deploy kontrak
  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.waitForDeployment();

  console.log(`Lock deployed to: ${lock.target}`); // .target untuk ethers v6
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
