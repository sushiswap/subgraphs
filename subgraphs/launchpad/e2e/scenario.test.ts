import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SEEDS,
  planScenario,
  stringifyPlan,
  validateScenario,
} from "./scenario";

test("the same seed always produces the same complete plan", () => {
  const first = stringifyPlan(planScenario(202));
  const second = stringifyPlan(planScenario(202));

  assert.equal(first, second);
});

test("different seeds vary the planned real-world behavior", () => {
  const plans = DEFAULT_SEEDS.map((seed) => stringifyPlan(planScenario(seed)));

  assert.equal(new Set(plans).size, DEFAULT_SEEDS.length);
});

test("the default matrix satisfies all scenario invariants", () => {
  for (const seed of DEFAULT_SEEDS) {
    const plan = planScenario(seed);
    assert.doesNotThrow(() => validateScenario(plan));
  }
});

test("invalid seeds fail before any chain process starts", () => {
  assert.throws(() => planScenario(-1), /unsigned 32-bit integer/);
  assert.throws(() => planScenario(2 ** 32), /unsigned 32-bit integer/);
  assert.throws(() => planScenario(1.5), /unsigned 32-bit integer/);
});
