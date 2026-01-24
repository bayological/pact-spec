export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-[1000px] mx-auto px-6 py-6 flex items-center justify-between text-sm text-neutral-500">
        <span>MIT License</span>
        <a
          href="https://github.com/bayological/pact-spec"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 hover:text-white no-underline transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
