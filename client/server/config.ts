export const INITIAL_DIFFICULTY: number = 3;

export const BLOCK_GENERATION_INTERVAL: number = 10; // number of blocks
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10; // seconds
export const MINE_INTERVAL: number =
  BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL; // seconds

export const INITAIL_BALANCE: number = 1000;

export const COINBASE_AMOUNT: number = 50;
