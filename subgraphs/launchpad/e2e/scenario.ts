export const DEFAULT_SEEDS = [101, 202, 303] as const;

export const CHAIN_ID = 31_337n;
export const UNIT = 10n ** 18n;
export const INITIAL_LAUNCH_FEE = 500_000_000_000_000n;
export const INITIAL_SUSHI_FEE_BPS = 7_000;
export const INITIAL_RESERVE_BPS = 300;
export const RESERVE_LOCK_SECONDS = 365 * 24 * 60 * 60;

export const LOW_QUOTE_TOKEN_ADDRESS =
  "0x0000000000000000000000000000000000001000";
export const HIGH_QUOTE_TOKEN_ADDRESS =
  "0xfffffffffffffffffffffffffffffffffffffffe";

export interface LaunchPlan {
  kind: "launch";
  tokenKey: string;
  creatorAccount: number;
  quoteToken: string;
  name: string;
  symbol: string;
  initialBuyAmount: bigint;
  launchFee: bigint;
}

export type ScenarioAction =
  | LaunchPlan
  | {
      kind: "sameBlock";
      actions: [
        LaunchPlan,
        { kind: "setDefaultSushiFeeBps"; value: number },
        { kind: "setProtocolReserveBps"; value: number }
      ];
    }
  | { kind: "setDefaultSushiFeeBps"; value: number }
  | { kind: "setProtocolReserveBps"; value: number }
  | { kind: "setProtocolRecipient"; account: number }
  | { kind: "setLaunchFee"; value: bigint }
  | { kind: "transferCreator"; tokenKey: string; newCreatorAccount: number }
  | { kind: "setTokenSushiFeeBps"; tokenKey: string; value: number }
  | {
      kind: "distributeFees";
      tokenKey: string;
      callerAccount: number;
      quoteAmount: bigint;
      tokenAmount: bigint;
    }
  | { kind: "withdrawLaunchFees" }
  | { kind: "advanceTime"; seconds: number }
  | { kind: "withdrawReserve"; tokenKey: string };

export interface ScenarioPlan {
  seed: number;
  consumptionBps: number;
  actors: {
    owner: 0;
    protocolRecipients: [1, 2];
    creators: [3, 4, 5];
    callers: [6, 7];
  };
  actions: ScenarioAction[];
  intentionallyUnwithdrawnToken: string;
}

class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  }

  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(values: readonly T[]): T {
    return values[this.int(0, values.length - 1)]!;
  }

  shuffle<T>(values: readonly T[]): T[] {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const other = this.int(0, index);
      [shuffled[index], shuffled[other]] = [shuffled[other]!, shuffled[index]!];
    }
    return shuffled;
  }
}

function launchPlan(
  random: SeededRandom,
  index: number,
  creatorAccount: number
): LaunchPlan {
  return {
    kind: "launch",
    tokenKey: `token-${index}`,
    creatorAccount,
    quoteToken:
      index % 2 === 0 ? HIGH_QUOTE_TOKEN_ADDRESS : LOW_QUOTE_TOKEN_ADDRESS,
    name: `Launchpad Agent ${index + 1}`,
    symbol: `LPA${index + 1}`,
    initialBuyAmount: index % 2 === 1 ? BigInt(random.int(1, 5)) * UNIT : 0n,
    launchFee: INITIAL_LAUNCH_FEE,
  };
}

function distribution(
  random: SeededRandom,
  tokenKey: string,
  callerAccount: number
): ScenarioAction {
  return {
    kind: "distributeFees",
    tokenKey,
    callerAccount,
    quoteAmount: BigInt(random.int(51, 500)),
    tokenAmount: BigInt(random.int(51, 500)),
  };
}

