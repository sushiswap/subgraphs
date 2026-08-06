import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import {
  Contract,
  ContractFactory,
  Interface,
  JsonRpcProvider,
  type Signer,
  type TransactionReceipt,
  type TransactionResponse,
} from "ethers";
import {
  buildExpectedSnapshot,
  normalizeSnapshot,
  type EntitySnapshot,
  type IndexedEvent,
  type LaunchObservation,
} from "./model";
import {
  CHAIN_ID,
  DEFAULT_SEEDS,
  HIGH_QUOTE_TOKEN_ADDRESS,
  LOW_QUOTE_TOKEN_ADDRESS,
  planScenario,
  stringifyPlan,
  type LaunchPlan,
  type ScenarioAction,
  type ScenarioPlan,
} from "./scenario";

const RPC_URL = "http://127.0.0.1:8545";
const GRAPH_ADMIN_URL = "http://127.0.0.1:8020";
const GRAPH_QUERY_URL = "http://127.0.0.1:8000";
const IPFS_URL = "http://127.0.0.1:5001";
const COMPOSE_PROJECT = "launchpad-e2e";
const REQUIRED_PORTS = [8545, 8000, 8001, 8020, 8030, 8040, 5001, 5432];

const packageDirectory = path.resolve(__dirname, "..");
const repositoryDirectory = path.resolve(packageDirectory, "../..");
const composeFile = path.join(packageDirectory, "e2e/docker-compose.yml");
const hardhatConfigSource = path.join(
  packageDirectory,
  "e2e/hardhat.config.ts"
);

interface HardhatArtifact {
  abi: Array<Record<string, unknown>>;
  bytecode: string;
}

interface ContractArtifacts {
  launchpad: HardhatArtifact;
  launchToken: HardhatArtifact;
  quoteToken: HardhatArtifact;
  priceFeed: HardhatArtifact;
  factory: HardhatArtifact;
  weth: HardhatArtifact;
  positionManager: HardhatArtifact;
  pool: HardhatArtifact;
}

interface Fixture {
  launchpad: Contract;
  launchpadAddress: string;
  launchpadDeploymentBlock: number;
  quoteTokens: Map<string, Contract>;
  factory: Contract;
  positionManager: Contract;
  positionManagerAddress: string;
  poolArtifact: HardhatArtifact;
  tokenArtifact: HardhatArtifact;
}

interface LaunchedToken {
  tokenKey: string;
  address: string;
  pool: string;
  quoteToken: string;
  creatorAccount: number;
  positionIds: bigint[];
  token: Contract;
}

interface ScenarioExecution {
  events: IndexedEvent[];
  launchpadObservation: LaunchObservation | null;
  finalBlock: number;
}

interface CliOptions {
  seeds: number[];
  contractsDirectory: string;
}

interface RunningProcess {
  child: ChildProcess;
  finished: Promise<number | null>;
}

interface ComposeCli {
  command: string;
  prefix: string[];
}

let composeCli: ComposeCli;

function parseOptions(): CliOptions {
  const arguments_ = process.argv.slice(2);
  let seed: number | undefined;
  let contractsDirectory =
    process.env.LAUNCHPAD_CONTRACTS_DIR ??
    path.resolve(packageDirectory, "../../../sushi-launchpad");

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--") continue;
    if (argument === "--seed") {
      const rawSeed = arguments_[index + 1];
      if (!rawSeed) throw new Error("--seed requires a value");
      seed = Number(rawSeed);
      index += 1;
      continue;
    }
    if (argument === "--contracts-dir") {
      const rawDirectory = arguments_[index + 1];
      if (!rawDirectory) throw new Error("--contracts-dir requires a value");
      contractsDirectory = rawDirectory;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  if (seed !== undefined) planScenario(seed);
  return {
    seeds: seed === undefined ? [...DEFAULT_SEEDS] : [seed],
    contractsDirectory: path.resolve(contractsDirectory),
  };
}

function timestampForPath(): string {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

async function runCommand(
  command: string,
  arguments_: string[],
  options: {
    cwd: string;
    env?: NodeJS.ProcessEnv;
    quiet?: boolean;
  }
): Promise<string> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      if (!options.quiet) process.stdout.write(text);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      if (!options.quiet) process.stderr.write(text);
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) resolve(output);
      else
        reject(
          new Error(
            `${command} ${arguments_.join(
              " "
            )} exited with code ${code}\n${output}`
          )
        );
    });
  });
}

