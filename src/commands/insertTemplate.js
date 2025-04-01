// Manages clinical review template insertion
const TEMPLATES = {
    systematic: `## Systematic Review\n\n### Methods\n[Study selection methodology]\n\n### Results\n[Key findings]`,
    meta: `## Meta-Analysis\n\n### Statistical Methods\n[Models used]\n\n### Heterogeneity\n[I² statistics]`
  };
  
  export async function insertTemplate(event) {
    const templateName = event.source.id.split('.').pop();
    const template = TEMPLATES[templateName];
    
    await Office.context.document.setSelectedDataAsync(template, {
      coercionType: Office.CoercionType.Text
    });
  
    event.completed();
  }