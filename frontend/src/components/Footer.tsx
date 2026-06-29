export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-bg/80 backdrop-blur-sm border-t-2 border-text py-1 z-40">
      <div className="w-[min(980px,92vw)] mx-auto text-center font-mono text-sm text-text">
        <span>© {new Date().getFullYear()} Shorty · Made by </span>
        <a href="https://najaf.in" target="_blank" className="text-[#4cda91]">Najaf Shaikh</a>
        <span className="mx-2">·</span>
        <a href="https://www.najaf.in/privacy-policy" className="text-[#4cda91]">Privacy povicy</a>
      </div>
    </footer>
  );
}