function startProcess(
  command: string,
  arguments_: string[],
  cwd: string,
  logPath: string
): RunningProcess {
  const log = createWriteStream(logPath, { flags: "a" });
  const child = spawn(command, arguments_, {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  const finished = new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => {
      log.end();
      resolve(code);
    });
  });
  return { child, finished };
}

async function stopProcess(
  process_: RunningProcess | undefined
): Promise<void> {
  if (!process_ || process_.child.exitCode !== null) return;
  process_.child.kill("SIGTERM");
  const stopped = await Promise.race([
    process_.finished.then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (!stopped && process_.child.exitCode === null) {
    process_.child.kill("SIGKILL");
    await process_.finished;
  }
}

async function portIsAvailable(port: number): Promise<boolean> {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    server.listen(port, "127.0.0.1", () => {
      server.close((error) => (error ? reject(error) : resolve(true)));
    });
  });
}

async function assertPortsAvailable(): Promise<void> {
  const occupied: number[] = [];
  for (const port of REQUIRED_PORTS) {
    if (!(await portIsAvailable(port))) occupied.push(port);
  }
  if (occupied.length > 0) {
    throw new Error(
      `E2E ports already in use: ${occupied.join(
        ", "
      )}. Stop the conflicting services and retry.`
    );
  }
}

async function detectComposeCli(): Promise<ComposeCli> {
  try {
    await runCommand("docker", ["compose", "version"], {
      cwd: repositoryDirectory,
      quiet: true,
    });
    return { command: "docker", prefix: ["compose"] };
  } catch {
    try {
      await runCommand("docker-compose", ["version"], {
        cwd: repositoryDirectory,
        quiet: true,
      });
      return { command: "docker-compose", prefix: [] };
    } catch {
      throw new Error(
        "Docker Compose is unavailable. Install either the Docker Compose plugin or docker-compose."
      );
    }
  }
}

function composeArguments(...arguments_: string[]): string[] {
  return [
    ...composeCli.prefix,
    "-f",
    composeFile,
    "-p",
    COMPOSE_PROJECT,
    ...arguments_,
  ];
}

async function waitUntil(
  description: string,
  timeoutMs: number,
  check: () => Promise<boolean>
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const detail = lastError instanceof Error ? `: ${lastError.message}` : "";
  throw new Error(`Timed out waiting for ${description}${detail}`);
}

