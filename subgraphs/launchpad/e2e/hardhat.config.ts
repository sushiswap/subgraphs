import { defineConfig } from "hardhat/config";

export default defineConfig({
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
      hardfork: "cancun",
      blockGasLimit: 60_000_000,
      transactionGasCap: 60_000_000,
    },
  },
});
