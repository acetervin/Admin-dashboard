import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-hand-holding-heart text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-800">Family Peace</h1>
                <p className="text-sm text-neutral-500">Foundation</p>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`text-sm font-medium transition-colors ${
                location === "/" ? "text-primary" : "text-neutral-600 hover:text-primary"
              }`}>
                Home
              </a>
            </Link>
            <Link href="/about">
              <a className={`text-sm font-medium transition-colors ${
                location === "/about" ? "text-primary" : "text-neutral-600 hover:text-primary"
              }`}>
                About
              </a>
            </Link>
            <Link href="/events">
              <a className={`text-sm font-medium transition-colors ${
                location === "/events" ? "text-primary" : "text-neutral-600 hover:text-primary"
              }`}>
                Events
              </a>
            </Link>
            <Link href="/gallery">
              <a className={`text-sm font-medium transition-colors ${
                location === "/gallery" ? "text-primary" : "text-neutral-600 hover:text-primary"
              }`}>
                Gallery
              </a>
            </Link>
            <Link href="/contact">
              <a className={`text-sm font-medium transition-colors ${
                location === "/contact" ? "text-primary" : "text-neutral-600 hover:text-primary"
              }`}>
                Contact
              </a>
            </Link>
          </nav>

          <Link href="/donate">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Donate
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
