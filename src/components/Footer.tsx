export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200/70 bg-white py-8 text-sm text-zinc-500 dark:border-zinc-800/70 dark:bg-nepal-ink dark:text-zinc-400">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 md:flex-row md:items-center">
        <div>
          © {new Date().getFullYear()} सजिलो सेवा नेपाल — नेपाली नागरिकका लागि
          सरकारी सेवा खोज्ने सरल पोर्टल।
        </div>
        <div className="flex items-center gap-4">
          <span className="badge-blue">non-official</span>
          <span>निःशुल्क • खुला स्रोत</span>
        </div>
      </div>
    </footer>
  );
}
