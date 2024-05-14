import { prepareWriteContract, writeContract } from "@wagmi/core"
import { ethers } from "ethers"
import * as ERC20_ABI from "./meta/erc20.abi.json"
import * as GC_ABI from "./meta/gc.abi.json"

// approve call for ERC20
// approve call for ERC20
export default async function withdraw(amount) {
  console.log("Interacting with: ", GC_ABI.address)
  // call deposit
  const withdrawConfig = await prepareWriteContract({
    address: GC_ABI.address,
    abi: GC_ABI.abi,
    functionName: "withdraw",
    args: [ethers.utils.parseEther(amount), 0],
  })

  const withdrawResult = await (await writeContract(withdrawConfig)).wait()
  if (!withdrawResult.status) {
    console.error(`Withdraw error: ${withdrawResult.logs}`)
  }
  return withdrawResult
}
