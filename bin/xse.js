#!/usr/bin/env node

import { run } from '../src/cli.js';

run().catch((err) => {
  console.error('\x1b[31mFatal error:\x1b[0m', err.message);
  process.exit(1);
});
