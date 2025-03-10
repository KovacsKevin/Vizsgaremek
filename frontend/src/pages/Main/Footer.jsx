// components/Footer.jsx

const Footer = ({ Link, Image }) => {
    const supportLinks = [
      { text: "Help Center", href: "#" },
      { text: "Safety Information", href: "#" },
      { text: "Cancellation Options", href: "#" },
      { text: "Contact Us", href: "#" }
    ]
  
    const companyLinks = [
      { text: "About Us", href: "#" },
      { text: "Careers", href: "#" },
      { text: "Press", href: "#" },
      { text: "Investors", href: "#" }
    ]
  
    const partnerLinks = [
      { text: "Partner Portal", href: "#" },
      { text: "List Your Property", href: "#" },
      { text: "Affiliate Program", href: "#" },
      { text: "Connectivity Partners", href: "#" }
    ]
  
    return (
      <footer className="bg-neutral-900/80 backdrop-blur-md text-white/80 py-12 mt-auto border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FooterColumn title="Support" links={supportLinks} Link={Link} />
            <FooterColumn title="Company" links={companyLinks} Link={Link} />
            <FooterColumn title="Partners" links={partnerLinks} Link={Link} />
  
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Mobile</h3>
              <p className="mb-4">Get the app for easier booking and exclusive deals!</p>
              <div className="flex space-x-4">
                <Link href="#" className="block w-32">
                  <Image
                    src="/placeholder.svg?height=40&width=120&text=App+Store"
                    alt="Download on App Store"
                    width={120}
                    height={40}
                    className="w-full rounded-md"
                  />
                </Link>
                <Link href="#" className="block w-32">
                  <Image
                    src="/placeholder.svg?height=40&width=120&text=Google+Play"
                    alt="Get it on Google Play"
                    width={120}
                    height={40}
                    className="w-full rounded-md"
                  />
                </Link>
              </div>
            </div>
          </div>
  
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p>&copy; {new Date().getFullYear()} TravelEase.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }
  
  const FooterColumn = ({ title, links, Link }) => {
    return (
      <div>
        <h3 className="text-lg font-bold mb-4 text-white">{title}</h3>
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index}>
              <Link href={link.href} className="hover:text-white transition-colors">
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  
  export default Footer