export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-hand-holding-heart text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold">Family Peace Foundation</h3>
                <p className="text-sm text-neutral-400">Kenya</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm">
              Strengthening family bonds and creating healthier communities through professional counseling and support services.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/events" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="/gallery" className="hover:text-white transition-colors">Gallery</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/donate" className="hover:text-white transition-colors">Donate</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-sm text-neutral-400">
              <div className="flex items-center space-x-2">
                <i className="fas fa-envelope"></i>
                <span>info@familypeace.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-phone"></i>
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt"></i>
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-sm text-neutral-400">
          <p>&copy; 2025 Family Peace Foundation. All rights reserved.</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <i className="fas fa-shield-alt text-success"></i>
            <span>SSL Encrypted</span>
            <span>•</span>
            <i className="fas fa-lock text-success"></i>
            <span>Privacy Protected</span>
            <span>•</span>
            <span>Powered by Pesapal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