async function waitForHardhat(
  provider: JsonRpcProvider,
  process_: RunningProcess
): Promise<void> {
  const deadline = Date.now() + 60_000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    if (process_.child.exitCode !== null) {
      throw new Error(
        `Hardhat exited before its RPC became ready (exit code ${process_.child.exitCode}); see hardhat.log`
      );
    }
    try {
      const network = await provider.getNetwork();
      if (network.chainId === CHAIN_ID) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const detail = lastError instanceof Error ? `: ${lastError.message}` : "";
  throw new Error(`Timed out waiting for Hardhat JSON-RPC${detail}`);
}

async function waitForGraphNode(): Promise<void> {
  await waitUntil("Graph Node admin API", 120_000, async () => {
    const response = await fetch(GRAPH_ADMIN_URL);
    return response.status < 500;
  });
  await waitUntil("IPFS API", 60_000, async () => {
    const response = await fetch(`${IPFS_URL}/api/v0/id`, { method: "POST" });
    return response.ok;
  });
}

async function readArtifact(filePath: string): Promise<HardhatArtifact> {
  const parsed = JSON.parse(
    await readFile(filePath, "utf8")
  ) as HardhatArtifact;
  assert(Array.isArray(parsed.abi), `Artifact has no ABI: ${filePath}`);
  assert(
    parsed.bytecode?.startsWith("0x"),
    `Artifact has no bytecode: ${filePath}`
  );
  return parsed;
}

async function loadArtifacts(
  contractsDirectory: string
): Promise<ContractArtifacts> {
  const artifact = (...segments: string[]): string =>
    path.join(contractsDirectory, "artifacts/contracts", ...segments);
  return {
    launchpad: await readArtifact(
      artifact("SushiLaunchpad.sol", "SushiLaunchpad.json")
    ),
    launchToken: await readArtifact(
      artifact("SushiLaunchpadToken.sol", "SushiLaunchpadToken.json")
    ),
    quoteToken: await readArtifact(
      artifact("test/MockSushiV3.sol", "MockERC20.json")
    ),
    priceFeed: await readArtifact(
      artifact("test/MockSushiV3.sol", "MockChainlinkAggregator.json")
    ),
    factory: await readArtifact(
      artifact("test/MockSushiV3.sol", "MockSushiV3Factory.json")
    ),
    weth: await readArtifact(artifact("test/MockSushiV3.sol", "MockWETH.json")),
    positionManager: await readArtifact(
      artifact("test/MockSushiV3.sol", "MockPositionManager.json")
    ),
    pool: await readArtifact(
      artifact("test/MockSushiV3.sol", "MockSushiV3Pool.json")
    ),
  };
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function assertAbiMatches(artifact: HardhatArtifact): Promise<void> {
  const pinned = JSON.parse(
    await readFile(
      path.join(packageDirectory, "abis/SushiLaunchpad.json"),
      "utf8"
    )
  ) as unknown;
  if (canonicalJson(pinned) !== canonicalJson(artifact.abi)) {
    throw new Error(
      "The compiled SushiLaunchpad ABI differs from abis/SushiLaunchpad.json. Refresh and review the subgraph ABI before running E2E."
    );
  }
}

async function deploy(
  artifact: HardhatArtifact,
  signer: Signer,
  arguments_: unknown[] = []
): Promise<Contract> {
  const contract = await new ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  ).deploy(...arguments_);
  await contract.waitForDeployment();
  return contract as unknown as Contract;
}

async function deployFixture(
  provider: JsonRpcProvider,
  signers: Signer[],
  artifacts: ContractArtifacts,
  plan: ScenarioPlan
): Promise<Fixture> {
  const owner = signers[plan.actors.owner]!;
  const recipient = signers[plan.actors.protocolRecipients[0]]!;
  const quoteTokenTemplate = await deploy(artifacts.quoteToken, owner, [
    "Quote Token",
    "QUOTE",
    18,
  ]);
  const runtimeCode = await provider.getCode(
    await quoteTokenTemplate.getAddress()
  );
  const quoteTokens = new Map<string, Contract>();
  for (const address of [LOW_QUOTE_TOKEN_ADDRESS, HIGH_QUOTE_TOKEN_ADDRESS]) {
    await provider.send("hardhat_setCode", [address, runtimeCode]);
    quoteTokens.set(
      address,
      new Contract(address, artifacts.quoteToken.abi, owner)
    );
  }
  const factory = await deploy(artifacts.factory, owner);
  const weth = await deploy(artifacts.weth, owner);
  const positionManager = await deploy(artifacts.positionManager, owner, [
    await factory.getAddress(),
    await weth.getAddress(),
  ]);
  await (await positionManager.setConsumptionBps(plan.consumptionBps)).wait();
  const launchpad = await deploy(artifacts.launchpad, owner, [
    await owner.getAddress(),
    await recipient.getAddress(),
    await factory.getAddress(),
    await positionManager.getAddress(),
  ]);
  const deploymentReceipt = await launchpad.deploymentTransaction()!.wait();
  assert(deploymentReceipt, "Launchpad deployment did not produce a receipt");
  for (const address of [LOW_QUOTE_TOKEN_ADDRESS, HIGH_QUOTE_TOKEN_ADDRESS]) {
    const priceFeed = await deploy(artifacts.priceFeed, owner, [
      8,
      100_000_000n,
    ]);
    await (
      await launchpad.setQuoteTokenPriceFeed(
        address,
        await priceFeed.getAddress()
      )
    ).wait();
  }

  return {
    launchpad,
    launchpadAddress: (await launchpad.getAddress()).toLowerCase(),
    launchpadDeploymentBlock: deploymentReceipt.blockNumber,
    quoteTokens,
    factory,
    positionManager,
    positionManagerAddress: (await positionManager.getAddress()).toLowerCase(),
    poolArtifact: artifacts.pool,
    tokenArtifact: artifacts.launchToken,
  };
}

async function renderManifest(
  fixture: Fixture,
  seedDirectory: string
): Promise<void> {
  const configurationPath = path.join(seedDirectory, "manifest.json");
  await writeFile(
    configurationPath,
    `${JSON.stringify(
      {
        launchpad: {
          deployments: [
            {
              name: "SushiLaunchpad",
              network: "hardhat",
              chainId: CHAIN_ID.toString(),
              address: fixture.launchpadAddress,
              startBlock: fixture.launchpadDeploymentBlock,
            },
          ],
        },
      },
      null,
      2
    )}\n`
  );
  const manifest = await runCommand(
    "pnpm",
    ["exec", "mustache", configurationPath, "template.yaml"],
    { cwd: packageDirectory, quiet: true }
  );
  await writeFile(path.join(packageDirectory, "subgraph.yaml"), manifest);
}

async function deploySubgraph(seed: number): Promise<string> {
  const name = `sushiswap/launchpad-e2e-${seed}`;
  await runCommand("pnpm", ["exec", "graph", "codegen", "subgraph.yaml"], {
    cwd: packageDirectory,
  });
  await runCommand("pnpm", ["exec", "graph", "build", "subgraph.yaml"], {
    cwd: packageDirectory,
  });
  await runCommand(
    "pnpm",
    ["exec", "graph", "create", "--node", GRAPH_ADMIN_URL, name],
    { cwd: packageDirectory }
  );
  await runCommand(
    "pnpm",
    [
      "exec",
      "graph",
      "deploy",
      "--node",
      GRAPH_ADMIN_URL,
      "--ipfs",
      IPFS_URL,
      "--version-label",
      `seed-${seed}`,
      name,
      "subgraph.yaml",
    ],
    { cwd: packageDirectory }
  );
  return name;
}

function eventArguments(
  parsed: ReturnType<Interface["parseLog"]>
): Record<string, unknown> {
  assert(parsed, "Expected a parsed Launchpad event");
  return Object.fromEntries(
    parsed.fragment.inputs.map((input, index) => [
      input.name,
      parsed.args[index],
    ])
  );
}

async function executeScenario(
  provider: JsonRpcProvider,
  signers: Signer[],
  fixture: Fixture,
  plan: ScenarioPlan
): Promise<ScenarioExecution> {
  const events: IndexedEvent[] = [];
  let launchpadObservation: LaunchObservation | null = null;
  const tokens = new Map<string, LaunchedToken>();
  const blockTimestamps = new Map<number, number>();
  const launchpadInterface = new Interface(
    fixture.launchpad.interface.fragments
  );

  // The data source starts at deployment, before scenario execution. Include
  // the quote-token feed configuration logs emitted while preparing the
  // fixture so the independent expected model covers the full indexed range.
  const setupLogs = await provider.getLogs({
    address: fixture.launchpadAddress,
    fromBlock: fixture.launchpadDeploymentBlock,
    toBlock: "latest",
  });
  for (const log of setupLogs) {
    const parsed = launchpadInterface.parseLog({
      topics: [...log.topics],
      data: log.data,
    });
    if (!parsed) continue;
    let timestamp = blockTimestamps.get(log.blockNumber);
    if (timestamp === undefined) {
      const block = await provider.getBlock(log.blockNumber);
      assert(block, `Missing block ${log.blockNumber}`);
      timestamp = block.timestamp;
      blockTimestamps.set(log.blockNumber, timestamp);
    }
    events.push({
      name: parsed.name,
      args: eventArguments(parsed),
      transactionHash: log.transactionHash.toLowerCase(),
      logIndex: log.index,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash.toLowerCase(),
      timestamp,
    });
  }

  const recordReceipt = async (
    transaction: TransactionResponse
  ): Promise<TransactionReceipt> => {
    const receipt = await transaction.wait();
    assert(receipt, `Transaction ${transaction.hash} has no receipt`);
    let timestamp = blockTimestamps.get(receipt.blockNumber);
    if (timestamp === undefined) {
      const block = await provider.getBlock(receipt.blockNumber);
      assert(block, `Missing block ${receipt.blockNumber}`);
      timestamp = block.timestamp;
      blockTimestamps.set(receipt.blockNumber, timestamp);
    }

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== fixture.launchpadAddress) continue;
      const parsed = launchpadInterface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (!parsed) continue;
      events.push({
        name: parsed.name,
        args: eventArguments(parsed),
        transactionHash: receipt.hash.toLowerCase(),
        logIndex: log.index,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash.toLowerCase(),
        timestamp,
      });
    }
    return receipt;
  };

  const sendLaunch = async (
    action: LaunchPlan
  ): Promise<TransactionResponse> => {
    const block = await provider.getBlock("latest");
    assert(block, "Hardhat returned no latest block");
    const currentLaunchFee = BigInt(await fixture.launchpad.launchFee());
    assert.equal(
      currentLaunchFee,
      action.launchFee,
      `Planned launch fee drifted for ${action.tokenKey}`
    );
    const connected = fixture.launchpad.connect(
      signers[action.creatorAccount]!
    ) as Contract;
    const deadline = BigInt(block.timestamp + 3_600);
    if (action.initialBuyAmount === 0n) {
      return await connected.launch(
        { name: action.name, symbol: action.symbol },
        action.quoteToken,
        deadline,
        { value: action.launchFee }
      );
    }
    const quoteToken = fixture.quoteTokens.get(action.quoteToken);
    assert(quoteToken, `Unknown quote token ${action.quoteToken}`);
    const creator = signers[action.creatorAccount]!;
    const creatorAddress = await creator.getAddress();
    await (
      await quoteToken.mint(creatorAddress, action.initialBuyAmount)
    ).wait();
    const creatorQuoteToken = quoteToken.connect(creator) as Contract;
    await (
      await creatorQuoteToken.approve(
        fixture.launchpadAddress,
        action.initialBuyAmount
      )
    ).wait();
    return await connected.launchAndBuy(
      { name: action.name, symbol: action.symbol },
      action.quoteToken,
      deadline,
      {
        amountIn: action.initialBuyAmount,
        amountOutMinimum: 0,
        recipient: creatorAddress,
      },
      { value: action.launchFee }
    );
  };

  const finalizeLaunch = async (
    action: LaunchPlan,
    transaction: TransactionResponse
  ): Promise<void> => {
    const receipt = await recordReceipt(transaction);
    const launchEvents = events.filter(
      (event) =>
        event.transactionHash === receipt.hash.toLowerCase() &&
        event.name === "TokenLaunched"
    );
    assert.equal(
      launchEvents.length,
      1,
      `Missing TokenLaunched for ${action.tokenKey}`
    );
    const launchEvent = launchEvents[0]!;
    const quoteToken = String(launchEvent.args.quoteToken).toLowerCase();
    assert.equal(
      quoteToken,
      action.quoteToken,
      `TokenLaunched quote token drifted for ${action.tokenKey}`
    );
    assert(
      fixture.quoteTokens.has(quoteToken),
      `Unknown quote token for ${action.tokenKey}: ${quoteToken}`
    );
    const positionEvents = events.filter(
      (event) =>
        event.transactionHash === receipt.hash.toLowerCase() &&
        event.name === "PositionCreated"
    );
    assert.equal(
      positionEvents.length,
      1,
      `Unexpected position count for ${action.tokenKey}`
    );
    const launchpadEvents = events.filter(
      (event) => event.transactionHash === receipt.hash.toLowerCase()
    );
    const launchIndex = launchpadEvents.findIndex(
      (event) => event.name === "TokenLaunched"
    );
    const positionIndex = launchpadEvents.findIndex(
      (event) => event.name === "PositionCreated"
    );
    const buyIndex = launchpadEvents.findIndex(
      (event) => event.name === "InitialBuyExecuted"
    );
    assert(launchIndex >= 0 && positionIndex > launchIndex);
    assert.equal(buyIndex > positionIndex, action.initialBuyAmount > 0n);
    const address = String(launchEvent.args.token).toLowerCase();
    const poolAddress = String(launchEvent.args.pool).toLowerCase();
    const token = new Contract(address, fixture.tokenArtifact.abi, signers[0]);
    if (launchpadObservation === null) {
      const pool = new Contract(
        poolAddress,
        fixture.poolArtifact.abi,
        signers[0]
      );
      launchpadObservation = {
        decimals: Number(await token.decimals()),
        totalSupply: BigInt(await token.totalSupply()),
        poolFee: Number(await pool.fee()),
        poolTickSpacing: Number(await pool.tickSpacing()),
      };
    }
    tokens.set(action.tokenKey, {
      tokenKey: action.tokenKey,
      address,
      pool: poolAddress,
      quoteToken,
      creatorAccount: action.creatorAccount,
      positionIds: positionEvents.map((event) =>
        BigInt(event.args.positionId as bigint)
      ),
      token,
    });
  };

  const transact = async (
    action: Exclude<ScenarioAction, { kind: "sameBlock" }>
  ) => {
    if (action.kind === "launch") {
      const transaction = await sendLaunch(action);
      await finalizeLaunch(action, transaction);
      return;
    }
    if (action.kind === "setDefaultSushiFeeBps") {
      await recordReceipt(
        await fixture.launchpad.setDefaultSushiFeeBps(action.value)
      );
      return;
    }
    if (action.kind === "setProtocolReserveBps") {
      await recordReceipt(
        await fixture.launchpad.setProtocolReserveBps(action.value)
      );
      return;
    }
    if (action.kind === "setProtocolRecipient") {
      await recordReceipt(
        await fixture.launchpad.setProtocolRecipient(
          await signers[action.account]!.getAddress()
        )
      );
      return;
    }
    if (action.kind === "setLaunchFee") {
      await recordReceipt(await fixture.launchpad.setLaunchFee(action.value));
      return;
    }
    if (action.kind === "transferCreator") {
      const token = tokens.get(action.tokenKey);
      assert(token, `Unknown planned token ${action.tokenKey}`);
      const connected = fixture.launchpad.connect(
        signers[token.creatorAccount]!
      ) as Contract;
      await recordReceipt(
        await connected.transferCreator(
          token.address,
          await signers[action.newCreatorAccount]!.getAddress()
        )
      );
      token.creatorAccount = action.newCreatorAccount;
      return;
    }
    if (action.kind === "setTokenSushiFeeBps") {
      const token = tokens.get(action.tokenKey);
      assert(token, `Unknown planned token ${action.tokenKey}`);
      await recordReceipt(
        await fixture.launchpad.setSushiFeeBps(token.address, action.value)
      );
      return;
    }
    if (action.kind === "distributeFees") {
      const token = tokens.get(action.tokenKey);
      assert(token, `Unknown planned token ${action.tokenKey}`);
      const pool = new Contract(
        token.pool,
        fixture.poolArtifact.abi,
        signers[0]
      );
      const tokenIs0 =
        String(await pool.token0()).toLowerCase() ===
        token.address.toLowerCase();
      const quoteToken = fixture.quoteTokens.get(token.quoteToken);
      assert(quoteToken, `Unknown quote token ${token.quoteToken}`);
      await (await quoteToken.mint(token.pool, action.quoteAmount)).wait();
      await (
        await fixture.positionManager.seedFees(
          token.positionIds[0],
          tokenIs0 ? action.tokenAmount : action.quoteAmount,
          tokenIs0 ? action.quoteAmount : action.tokenAmount
        )
      ).wait();
      const connected = fixture.launchpad.connect(
        signers[action.callerAccount]!
      ) as Contract;
      await recordReceipt(await connected.distributeFees(token.address));
      return;
    }
    if (action.kind === "withdrawLaunchFees") {
      await recordReceipt(await fixture.launchpad.withdrawLaunchFees());
      return;
    }
    if (action.kind === "advanceTime") {
      await provider.send("evm_increaseTime", [action.seconds]);
      await provider.send("evm_mine", []);
      return;
    }
    if (action.kind === "withdrawReserve") {
      const token = tokens.get(action.tokenKey);
      assert(token, `Unknown planned token ${action.tokenKey}`);
      await recordReceipt(
        await fixture.launchpad.withdrawProtocolReserve(token.address)
      );
      return;
    }
    const exhaustive: never = action;
    throw new Error(`Unhandled action ${(exhaustive as ScenarioAction).kind}`);
  };

  for (const action of plan.actions) {
    if (action.kind !== "sameBlock") {
      await transact(action);
      continue;
    }

    const [launch, defaultUpdate, reserveUpdate] = action.actions;
    await provider.send("evm_setAutomine", [false]);
    try {
      const launchTransaction = await sendLaunch(launch);
      const ownerAddress = await signers[0]!.getAddress();
      const ownerNonce = await provider.getTransactionCount(
        ownerAddress,
        "pending"
      );
      const defaultTransaction = await fixture.launchpad.setDefaultSushiFeeBps(
        defaultUpdate.value,
        { nonce: ownerNonce }
      );
      const reserveTransaction = await fixture.launchpad.setProtocolReserveBps(
        reserveUpdate.value,
        { nonce: ownerNonce + 1 }
      );
      await provider.send("evm_mine", []);
      await finalizeLaunch(launch, launchTransaction);
      await recordReceipt(defaultTransaction);
      await recordReceipt(reserveTransaction);
    } finally {
      await provider.send("evm_setAutomine", [true]);
    }
  }

  return {
    events,
    launchpadObservation,
    finalBlock: await provider.getBlockNumber(),
  };
}

