export const sendETH = async (
  privateKey,
  provider,
  amountToSend,
  toAddress
) => {
  if (
    amountToSend.toString() === "0" ||
    amountToSend.toString() === "0.0" ||
    amountToSend.toString() === "0,0"
  ) {
    return;
  }

  // Creating a wallet provider with your private key
  const wallet = new ethers.Wallet(privateKey, provider);

  // Creating a transaction object
  const tx = {
    to: toAddress,
    value: amountToSend,
    gasPrice: constants.Zero,
    gasLimit: constants.Zero,
  };

  // Estimating gas for the transaction
  const gasEstimate = await wallet.estimateGas(tx);

  // Setting custom gas values
  const gasPrice = ethers.utils.parseUnits("20", "gwei"); // Setting gas price in gwei
  const gasLimit = gasEstimate.mul(2); // Setting gas limit to twice the estimation

  // Adding custom gas values to the transaction object
  tx.gasPrice = gasPrice;
  tx.gasLimit = gasLimit;

  // Signing and sending the transaction
  const txReceipt = await wallet.sendTransaction(tx);
  await provider.waitForTransaction(txReceipt.hash).then((receipt) => {
    console.log("Transaction Confirmed: " + receipt.status);
  });

  console.log("Transaction hash:", txReceipt.hash);
};