export function planScenario(seed: number): ScenarioPlan {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
    throw new Error(
      `Seed must be an unsigned 32-bit integer, received ${seed}`
    );
  }

  const random = new SeededRandom(seed);
  const creators = random.shuffle([3, 3, 4, 5]);
  const launches = creators.map((creator, index) =>
    launchPlan(random, index, creator)
  );
  const newDefault = random.pick([1_500, 2_500, 4_500, 6_000, 8_000]);
  const newReserve = random.pick([100, 500, 750, 1_000]);
  const finalDefault = random.pick(
    [1_000, 3_500, 5_500, 9_000].filter((value) => value !== newDefault)
  );
  const finalReserve = random.pick(
    [0, 200, 600, 900].filter((value) => value !== newReserve)
  );
  const newLaunchFee = random.pick([
    100_000_000_000_000n,
    700_000_000_000_000n,
    1_000_000_000_000_000n,
  ]);

  const firstLaunch = launches[0]!;
  const remaining = random.shuffle(launches.slice(1));
  const firstRemaining = remaining[0]!;
  const secondRemaining = remaining[1]!;
  const finalLaunch = remaining[2]!;

  const actions: ScenarioAction[] = [
    {
      kind: "sameBlock",
      actions: [
        firstLaunch,
        { kind: "setDefaultSushiFeeBps", value: newDefault },
        { kind: "setProtocolReserveBps", value: newReserve },
      ],
    },
  ];

  if (random.int(0, 1) === 0) {
    actions.push({ kind: "setLaunchFee", value: newLaunchFee });
    firstRemaining.launchFee = newLaunchFee;
    secondRemaining.launchFee = newLaunchFee;
    finalLaunch.launchFee = newLaunchFee;
    actions.push(firstRemaining, secondRemaining);
  } else {
    actions.push(firstRemaining);
    actions.push({ kind: "setLaunchFee", value: newLaunchFee });
    secondRemaining.launchFee = newLaunchFee;
    finalLaunch.launchFee = newLaunchFee;
    actions.push(secondRemaining);
  }

  actions.push({ kind: "withdrawLaunchFees" });
  actions.push(finalLaunch);
  actions.push({ kind: "withdrawLaunchFees" });
  actions.push(
    { kind: "setDefaultSushiFeeBps", value: finalDefault },
    { kind: "setProtocolReserveBps", value: finalReserve }
  );
  actions.push({
    kind: "transferCreator",
    tokenKey: firstLaunch.tokenKey,
    newCreatorAccount: [3, 4, 5].find(
      (account) => account !== firstLaunch.creatorAccount
    )!,
  });

  const firstTokenFee = random.pick([1_234, 3_333, 5_000, 8_765]);
  const secondTokenFee = random.pick([777, 2_222, 6_666, 9_999]);
  actions.push({
    kind: "setTokenSushiFeeBps",
    tokenKey: firstLaunch.tokenKey,
    value: firstTokenFee,
  });
  actions.push(
    distribution(
      random,
      firstLaunch.tokenKey,
      random.pick([6, 7])
    )
  );
  actions.push({ kind: "setProtocolRecipient", account: 2 });
  actions.push(
    distribution(
      random,
      firstLaunch.tokenKey,
      random.pick([6, 7])
    )
  );
  actions.push({
    kind: "setTokenSushiFeeBps",
    tokenKey: firstRemaining.tokenKey,
    value: secondTokenFee,
  });
  actions.push(
    distribution(
      random,
      firstRemaining.tokenKey,
      random.pick([6, 7])
    )
  );

  const tokenKeys = launches.map((launch) => launch.tokenKey);
  const intentionallyUnwithdrawnToken = random.pick(tokenKeys);
  const withdrawals = random.shuffle(
    tokenKeys.filter((tokenKey) => tokenKey !== intentionallyUnwithdrawnToken)
  );
  actions.push({
    kind: "advanceTime",
    seconds: RESERVE_LOCK_SECONDS + 100,
  });
  for (const tokenKey of withdrawals) {
    actions.push({ kind: "withdrawReserve", tokenKey });
  }

  const plan: ScenarioPlan = {
    seed,
    consumptionBps: [10_000, 9_999, 9_750][seed % 3]!,
    actors: {
      owner: 0,
      protocolRecipients: [1, 2],
      creators: [3, 4, 5],
      callers: [6, 7],
    },
    actions,
    intentionallyUnwithdrawnToken,
  };

  validateScenario(plan);
  return plan;
}

export function validateScenario(plan: ScenarioPlan): void {
  const flattened = plan.actions.flatMap((action) =>
    action.kind === "sameBlock" ? action.actions : [action]
  );
  const launches = flattened.filter(
    (action): action is LaunchPlan => action.kind === "launch"
  );
  const launchKeys = new Set(launches.map((launch) => launch.tokenKey));

  if (launches.length !== 4 || launchKeys.size !== 4) {
    throw new Error("Every scenario must contain four unique launches");
  }
  if (new Set(launches.map((launch) => launch.creatorAccount)).size !== 3) {
    throw new Error("Every scenario must contain exactly three creators");
  }
  const quoteTokens = new Set(launches.map((launch) => launch.quoteToken));
  if (
    quoteTokens.size !== 2 ||
    !quoteTokens.has(LOW_QUOTE_TOKEN_ADDRESS) ||
    !quoteTokens.has(HIGH_QUOTE_TOKEN_ADDRESS)
  ) {
    throw new Error(
      "Every scenario must launch against both quote-token orderings"
    );
  }
  if (!launchKeys.has(plan.intentionallyUnwithdrawnToken)) {
    throw new Error("The intentionally unwithdrawn token must be launched");
  }

  for (const launch of launches) {
    if (launch.initialBuyAmount < 0n) {
      throw new Error(`Invalid initial buy for ${launch.tokenKey}`);
    }
  }
  if (launches.filter((launch) => launch.initialBuyAmount > 0n).length !== 2) {
    throw new Error("Every scenario must cover two atomic initial buys");
  }

  const count = (kind: ScenarioAction["kind"]): number =>
    flattened.filter((action) => action.kind === kind).length;
  if (
    count("distributeFees") !== 3 ||
    count("withdrawLaunchFees") !== 2 ||
    count("withdrawReserve") !== 3 ||
    count("transferCreator") !== 1 ||
    count("setProtocolRecipient") !== 1
  ) {
    throw new Error("Scenario is missing required lifecycle coverage");
  }
}

export function stringifyPlan(plan: ScenarioPlan): string {
  return `${JSON.stringify(
    plan,
    (_key, value: unknown) =>
      typeof value === "bigint" ? value.toString() : value,
    2
  )}\n`;
}
