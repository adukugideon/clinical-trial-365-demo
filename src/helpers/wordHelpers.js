export async function getSelectedText() {
    return new Promise((resolve, reject) => {
        Office.context.document.getSelectedDataAsync(
            Office.CoercionType.Text,
            result => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(result.value.trim());
                } else {
                    reject(new Error(result.error.message));
                }
            }
        );
    });
}

export async function insertIntoDocument(content) {
    return new Promise((resolve, reject) => {
        Office.context.document.setSelectedDataAsync(
            content,
            { coercionType: Office.CoercionType.Html },
            result => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve();
                } else {
                    reject(new Error(result.error.message));
                }
            }
        );
    });
}

export function formatReview(text) {
    // Convert markdown-like formatting to HTML
    return text
        .replace(/^#\s+(.*)$/gm, '<h2>$1</h2>')
        .replace(/^##\s+(.*)$/gm, '<h3>$1</h3>')
        .replace(/^-\s+(.*)$/gm, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

export async function applyClinicalStyles() {
    return Word.run(async context => {
        const range = context.document.getSelection();
        range.font.set({
            name: 'Calibri',
            size: 11
        });
        
        // Style headings
        const headings = range.search('#', { matchCase: false });
        headings.load('text');
        await context.sync();
        
        headings.items.forEach(heading => {
            heading.font.bold = true;
            heading.font.size = heading.text.startsWith('##') ? 12 : 14;
        });
        
        await context.sync();
    });
}