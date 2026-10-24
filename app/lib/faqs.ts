import { SHIPPING_FACTS, DISPATCH_CLAIM_SHORT } from "@/app/lib/shipping";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";

export type Faq = { question: string; answer: string };
export type FaqGroup = { heading: string; items: Faq[] };

const { freeThresholdAud, feeAud, transitBusinessDays } = SHIPPING_FACTS;

// /faq renders every group; the homepage FAQ block shows HOME_FAQS (entries
// reused verbatim from here, never reworded copies).
export const FAQ_GROUPS: FaqGroup[] = [
  {
    heading: "The stickers",
    items: [
      {
        question: "What does “limited run” mean?",
        answer:
          "Each design is printed once, in the quantity shown on its page. When that run sells out, the design is retired and isn't reprinted.",
      },
      {
        question: "What are the stickers made of?",
        answer:
          "Die-cut vinyl, cut to the shape of the artwork with a white border. Most designs are gloss; the holographic designs are printed on holographic vinyl and come in smaller runs.",
      },
      {
        question: "What sizes are there?",
        answer:
          "Singles come in 7.5 cm and 10 cm, measured along the longest side. Full sets contain every design from the drop at 7.5 cm.",
      },
    ],
  },
  {
    heading: "Ordering & payment",
    items: [
      {
        question: "How do I pay?",
        answer: `By bank transfer. After you place your order you'll see our account details and your order number to use as the reference. Your stickers are held for ${UNPAID_ORDER_HOURS} hours while the payment comes through.`,
      },
      {
        question: "What happens if I don't pay in time?",
        answer: `Unpaid orders are cancelled after ${UNPAID_ORDER_HOURS} hours and the stickers go back on sale, so a limited run isn't tied up by orders that never complete.`,
      },
      {
        question: "Is there a limit per order?",
        answer: "Up to 10 of each design and size per order, so one basket can't take a whole run.",
      },
    ],
  },
  {
    heading: "Shipping & returns",
    items: [
      {
        question: "How much is shipping?",
        answer: `A$${feeAud.toFixed(2)} Australia-wide, free on orders over A$${freeThresholdAud}. Orders are sent by ${SHIPPING_FACTS.carrier} in a rigid mailer so they arrive flat.`,
      },
      {
        question: "How long does delivery take?",
        answer: `${DISPATCH_CLAIM_SHORT}. Australia Post letters usually take ${transitBusinessDays.min}–${transitBusinessDays.max} business days after that.`,
      },
      {
        question: "Do you ship overseas?",
        answer: "Not yet. We only ship within Australia for now.",
      },
      {
        question: "What if my stickers arrive damaged?",
        answer:
          "Email us a photo within 14 days of delivery and we'll replace them, or refund you if that design has sold out. See the refund policy for the details.",
      },
    ],
  },
];

export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((group) => group.items);

export const HOME_FAQS: Faq[] = [ALL_FAQS[0], ALL_FAQS[3], ALL_FAQS[6]];
