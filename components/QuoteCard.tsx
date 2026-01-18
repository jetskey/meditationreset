const quotes = [
  { text: "The mind is a tool. Learn to put it down.", author: "Naval Ravikant" },
  { text: "Between stimulus and response there is a space.", author: "Viktor Frankl" },
  { text: "Clarity comes from engagement, not thought.", author: "Marie Forleo" },
  { text: "Rest is not idleness.", author: "John Lubbock" },
  { text: "The ability to observe without evaluating is the highest form of intelligence.", author: "Jiddu Krishnamurti" },
];

export function QuoteCard() {
  // Use a deterministic quote based on the day
  const dayIndex = new Date().getDay();
  const quote = quotes[dayIndex % quotes.length];

  return (
    <div className="px-6 py-5">
      <p
        className="text-base leading-relaxed mb-2"
        style={{ color: 'var(--text)', opacity: 0.9 }}
      >
        "{quote.text}"
      </p>
      <p
        className="text-xs tracking-wide"
        style={{ color: 'var(--muted)', opacity: 0.6 }}
      >
        — {quote.author}
      </p>
    </div>
  );
}
