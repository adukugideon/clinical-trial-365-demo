import { generateClinicalReview } from '../../src/helpers/deepseekAPI';
import { jest } from '@jest/globals';

// Mock clinical trial text samples
const SAMPLE_TRIAL = `
Title: Randomized Trial of Drug X vs Placebo
Methods: 200 participants, double-blind, RCT
Results: p=0.03, HR 0.45 (95% CI 0.21-0.98)
`;

describe('DeepSeek API Clinical Review Generation', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: `## Clinical Review\n\n### Methods Analysis\nAppropriate randomization (Grade A)`
            }
          }]
        })
      })
    );
  });

  test('should structure clinical review correctly', async () => {
    const result = await generateClinicalReview(SAMPLE_TRIAL);
    expect(result).toHaveProperty('structured.methods_analysis');
    expect(result.html).toContain('<h3>Methods Analysis</h3>');
  });

  test('should include CONSORT checklist items', async () => {
    const result = await generateClinicalReview(SAMPLE_TRIAL);
    expect(result.raw).toMatch(/Randomization|Blinding|Statistical Methods/i);
  });

  test('should handle API errors gracefully', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 429 })
    );
    await expect(generateClinicalReview(SAMPLE_TRIAL))
      .rejects
      .toThrow('API request failed');
  });
});