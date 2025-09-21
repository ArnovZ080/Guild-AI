// Supportive conversation snippets for onboarding
export const supportiveIntros = [
  "Cool, thanks for sharing that! Quick follow-up...",
  "No worries if you're not sure — we can sort this out later.",
  "That's a great start. Let me note that down for the Strategy Agent.",
  "Perfect! That gives us a lot to work with.",
  "Awesome, I'm getting a clear picture here.",
  "Love it! This is exactly what we need to know.",
  "Excellent — that's really helpful context.",
  "Got it! That makes total sense.",
  "Perfect timing to ask about this...",
  "Thanks for being so open about that."
];

export const microAcknowledgements = [
  "👍 Got it! That gives us a lot to work with.",
  "✨ Perfect! I'm noting that down.",
  "🎯 Excellent — that's really helpful.",
  "💡 Great insight! That helps a lot.",
  "🚀 Awesome! We're making great progress.",
  "⭐ That's exactly what we needed to know.",
  "🔥 Love it! This is coming together nicely.",
  "💪 Perfect! You're doing great.",
  "🎉 Excellent choice! That's noted.",
  "🌟 Fantastic! That's really valuable info."
];

export const reassuringPhrases = {
  financial: [
    "I know this can feel personal, so ballpark is fine. We're not here to judge — just to understand.",
    "Financial info is completely optional. Guild works great without it.",
    "No pressure on the numbers — we're just trying to understand your situation better.",
    "This helps us tailor recommendations, but you can always skip if you prefer."
  ],
  painPoints: [
    "This is where we shine! The more you share, the more we can automate.",
    "Don't hold back — this is exactly what Guild was built to solve.",
    "The more specific you are, the better we can help you tackle this.",
    "This is gold for us — the more details, the better our solutions."
  ],
  vision: [
    "Dream big — even if it feels impossible today. Ambition is fuel.",
    "Think 10x bigger than you normally would. We're here to make it happen.",
    "Don't limit yourself — if you can dream it, we can help build it.",
    "This is your North Star. The bigger the vision, the more motivated we'll be."
  ],
  uncertainty: [
    "No worries if you're not sure — Guild will help you figure this out.",
    "That's totally fine! We'll work together to clarify this later.",
    "Don't stress about it — we can always refine this as we go.",
    "Perfectly normal to be unsure — that's what we're here for."
  ]
};

export const getRandomSnippet = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getReassurance = (type) => {
  const phrases = reassuringPhrases[type] || reassuringPhrases.uncertainty;
  return getRandomSnippet(phrases);
};
