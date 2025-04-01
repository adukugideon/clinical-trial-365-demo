const CONSORT_CHECKLIST = [
    { id: 'title', regex: /trial\s*registration/i, required: true },
    { id: 'abstract', regex: /structured\s*abstract/i, required: true },
    { id: 'background', regex: /background|rationale/i, required: true },
    { id: 'objectives', regex: /objective|aim|hypothesis/i, required: true },
    { id: 'trial_design', regex: /trial\s*design|methodology/i, required: true },
    { id: 'participants', regex: /participants|patients|subjects/i, required: true },
    { id: 'interventions', regex: /intervention|treatment/i, required: true },
    { id: 'outcomes', regex: /outcome|endpoint/i, required: true },
    { id: 'randomization', regex: /randomi(z|s)ation/i, required: true },
    { id: 'blinding', regex: /blinding|masking/i, required: false },
    { id: 'statistics', regex: /statistical\s*analysis|p-value|ci/i, required: true }
];

export function validateClinicalText(text) {
    const errors = [];
    const warnings = [];
    const missingConsortItems = [];
    
    // Check for CONSORT items
    CONSORT_CHECKLIST.forEach(item => {
        if (item.required && !item.regex.test(text)) {
            missingConsortItems.push(item.id.replace('_', ' '));
        }
    });
    
    if (missingConsortItems.length > 0) {
        errors.push(`Missing required CONSORT items: ${missingConsortItems.join(', ')}`);
    }
    
    // Check for sample size
    if (!/(sample\s*size|n\s*=\s*\d+|\d+\s*participants)/i.test(text)) {
        warnings.push("Sample size not clearly specified");
    }
    
    // Check for statistical significance
    if (!/(p\s*[<=>]\s*0\.\d+|confidence\s*interval|ci\s*:\s*\d)/i.test(text)) {
        warnings.push("Statistical significance measures not found");
    }
    
    // Check for ethics
    if (!/(irb|ethics\s*committee|institutional\s*review\s*board)/i.test(text)) {
        warnings.push("Ethics approval not mentioned");
    }
    
    // Check for limitations section
    if (!/limitation|weakness|constraint/i.test(text)) {
        warnings.push("No limitations section detected");
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        missingConsortItems,
        suggestedImprovements: [
            "Include CONSORT flow diagram if available",
            "Specify primary vs. secondary endpoints clearly",
            "Describe randomization method in detail",
            "Report exact p-values rather than inequalities",
            "Include confidence intervals for key results"
        ]
    };
}

export function checkStatisticalMethods(text) {
    const statsMethods = {
        regression: /regression|cox|logistic/i,
        ttest: /t-test|student's\s*t/i,
        anova: /\banova\b|analysis\s*of\s*variance/i,
        nonparametric: /mann-whitney|wilcoxon|kruskal/i,
        survival: /kaplan-meier|log-rank|cox\s*proportional/i
    };
    
    const detectedMethods = Object.entries(statsMethods)
        .filter(([_, regex]) => regex.test(text))
        .map(([name]) => name);
    
    return {
        methods: detectedMethods,
        needsReview: detectedMethods.length === 0
    };
}