import { Type } from "typebox";
import Schema from "typebox/schema";

const DURATION_PATTERN = "^(?:\\d+(?:ns|us|ms|s|m|h))+$";
const POSITIVE_INTEGER_STRING_PATTERN = "^[1-9]\\d*$";

const HEALTHCHECK_TEST_ARRAY = Type.Unsafe<string[]>({
  type: "array",
  minItems: 1,
  items: {
    type: "string",
    minLength: 1,
  },
  anyOf: [
    {
      prefixItems: [{ const: "NONE" }],
      minItems: 1,
      maxItems: 1,
    },
    {
      prefixItems: [{ const: "CMD" }],
      minItems: 2,
    },
    {
      prefixItems: [{ const: "CMD-SHELL" }],
      minItems: 2,
    },
  ],
});

/**
 * Based on the official compose schema definition.
 *
 * @link https://github.com/compose-spec/compose-spec/blob/8c28d854433e6efe224f3d1c288b3ab5d873402d/schema/compose-spec.json#L921-L959
 */
const healthcheck = Type.Object(
  {
    disable: Type.Optional(
      Type.Union([Type.Boolean(), Type.String()], {
        description:
          "Disable any container-specified healthcheck. Set to true to disable.",
      }),
    ),
    interval: Type.Optional(
      Type.String({
        description:
          "Time between running the check (e.g., '1s', '1m30s'). Default: 30s.",
        pattern: DURATION_PATTERN,
      }),
    ),
    retries: Type.Optional(
      Type.Union(
        [
          Type.Integer({ minimum: 1 }),
          Type.String({ pattern: POSITIVE_INTEGER_STRING_PATTERN }),
        ],
        {
          description:
            "Number of consecutive failures needed to consider the container as unhealthy. Default: 3.",
        },
      ),
    ),
    test: Type.Optional(
      Type.Union([Type.String({ minLength: 1 }), HEALTHCHECK_TEST_ARRAY], {
        description:
          "The test to perform to check container health. Can be a string or a list. The first item is either NONE, CMD, or CMD-SHELL. If it's CMD, the rest of the command is exec'd. If it's CMD-SHELL, the rest is run in the shell.",
      }),
    ),
    timeout: Type.Optional(
      Type.String({
        description:
          "Maximum time to allow one check to run (e.g., '1s', '1m30s'). Default: 30s.",
        pattern: DURATION_PATTERN,
      }),
    ),
    start_period: Type.Optional(
      Type.String({
        description:
          "Start period for the container to initialize before starting health-retries countdown (e.g., '1s', '1m30s'). Default: 0s.",
        pattern: DURATION_PATTERN,
      }),
    ),
    start_interval: Type.Optional(
      Type.String({
        description:
          "Time between running the check during the start period (e.g., '1s', '1m30s'). Default: interval value.",
        pattern: DURATION_PATTERN,
      }),
    ),
  },
  {
    description:
      "Configuration options to determine whether the container is healthy.",
    additionalProperties: false,
    patternProperties: {
      "^x-": {},
    },
  },
);

/**
 * The healthcheck configuration options for a container. This is used to determine whether the container is healthy or not.
 */
export type Healthcheck = Type.Static<typeof healthcheck>;

export const HealthcheckVector = Schema.Compile(healthcheck);
