async function main() {
  // Step 1: MetaMask + Signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const sdk = ThirdwebSDK.fromSigner(signer, "ethereum");

  // Step 2: Contract Init
  const contractAddress = "0x71F0327ec1054cDaF92e418BAbE569c795Da2921";
  const contract = await sdk.getContract(contractAddress, "token-drop");

  // Step 3: Stage Info
  async function updateStageInfo() {
    const active = await contract.claimConditions.getActive();
    const all = await contract.claimConditions.getAll();

    document.getElementById("stageLabel").textContent = active.metadata.name;
    document.getElementById("priceLabel").textContent = `${ethers.formatEther(active.price)} ETH`;
    const next = all[all.findIndex(x => x.metadata.name === active.metadata.name) + 1];
    document.getElementById("nextPriceLabel").textContent = next
      ? `${ethers.formatEther(next.price)} ETH`
      : "Final Stage";
  }

  // Step 4: Buy Function
  document.getElementById("buyPGCButton").addEventListener("click", async () => {
    try {
      const quantity = parseInt(document.getElementById("tokenAmountInput").value);
      const tx = await contract.erc20.claim(quantity);
      alert("Transaction sent! Hash: " + tx.receipt.transactionHash);
    } catch (err) {
      console.error(err);
      alert("Transaction failed!");
    }
  });

  updateStageInfo();
}

main();
