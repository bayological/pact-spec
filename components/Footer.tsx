export default function Footer() {
  return (
    <footer className="site-foot mt-16">
      <div className="max-w-[1000px] mx-auto px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
        <span>PACT protocol &middot; MIT License</span>
        <span className="flex gap-6">
          <a
            href="https://github.com/bayological/pact-spec"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="https://kept.works" target="_blank" rel="noopener noreferrer">
            Kept &middot; reference implementation
          </a>
        </span>
      </div>
    </footer>
  );
}