async function graphQl<T>(endpoint: string, query: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    throw new Error(
      `GraphQL HTTP ${response.status}: ${await response.text()}`
    );
  }
  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (payload.errors?.length || !payload.data) {
    throw new Error(
      `GraphQL query failed: ${
        payload.errors?.map((error) => error.message).join("; ") ?? "no data"
      }`
    );
  }
  return payload.data;
}

async function waitForIndexedHead(
  endpoint: string,
  finalBlock: number
): Promise<void> {
  await waitUntil(`subgraph head block ${finalBlock}`, 120_000, async () => {
    const data = await graphQl<{
      _meta: { block: { number: number }; hasIndexingErrors: boolean } | null;
    }>(
      endpoint,
      "query E2EHead { _meta { block { number } hasIndexingErrors } }"
    );
    if (data._meta?.hasIndexingErrors) {
      throw new Error("Subgraph reports indexing errors");
    }
    return (data._meta?.block.number ?? -1) >= finalBlock;
  });
}

const snapshotQuery = `
  query E2ESnapshot {
    launchpads(first: 1000, orderBy: id) {
      id chainId address positionManager protocolRecipient launchFee initialFdvUsd
      defaultSushiFeeBps protocolReserveBps
      launchTokenDecimals launchTokenTotalSupply launchPoolFee
      launchPoolTickSpacing
      launches { id } quoteTokenPriceFeeds { id } launchFeeWithdrawals { id }
    }
    launches(first: 1000, orderBy: id) {
      id chainId launchpad { id }
      token initialCreator creator quoteToken pool launchTokenIsToken0
      name symbol decimals totalSupply initialFdvUsd startTick
      poolFee poolTickSpacing positionManager positionId
      tickLower tickUpper tokenDesired tokenUsed liquidity sushiFeeBps
      reserveBps reserveAmount reserveUnlockAt reserveWithdrawn
      reserveWithdrawal { id } initialBuy { id }
      feeDistributions { id } creatorTransfers { id }
      creationTransactionHash creationLogIndex
      positionCreationLogIndex creationBlockNumber creationBlockHash
      createdAt
    }
    pendingLaunches(first: 1000, orderBy: id) {
      id chainId launchpad { id }
      token creator quoteToken pool launchTokenIsToken0
      name symbol startTick
      sushiFeeBps reserveBps reserveAmount reserveUnlockAt
      creationTransactionHash creationLogIndex creationBlockNumber
      creationBlockHash createdAt
    }
    quoteTokenPriceFeeds(first: 1000, orderBy: id) {
      id chainId launchpad { id } quoteToken priceFeed
      updatedTransactionHash updatedLogIndex updatedBlockNumber updatedBlockHash
      updatedAt
    }
    creatorTransfers(first: 1000, orderBy: id) {
      id chainId launch { id } previousCreator newCreator transactionHash
      logIndex blockNumber blockHash timestamp
    }
    initialBuys(first: 1000, orderBy: id) {
      id chainId launch { id } creator recipient quoteToken pool
      amountIn amountOut transactionHash logIndex blockNumber blockHash timestamp
    }
    feeDistributions(first: 1000, orderBy: id) {
      id chainId launch { id } pool caller sushiRecipient creatorRecipient
      sushiFeeBps amount0Collected amount1Collected amount0ToSushi
      amount1ToSushi amount0ToCreator amount1ToCreator transactionHash
      logIndex blockNumber blockHash timestamp
    }
    reserveWithdrawals(first: 1000, orderBy: id) {
      id chainId launch { id } recipient amount transactionHash
      logIndex blockNumber blockHash timestamp
    }
    launchFeeWithdrawals(first: 1000, orderBy: id) {
      id chainId launchpad { id } recipient amount transactionHash
      logIndex blockNumber blockHash timestamp
    }
  }
`;

