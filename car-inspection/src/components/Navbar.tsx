'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Car, Wrench, UserCog, Home } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { containerVariants, itemVariants, underlineVariants} from "@/lib/animations";
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const role = session?.user?.role;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Return nothing while session is loading (optional)
  if (status === 'loading') return null;

  const navLinks = [
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: UserCog, roles: ['admin', 'team'] },
    { href: '/team/dashboard', label: 'Team Dashboard', icon: Wrench, roles: ['admin', 'team'] },
    { href: '/admin/dashboard/post-job', label: 'Post Job', icon: Car, roles: ['admin'] },
    { href: '/admin/dashboard/add-user', label: 'Add User', icon: Home, roles: ['admin'] },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={cn(
        "w-full fixed top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-all duration-300",
        scrolled ? "py-2 shadow-lg" : "py-4"
      )}
    >
      <div className="mx-auto px-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl font-bold"
              onMouseEnter={() => setHoveredLink('home')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <motion.div
                animate={{ 
                  rotate: hoveredLink === 'home' ? 10 : 0,
                  scale: hoveredLink === 'home' ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Car className="w-6 h-6 text-primary" />
              </motion.div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutoSure
              </span>
              {hoveredLink === 'home' && (
                <motion.span 
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial="hidden"
                  animate="show"
                  variants={underlineVariants}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          </motion.div>

          <nav className="flex items-center space-x-6">
            {navLinks
              .filter((link) => link.roles.includes(role)) // ✅ only render links allowed for role
              .map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <motion.div 
                    key={link.href}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <motion.div
                        animate={{ 
                          rotate: hoveredLink === link.href ? 10 : 0,
                          scale: hoveredLink === link.href ? 1.2 : 1
                        }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span>{link.label}</span>
                      
                      {(isActive || hoveredLink === link.href) && (
                        <motion.span 
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                          initial="hidden"
                          animate="show"
                          variants={underlineVariants}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
          </nav>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ThemeToggle />
        </motion.div>
      </div>
    </motion.header>
  );
}
