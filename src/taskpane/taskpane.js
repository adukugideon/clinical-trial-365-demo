import { generateClinicalReview } from '../helpers/deepseekAPI';
import { validateClinicalText } from '../helpers/clinicalValidation';
import { formatReview, insertIntoDocument } from '../helpers/wordHelpers';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const reviewTemplate = document.getElementById('reviewTemplate');
    const customPromptGroup = document.getElementById('customPromptGroup');
    const customPrompt = document.getElementById('customPrompt');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const generateBtn = document.getElementById('generateBtn');
    const outputSection = document.getElementById('outputSection');
    const reviewOutput = document.getElementById('reviewOutput');
    const validationSummary = document.getElementById('validationSummary');
    const insertBtn = document.getElementById('insertBtn');
    
    // Event Listeners
    reviewTemplate.addEventListener('change', toggleCustomPrompt);
    analyzeBtn.addEventListener('click', analyzeSelection);
    generateBtn.addEventListener('click', generateReview);
    insertBtn.addEventListener('click', insertReview);
    
    let currentSelection = '';
    let validationResults = {};
    
    function toggleCustomPrompt() {
        customPromptGroup.style.display = 
            reviewTemplate.value === 'custom' ? 'block' : 'none';
    }
    
    async function analyzeSelection() {
        try {
            Office.context.document.getSelectedDataAsync(
                Office.CoercionType.Text,
                async result => {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        currentSelection = result.value.trim();
                        if (!currentSelection) {
                            showError('Please select clinical trial text first');
                            return;
                        }
                        
                        // Validate clinical content
                        validationResults = validateClinicalText(currentSelection);
                        displayValidation(validationResults);
                        
                        // Enable generate button
                        generateBtn.disabled = false;
                    }
                }
            );
        } catch (error) {
            showError(`Analysis failed: ${error.message}`);
        }
    }
    
    async function generateReview() {
        try {
            showLoading(true);
            
            const options = {
                template: reviewTemplate.value,
                prompt: customPrompt.value
            };
            
            const review = await generateClinicalReview(currentSelection, options);
            
            reviewOutput.innerHTML = formatReview(review.html);
            outputSection.style.display = 'block';
            showLoading(false);
            
        } catch (error) {
            showError(`Generation failed: ${error.message}`);
            showLoading(false);
        }
    }
    
    async function insertReview() {
        try {
            await insertIntoDocument(reviewOutput.textContent);
            showMessage('Review inserted successfully!');
        } catch (error) {
            showError(`Insert failed: ${error.message}`);
        }
    }
    
    function displayValidation(results) {
        validationSummary.innerHTML = `
            <h3>Text Analysis</h3>
            ${results.errors.length ? `
                <div class="alert alert-error">
                    <strong>Critical Issues:</strong>
                    <ul>${results.errors.map(e => `<li>${e}</li>`).join('')}</ul>
                </div>
            ` : ''}
            ${results.warnings.length ? `
                <div class="alert alert-warning">
                    <strong>Recommendations:</strong>
                    <ul>${results.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
                </div>
            ` : ''}
            ${results.suggestedImprovements.length ? `
                <div class="tips">
                    <strong>Suggestions:</strong>
                    <ul>${results.suggestedImprovements.map(t => `<li>${t}</li>`).join('')}</ul>
                </div>
            ` : ''}
        `;
    }
    
    function showLoading(show) {
        // Implement loading indicator
    }
    
    function showError(message) {
        // Implement error display
    }
    
    function showMessage(message) {
        // Implement message display
    }
});