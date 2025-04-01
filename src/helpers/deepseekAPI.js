const CLINICAL_SYSTEM_PROMPT = `
You are a senior clinical researcher peer reviewer for major medical journals (NEJM, Lancet, JAMA). 
When analyzing clinical trials, strictly adhere to these guidelines:

1. CONSORT 2010 Checklist
2. GRADE Evidence Rating System
3. ICH-GCP Standards
4. FDA/EMA Regulatory Requirements

Critical Analysis Must Include:
- Randomization methodology assessment
- Blinding procedures evaluation
- Statistical power calculation verification
- Adverse event reporting completeness
- Protocol deviation impact analysis
- Conflict of interest disclosure review

Required Output Structure:
[SUMMARY] Trial overview (1 paragraph)
[STRENGTHS] Methodological merits (bullet points)
[LIMITATIONS] Study weaknesses with severity rating (Mild/Moderate/Severe)
[VALIDITY] Internal/external validity assessment
[STATISTICS] Methods appropriateness (p-values, CI, multiplicity adjustments)
[SAFETY] Adverse events analysis
[RECOMMENDATIONS] Specific actionable suggestions (numbered list)

Use precise medical terminology and maintain critical academic tone.
`;

export async function generateClinicalReview(text, options = {}) {
    // Validate clinical text before processing
    if (!text || text.trim().length < 50) {
        throw new Error('Insufficient clinical trial text provided (minimum 50 characters required)');
    }

    const messages = [
        { 
            role: "system", 
            content: CLINICAL_SYSTEM_PROMPT 
        },
        { 
            role: "user", 
            content: buildClinicalPrompt(text, options)
        }
    ];

    const params = {
        model: "deepseek-chat",
        messages,
        temperature: options.temperature || 0.3, // Lower for clinical precision
        max_tokens: options.max_tokens || 2500,
        top_p: 0.85,
        frequency_penalty: 0.7, // Reduce repetition
        presence_penalty: 0.6,
        stop: ["[END]", "\n\n\n"] // Custom stopping tokens
    };

    try {
        const startTime = performance.now();
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: getAPIHeaders(),
            body: JSON.stringify(params),
            signal: AbortSignal.timeout(15000) // 15-second timeout
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            throw new ClinicalReviewError(
                errorData.message || 'API request failed',
                errorData.status || response.status,
                errorData.type || 'API_ERROR'
            );
        }

        const data = await response.json();
        const processingTime = ((performance.now() - startTime)/1000).toFixed(2);
        
        return {
            ...processClinicalResponse(data.choices[0].message.content),
            metadata: {
                model: data.model,
                processing_time: `${processingTime}s`,
                tokens_used: data.usage.total_tokens
            }
        };

    } catch (error) {
        console.error('Clinical Review Generation Error:', {
            error: error.message,
            stack: error.stack,
            trialTextSnippet: text.substring(0, 100) + '...'
        });
        
        if (error.name === 'ClinicalReviewError') throw error;
        throw new ClinicalReviewError(
            'Failed to generate clinical review',
            500,
            'PROCESSING_ERROR',
            { originalError: error.message }
        );
    }
}

// Helper Functions
function buildClinicalPrompt(text, options) {
    const basePrompt = `CLINICAL TRIAL DATA:\n${text}\n\n`;
    
    let instructionPrompt = '';
    if (options.reviewType) {
        instructionPrompt += `REVIEW FOCUS: ${getReviewTypeInstructions(options.reviewType)}\n`;
    }
    if (options.prompt) {
        instructionPrompt += `SPECIAL INSTRUCTIONS: ${options.prompt}\n`;
    }
    
    return basePrompt + instructionPrompt;
}

function getReviewTypeInstructions(type) {
    const instructions = {
        'comprehensive': 'Full structured review including all critical appraisal sections',
        'methods': 'Focus exclusively on methodology assessment (randomization, blinding, statistical methods)',
        'safety': 'Concentrate on adverse events analysis and safety reporting',
        'statistics': 'Detailed statistical methods evaluation only'
    };
    
    return instructions[type] || instructions.comprehensive;
}

function getAPIHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'X-Clinical-Review-App': 'Word-AddIn/v1.0',
        'X-Request-ID': crypto.randomUUID()
    };
}

async function parseErrorResponse(response) {
    try {
        return await response.json();
    } catch {
        return {
            status: response.status,
            message: response.statusText
        };
    }
}

function processClinicalResponse(text) {
    // Enhanced clinical content processing
    const formatted = text
        .replace(/^\[(\w+)\]\s*/gm, '<h2>$1</h2>') // [SECTION] to h2
        .replace(/^-\s+(.*?)(?=\n-|\n\[|$)/gms, '<li>$1</li>') // List items
        .replace(/\b(p\s*[<>]=?\s*0\.\d+)/gi, '<strong>$1</strong>') // Highlight p-values
        .replace(/(\d+%\s*CI)/gi, '<em>$1</em>') // Emphasize CIs
        .replace(/\n{2,}/g, '</p><p>') // Paragraphs
        .replace(/(Grade\s+[A-D])/g, '<span class="grade">$1</span>'); // GRADE ratings

    return {
        raw: text,
        html: `<div class="clinical-review">${formatted}</div>`,
        structured: parseStructuredReview(text),
        markdown: convertToMarkdown(text)
    };
}

function parseStructuredReview(text) {
    const sections = {};
    const sectionRegex = /^\[(\w+)\][\s:]*(.*?)(?=\n\[|\n*$)/gms;
    
    let match;
    while ((match = sectionRegex.exec(text))) {
        const [_, sectionName, content] = match;
        sections[sectionName.toLowerCase()] = {
            content: content.trim(),
            length: content.length,
            items: content.includes('- ') 
                ? content.split('\n- ').slice(1).map(i => i.trim())
                : undefined
        };
    }
    
    // Extract key metrics
    sections.metrics = {
        grade: text.match(/Grade\s+([A-D])/i)?.[1],
        bias_risk: text.match(/Bias Risk:\s*(Low|Moderate|High)/i)?.[1],
        sample_size: text.match(/(\d+)\s*participants/i)?.[1]
    };
    
    return sections;
}

function convertToMarkdown(text) {
    return text
        .replace(/^\[(\w+)\]/gm, '## $1')
        .replace(/^-\s/gm, '* ');
}

// Custom Error Class
class ClinicalReviewError extends Error {
    constructor(message, statusCode, errorType, details = {}) {
        super(message);
        this.name = 'ClinicalReviewError';
        this.status = statusCode || 500;
        this.type = errorType || 'CLINICAL_REVIEW_ERROR';
        this.details = details;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

export { ClinicalReviewError };