async function runSeed(
  seed: number,
  provider: JsonRpcProvider,
  signers: Signer[],
  artifacts: ContractArtifacts,
  runDirectory: string
): Promise<void> {
  const seedDirectory = path.join(runDirectory, `seed-${seed}`);
  await mkdir(seedDirectory, { recursive: true });
  const plan = planScenario(seed);
  await writeFile(path.join(seedDirectory, "plan.json"), stringifyPlan(plan));
  process.stdout.write(`\nSeed ${seed}: deploying fixture\n`);
  const fixture = await deployFixture(provider, signers, artifacts, plan);
  await renderManifest(fixture, seedDirectory);
  const subgraphName = await deploySubgraph(seed);
  const endpoint = `${GRAPH_QUERY_URL}/subgraphs/name/${subgraphName}`;

  process.stdout.write(
    `Seed ${seed}: executing ${plan.actions.length} actions\n`
  );
  const execution = await executeScenario(provider, signers, fixture, plan);
  await writeFile(
    path.join(seedDirectory, "trace.json"),
    `${JSON.stringify(
      execution.events,
      (_key, value: unknown) =>
        typeof value === "bigint" ? value.toString() : value,
      2
    )}\n`
  );
  await waitForIndexedHead(endpoint, execution.finalBlock);

  const actual = normalizeSnapshot(
    await graphQl<EntitySnapshot>(endpoint, snapshotQuery)
  );
  const expected = buildExpectedSnapshot({
    chainId: CHAIN_ID,
    launchpadAddress: fixture.launchpadAddress,
    positionManager: fixture.positionManagerAddress,
    protocolRecipient: String(await fixture.launchpad.protocolRecipient()),
    launchFee: BigInt(await fixture.launchpad.launchFee()),
    initialFdvUsd: BigInt(await fixture.launchpad.INITIAL_FDV_USD()),
    defaultSushiFeeBps: Number(await fixture.launchpad.defaultSushiFeeBps()),
    protocolReserveBps: Number(await fixture.launchpad.protocolReserveBps()),
    launchpadObservation: execution.launchpadObservation,
    events: execution.events,
  });
  await writeFile(
    path.join(seedDirectory, "graphql.json"),
    `${JSON.stringify(actual, null, 2)}\n`
  );
  await writeFile(
    path.join(seedDirectory, "expected.json"),
    `${JSON.stringify(expected, null, 2)}\n`
  );
  assert.deepStrictEqual(
    actual,
    expected,
    `Subgraph projection mismatch for seed ${seed}`
  );
  process.stdout.write(`Seed ${seed}: projection verified\n`);
}

