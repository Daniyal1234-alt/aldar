// Al-Dar Apparel Outreach Templates
// Templates for Instagram DM, WhatsApp, and Email outreach

export type LineType = 'mens' | 'womens' | 'family';

export interface LeadVariables {
    contact_first_name?: string;
    business_name?: string;
    city?: string;
    country?: string;
    product_focus?: string;
    notes_for_outreach?: string;
    username?: string;
    fullname?: string;
    biography?: string;
}

// Detect line focus from biography or context
export function detectLineFocus(text: string | null | undefined): LineType {
    if (!text) return 'family';
    const lower = text.toLowerCase();

    const mensKeywords = ['thobe', 'thawb', 'jubbah', 'jubba', 'kandura', 'dishdasha', "men's", 'mens', 'male', 'brothers'];
    const womensKeywords = ['abaya', 'jilbab', 'hijab', 'niqab', "women's", 'womens', 'female', 'sisters', 'modest wear', 'modesty'];

    const hasMens = mensKeywords.some(k => lower.includes(k));
    const hasWomens = womensKeywords.some(k => lower.includes(k));

    if (hasMens && !hasWomens) return 'mens';
    if (hasWomens && !hasMens) return 'womens';
    return 'family';
}

// Get first name with fallback
function getFirstName(name?: string | null): string {
    if (!name) return 'there';
    const first = name.split(' ')[0];
    return first || 'there';
}

// ========================================
// INSTAGRAM / WHATSAPP TEMPLATES
// ========================================

export function generateInstagramDM(lead: LeadVariables): string {
    const lineType = detectLineFocus(lead.biography);
    const name = getFirstName(lead.fullname || lead.contact_first_name);
    const businessName = lead.business_name || lead.username || 'your store';

    if (lineType === 'mens') {
        return `Hi ${name}, this is Amir from Al-Dar Apparel in Dubai.

We manufacture premium men's thobes/jubbas for retailers like ${businessName}, under our brand or your own label.

Our MOQs start around 250 pcs per style, with regular shipping worldwide.

If this might be relevant, I can share a 2-page catalog + price/MOQ summary here or by email – what do you prefer?`;
    }

    if (lineType === 'womens') {
        return `Hi ${name}, this is Amir from Al-Dar Apparel in Dubai.

We manufacture premium abayas, jilbabs and women's Islamicwear for retailers like ${businessName}, either under our Al-Dar brand or your private label.

Our MOQs start around 250 pcs per style, with regular shipping worldwide.

If this could fit your range, I can share a 2-page catalog + price/MOQ summary here or by email – what's easier for you?`;
    }

    // family/mixed
    return `Hi ${name}, this is Amir from Al-Dar Apparel in Dubai.

We manufacture premium men's thobes and women's Islamicwear (abayas, jilbabs, etc.) for retailers like ${businessName}, under our brand or your own label.

MOQs start around 250 pcs per style, with regular shipping worldwide.

If it's relevant, I can send a 2-page catalog + price/MOQ summary here or by email – which do you prefer?`;
}

export function generateWhatsAppFollowUp1(lead: LeadVariables): string {
    const name = getFirstName(lead.fullname || lead.contact_first_name);
    const businessName = lead.business_name || lead.username || 'your store';
    const city = lead.city || '';

    return `Hi ${name}, just checking you saw my message about supplying thobes/abayas/Islamicwear to ${businessName}${city ? ` in ${city}` : ''}.

I can send a very short catalog + price/MOQ overview so you can decide quickly if it's a fit.

If it's not relevant, a quick "no" is totally fine.`;
}

export function generateWhatsAppFollowUp2(lead: LeadVariables): string {
    const name = getFirstName(lead.fullname || lead.contact_first_name);
    const businessName = lead.business_name || lead.username || 'your store';

    return `Hi ${name}, I'll assume now isn't the right time for ${businessName} to look at a new Islamicwear supplier.

I'll close this on my side – but if you ever want to see the 2-page catalog + wholesale price ranges, just send me a quick "catalog" and I'll share it.`;
}

// ========================================
// EMAIL TEMPLATES
// ========================================

export interface EmailTemplate {
    subjectOptions: string[];
    body: string;
}

