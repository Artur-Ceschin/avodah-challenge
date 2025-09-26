import { test, mock } from 'node:test';
import assert from 'node:assert';
import { getAvodahChallenge } from './index.js';

global.fetch = mock.fn();

// Two simple tests one for success and one for error
test('getAvodahChallenge succeeds on first try', async () => {
  global.fetch.mock.mockImplementation(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ date: 'Wed, 24 Sep 2025 19:54:36 GMT' })
    })
  );

  const result = await getAvodahChallenge();
  assert.strictEqual(result, undefined);
});

test('getAvodahChallenge fails after all attempts', async () => {
  global.fetch.mock.mockImplementation(() =>
    Promise.resolve({ status: 500 })
  );

  const result = await getAvodahChallenge();
  assert.strictEqual(result, undefined);
});