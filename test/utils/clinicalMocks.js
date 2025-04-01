export const MOCK_CLINICAL_RESPONSE = {
  raw: `## Clinical Review\n### Methods\n- Appropriate randomization (Grade A)`,
  html: `<h2>Clinical Review</h2><h3>Methods</h3><li>Appropriate randomization (Grade A)</li>`,
  structured: {
    methods: "Appropriate randomization (Grade A)"
  }
};

export const MOCK_TRIAL_TEXT = `
Title: RCT of New Oncology Treatment
Methods: N=450, multicenter, phase 3
Results: OS HR 0.65 (95% CI 0.50-0.85), p=0.002
`;

export const INCOMPLETE_TRIAL_TEXT = `
Case Report: Uncontrolled observation
`;