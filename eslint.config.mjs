// This repo follows its own standard.
import { standard } from "./typescript/eslint.standard.mjs";

export default [...standard, { ignores: ["tests/fixtures/**"] }];