async function captureComposeLogs(runDirectory: string): Promise<void> {
  try {
    const logs = await runCommand(
      composeCli.command,
      composeArguments("logs", "--no-color"),
      { cwd: repositoryDirectory, quiet: true }
    );
    await writeFile(path.join(runDirectory, "docker-compose.log"), logs);
  } catch (error) {
    await writeFile(
      path.join(runDirectory, "docker-compose.log"),
      `${error instanceof Error ? error.stack : String(error)}\n`
    );
  }
}

async function composeDown(): Promise<void> {
  await runCommand(
    composeCli.command,
    composeArguments("down", "--volumes", "--remove-orphans"),
    { cwd: repositoryDirectory, quiet: true }
  ).catch(() => undefined);
}

async function main(): Promise<void> {
  const options = parseOptions();
  options.contractsDirectory = await realpath(options.contractsDirectory).catch(
    () => {
      throw new Error(
        `Sushi Launchpad checkout not found at ${options.contractsDirectory}. Set LAUNCHPAD_CONTRACTS_DIR or pass --contracts-dir.`
      );
    }
  );
  const runDirectory = path.join(
    packageDirectory,
    ".e2e-artifacts",
    timestampForPath()
  );
  await mkdir(runDirectory, { recursive: true });
  composeCli = await detectComposeCli();
  await assertPortsAvailable();

  process.stdout.write(
    "Compiling the configured Launchpad contract checkout\n"
  );
  await runCommand("pnpm", ["compile"], {
    cwd: options.contractsDirectory,
  });
  const artifacts = await loadArtifacts(options.contractsDirectory);
  await assertAbiMatches(artifacts.launchpad);

  let hardhat: RunningProcess | undefined;
  let composeStarted = false;
  let cleaningUp = false;
  const runtimeHardhatConfig = path.join(
    options.contractsDirectory,
    "cache/launchpad-e2e.config.ts"
  );
  await mkdir(path.dirname(runtimeHardhatConfig), { recursive: true });
  await writeFile(
    runtimeHardhatConfig,
    await readFile(hardhatConfigSource, "utf8")
  );
  const cleanup = async (): Promise<void> => {
    if (cleaningUp) return;
    cleaningUp = true;
    if (composeStarted) await captureComposeLogs(runDirectory);
    if (composeStarted) await composeDown();
    await stopProcess(hardhat);
    await rm(runtimeHardhatConfig, { force: true });
  };
  const interrupt = (signal: NodeJS.Signals) => {
    void cleanup().finally(() => {
      process.kill(process.pid, signal);
    });
  };
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", interrupt);

  try {
    hardhat = startProcess(
      "pnpm",
      [
        "exec",
        "hardhat",
        "--config",
        runtimeHardhatConfig,
        "--network",
        "hardhatMainnet",
        "node",
        "--hostname",
        "0.0.0.0",
      ],
      options.contractsDirectory,
      path.join(runDirectory, "hardhat.log")
    );
    const provider = new JsonRpcProvider(RPC_URL);
    await waitForHardhat(provider, hardhat);

    composeStarted = true;
    await runCommand(composeCli.command, composeArguments("up", "-d"), {
      cwd: repositoryDirectory,
    });
    await waitForGraphNode();

    const signers: Signer[] = [];
    for (let index = 0; index < 8; index += 1) {
      signers.push(await provider.getSigner(index));
    }
    for (const seed of options.seeds) {
      await runSeed(seed, provider, signers, artifacts, runDirectory);
    }

    process.stdout.write(
      `\nAll ${options.seeds.length} E2E seed(s) passed. Artifacts: ${runDirectory}\n`
    );
  } catch (error) {
    process.stderr.write(
      `\nE2E failed. Diagnostics: ${runDirectory}\n${
        error instanceof Error ? error.stack : String(error)
      }\n`
    );
    process.exitCode = 1;
  } finally {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", interrupt);
    await cleanup();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`
  );
  process.exitCode = 1;
});
