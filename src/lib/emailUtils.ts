/**
 * Utility per pulire il corpo delle email dai residui di cronologia (citazioni, header di risposta, ecc.)
 */

export interface CleanedEmail {
    content: string;
    isCleaned: boolean;
    original: string;
}

const QUOTE_PATTERNS = [
    /(\n\nIl giorno .+ ha scritto:)/i,
    /(\n\nOn .+ wrote:)/i,
    /(\n\nDe .+ a écrit :)/i,
    /(\n?---+\s*Messaggio originale\s*---+)/i,
    /(\n?---+\s*Original Message\s*---+)/i,
    /(\n?From: .+)/i,
    /(\n?Da: .+)/i,
];

/**
 * Pulisce il testo semplice rimuovendo tutto ciò che segue un header di citazione standard
 */
function cleanPlainText(text: string): CleanedEmail {
    if (!text) return { content: "", isCleaned: false, original: "" };

    let cleaned = text;
    let isCleaned = false;

    for (const pattern of QUOTE_PATTERNS) {
        const match = cleaned.match(pattern);
        if (match && match.index !== undefined) {
            cleaned = cleaned.substring(0, match.index).trim();
            isCleaned = true;
            // Una volta trovato un match primario, ci fermiamo per evitare di tagliare troppo
            break;
        }
    }

    // Rimuove anche eventuali blocchi iniziali di "> " (citazioni vecchio stile)
    // ma solo se sono alla fine del testo pulito precedentemente
    const lines = cleaned.split('\n');
    const finalLines = [];
    for (const line of lines) {
        if (line.trim().startsWith('>')) {
            isCleaned = true;
            continue;
        }
        finalLines.push(line);
    }

    return {
        content: finalLines.join('\n').trim(),
        isCleaned,
        original: text
    };
}

/**
 * Pulisce l'HTML cercando tag specifici di citazione (gmail_quote, blockquote, ecc.)
 */
function cleanHtmlText(html: string): CleanedEmail {
    if (!html) return { content: "", isCleaned: false, original: "" };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let isCleaned = false;

    // Pattern comuni di contenitori per citazioni
    const selectors = [
        '.gmail_quote',
        'blockquote',
        '.outlook_quote',
        '#isPasted', // Alcuni editor incollano così lo storico
        '.protonmail_quote',
        '.wordSection1 > div:has(div[style*="border-top"])' // Tentativo per Outlook desktop
    ];

    selectors.forEach(selector => {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(el => {
            el.remove();
            isCleaned = true;
        });
    });

    // Se non abbiamo trovato tag strutturati, proviamo a cercare pattern testuali dentro i nodi di testo
    if (!isCleaned) {
        const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
        let node;
        while (node = walker.nextNode()) {
            for (const pattern of QUOTE_PATTERNS) {
                if (pattern.test(node.nodeValue || "")) {
                    // Se troviamo un pattern testuale, rimuoviamo questo nodo e tutti i successivi nel genitore
                    const parent = node.parentNode;
                    if (parent) {
                        let next = node;
                        while (next) {
                            const toRemove = next;
                            next = next.nextSibling as Node;
                            parent.removeChild(toRemove);
                        }
                        isCleaned = true;
                    }
                    break;
                }
            }
            if (isCleaned) break;
        }
    }

    return {
        content: doc.body.innerHTML.trim(),
        isCleaned,
        original: html
    };
}

export function cleanEmailBody(content: string | null, isHtml: boolean): CleanedEmail {
    if (!content) return { content: "", isCleaned: false, original: "" };

    if (isHtml) {
        return cleanHtmlText(content);
    } else {
        return cleanPlainText(content);
    }
}
