import { owner } from "../global"
import { waitForTransaction } from "./ethers"
import { dynamicGasLimit } from "./network"

export const ARB_SYS = "0x0000000000000000000000000000000000000064"
export const ARBOS_STATE = "0xa4b05fffffffffffffffffffffffffffffffffff"

export async function sendData(to: string, data: string, value = 0n) {
  const response = await owner.sendTransaction({ to, data, value, gasLimit: dynamicGasLimit(1_000_000) })
  return waitForTransaction(response, false)
}