export function generateInitialEmail(lead: LeadVariables, lineType?: LineType): EmailTemplate {
    const type = lineType || detectLineFocus(lead.product_focus || lead.biography);
    const name = getFirstName(lead.contact_first_name);
    const businessName = lead.business_name || 'your business';
    const city = lead.city || '';
    const country = lead.country || 'your region';
    const productFocus = lead.product_focus || 'Islamicwear';
    const notes = lead.notes_for_outreach;

    const introLine = `I came across ${businessName}${city ? ` in ${city}` : ''} and saw you focus on ${productFocus}${notes ? ` – ${notes}` : ''}.`;

    if (type === 'mens') {
        return {
            subjectOptions: [
                `Thobes for ${businessName}${city ? ` in ${city}` : ''}`,
                `New thobe supplier for ${businessName}`
            ],
            body: `Hi ${name},

${introLine}

I run Al-Dar Apparel in Dubai. We make premium men's thobes/jubbas for retailers and online stores in the UK, Europe, North America and South Africa, under our brand or yours.

I've attached a 2-page catalog with key styles and indicative wholesale prices. Our MOQs start around 250 pcs per style, with reliable production and shipping to ${country}.

If this looks relevant, are you open to a quick 10–15 minute call, or would you prefer a simple price/MOQ breakdown by email first?

Best regards,
Amir`
        };
    }

    if (type === 'womens') {
        return {
            subjectOptions: [
                `Abayas for ${businessName}${city ? ` in ${city}` : ''}`,
                `New abaya & jilbab supplier for ${businessName}`
            ],
            body: `Hi ${name},

${introLine}

I run Al-Dar Apparel in Dubai. We make premium abayas, jilbabs and women's Islamicwear (and men's thobes where needed) for retailers and online stores in the UK, Europe, North America and South Africa, under our brand or your private label.

I've attached a 2-page catalog with key styles and indicative wholesale prices. Our MOQs start around 250 pcs per style, with reliable production and shipping to ${country}.

If this looks relevant, are you open to a quick 10–15 minute call, or would you prefer a simple price/MOQ breakdown by email first?

Best regards,
Amir`
        };
    }

    // family/mixed
    return {
        subjectOptions: [
            `Men's & women's Islamicwear for ${businessName}`,
            `New supplier for your Islamicwear range`
        ],
        body: `Hi ${name},

${introLine}

I run Al-Dar Apparel in Dubai. We make premium men's thobes and women's Islamicwear (abayas, jilbabs, etc.) for retailers and online stores in the UK, Europe, North America and South Africa, under our brand or as your private label.

I've attached a 2-page catalog with key styles and indicative wholesale prices. Our MOQs start around 250 pcs per style, with reliable production and shipping to ${country}.

If this looks relevant, are you open to a quick 10–15 minute call, or would you prefer a simple price/MOQ breakdown by email first?

Best regards,
Amir`
    };
}

export function generateFollowUpEmail(lead: LeadVariables, followUpNumber: 1 | 2 | 3): EmailTemplate {
    const name = getFirstName(lead.contact_first_name);
    const businessName = lead.business_name || 'your business';
    const city = lead.city || '';
    const country = lead.country || 'your region';

    if (followUpNumber === 1) {
        return {
            subjectOptions: [
                `Quick follow-up for ${businessName}`,
                `Did you see the catalog for ${businessName}?`
            ],
            body: `Hi ${name},

Just checking you saw my email and 2-page catalog about supplying Islamicwear to ${businessName}${city ? ` in ${city}` : ''}.

Our MOQs start around 250 pcs per style, with regular shipments to ${country}.

If this might fit your range, I'm happy to jump on a quick 10–15 minute call or email a simple price/MOQ summary. If not, a quick "no" is fine and I won't follow up again.

Best,
Amir`
        };
    }

    if (followUpNumber === 2) {
        return {
            subjectOptions: [
                `Private-label options for ${businessName}`,
                `Next collection at ${businessName}?`
            ],
            body: `Hi ${name},

I know you're busy, so I'll be brief.

Many of our partners start with a small initial order to add or upgrade their thobe/abaya/Islamicwear line – either under their own label or by adding selected Al-Dar styles.

Would exploring a small trial order for ${businessName} be completely off the table right now, or worth a short conversation?

Thanks,
Amir`
        };
    }

    // Break-up email (#3)
    return {
        subjectOptions: [
            `Should I close this for ${businessName}?`,
            `Quick yes/no for ${businessName}`
        ],
        body: `Hi ${name},

I haven't heard back, so I'll assume now isn't the right time for ${businessName} to look at new thobe/abaya/Islamicwear suppliers.

I'll close this on my side. If you want to revisit later, just reply "catalog" and I'll resend the 2-page overview and current wholesale price ranges.

Best,
Amir`
    };
}

// ========================================
// STATUS OPTIONS
// ========================================

export const INSTAGRAM_STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'replied', label: 'Replied', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'interested', label: 'Interested', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'closed', label: 'Closed', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
];

export const EMAIL_STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'follow_up_1', label: 'Follow-up 1', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'follow_up_2', label: 'Follow-up 2', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'break_up', label: 'Break-up Sent', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'replied', label: 'Replied', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'interested', label: 'Interested', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'closed', label: 'Closed', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
];

export function getStatusStyle(status: string | null, isInstagram: boolean = false): string {
    const options = isInstagram ? INSTAGRAM_STATUS_OPTIONS : EMAIL_STATUS_OPTIONS;
    const found = options.find(o => o.value === status);
    return found?.color || 'bg-blue-100 text-blue-800 border-blue-200';
}

export function getStatusLabel(status: string | null, isInstagram: boolean = false): string {
    const options = isInstagram ? INSTAGRAM_STATUS_OPTIONS : EMAIL_STATUS_OPTIONS;
    const found = options.find(o => o.value === status);
    return found?.label || 'New';
}
