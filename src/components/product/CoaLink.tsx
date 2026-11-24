import clsx from "clsx";

/**
 * Lab-report download. Until the client sends the certificate PDFs (`coaUrl` empty),
 * it shows a clearly disabled "at launch" pill instead of a link that goes nowhere.
 */
export function CoaLink({ url, label, className }: { url: string; label: string; className?: string }) {
  const base = clsx("inline-flex items-center justify-center rounded-full border border-line text-sm", className);
  if (!url || url === "#") {
    return (
      <span className={clsx(base, "cursor-default text-dust")} aria-disabled="true" title="The certificate will be published with the first batch">
        PDF available at launch
      </span>
    );
  }
  return (
    <a href={url} download className={clsx(base, "font-semibold transition-colors hover:border-star/40")}>
      {label}
    </a>
  );
}
