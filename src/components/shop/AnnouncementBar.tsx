/**
 * The line that greets every shopper before the header. It scrolls away with
 * the page rather than sticking, so it never eats height on a phone.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-brand text-[var(--brand-contrast)]">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium leading-relaxed sm:px-6 sm:text-sm">
        Welcome aboard, Queens. Orders within Nairobi are same day delivery.
      </p>
    </div>
  );
}
