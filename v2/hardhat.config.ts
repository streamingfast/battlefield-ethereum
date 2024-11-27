import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
      },
      {
        version: "0.8.27",
      },
    ],
  },

  networks: {
    firehose: {
      url: "http://127.0.0.1:8545",
      accounts: ["0x52e1cc4b9c8b4fc9b202adf06462bdcc248e170c9abd56b2adb84c8d87bee674"],
    },
  },
}

export default config
