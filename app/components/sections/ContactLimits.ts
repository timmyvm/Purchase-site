/**
 * Field limits for the contact form, shared by the form's maxLength
 * attributes (ContactPageClient) and the server checks in /api/contact.
 * Client-safe: no server-only imports.
 */
export const CONTACT_LIMITS = { name: 120, email: 254, orderNumber: 40, message: 5000 } as const;
