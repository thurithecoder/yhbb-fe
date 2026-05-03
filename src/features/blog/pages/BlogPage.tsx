import * as React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BLOG_POSTS = [
  {
    id: '1',
    title: 'The Art of the Perfect Hummus',
    excerpt: 'Discover the secret ingredients and techniques used by master chefs to create the creamiest hummus you have ever tasted.',
    author: 'Chef Omar',
    date: 'Oct 12, 2026',
    category: 'Recipes',
    image: 'https://picsum.photos/seed/hummus/800/600',
  },
  {
    id: '2',
    title: 'Top 5 Hidden Gems in Dubai',
    excerpt: 'Escape the tourist traps and explore these authentic eateries that locals keep to themselves.',
    author: 'Layla M.',
    date: 'Oct 10, 2026',
    category: 'Travel',
    image: 'https://picsum.photos/seed/dubai/800/600',
  },
  {
    id: '3',
    title: 'Sustainability in the Kitchen',
    excerpt: 'How Yalla Habibi restaurants are leading the way in reducing food waste and supporting local farmers.',
    author: 'Admin',
    date: 'Oct 05, 2026',
    category: 'Community',
    image: 'https://picsum.photos/seed/garden/800/600',
  },
];

export default function BlogPage() {
  return (
    <div className="bg-[#ffcf1c] min-h-screen">

      {/* ── Hero band ── */}
      <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-[3px] bg-black rounded-full" />
              <span className="bg-black text-[#ffcf1c] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full">
                The Habibi Journal
              </span>
            </div>
            <h1
              className="font-black uppercase tracking-tighter text-black leading-[0.9] mb-3"
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(2.4rem, 8vw, 5.5rem)' }}
            >
              Stories From<br />The Kitchen
            </h1>
            <p className="text-[#5a4a00] font-semibold text-sm sm:text-base max-w-lg leading-relaxed">
              Explore the culture, recipes, and people behind the finest Middle Eastern flavors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Black stripe */}
      <div className="h-[5px] bg-black" />

      {/* ── Dark band — featured + grid ── */}
      <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

          {/* Featured post */}
          <Link to={`/blog/${BLOG_POSTS[0].id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ffcf1c] rounded-2xl sm:rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300"
            >
              <div className="relative h-[220px] sm:h-[280px] lg:h-auto overflow-hidden">
                <img
                  src={BLOG_POSTS[0].image}
                  alt={BLOG_POSTS[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[#ffcf1c] text-black text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full">
                    Featured
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {BLOG_POSTS[0].date}
                  </span>
                </div>
                <h2
                  className="font-black uppercase tracking-tighter text-white leading-[1.0] group-hover:text-[#ffcf1c] transition-colors"
                  style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.3rem, 3vw, 2rem)' }}
                >
                  {BLOG_POSTS[0].title}
                </h2>
                <p className="text-neutral-500 text-sm font-medium leading-relaxed line-clamp-3">
                  {BLOG_POSTS[0].excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-[#2a2a2a] pt-4 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                      <User className="w-4 h-4 text-neutral-500" />
                    </div>
                    <span className="text-xs font-black text-[#ffcf1c]">{BLOG_POSTS[0].author}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#ffcf1c] uppercase tracking-wider flex items-center gap-1">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Post grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {BLOG_POSTS.slice(1).map((post, i) => (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (i + 1), duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ffcf1c] rounded-xl sm:rounded-2xl overflow-hidden transition-colors duration-300 h-full"
                >
                  <div className="relative h-[160px] sm:h-[180px] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 text-black text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {post.date}
                    </div>
                    <h3
                      className="font-black uppercase tracking-tight text-white leading-[1.05] group-hover:text-[#ffcf1c] transition-colors"
                      style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-neutral-500 text-xs font-medium leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between border-t border-[#2a2a2a] pt-3">
                      <span className="text-xs font-black text-[#ffcf1c]">{post.author}</span>
                      <span className="text-[9px] font-black text-[#ffcf1c] uppercase tracking-wider flex items-center gap-1">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Black stripe */}
      <div className="h-[5px] bg-black" />

      {/* ── Newsletter band ── */}
      <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
            <div className="w-13 h-13 bg-[#ffcf1c] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-6 h-6 text-black" />
            </div>
            <h2
              className="font-black uppercase tracking-tighter text-white leading-[0.9] mb-3"
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.8rem, 5vw, 3.2rem)' }}
            >
              Never Miss<br />
              <span className="text-[#ffcf1c]">A Story</span>
            </h2>
            <p className="text-neutral-500 text-sm font-medium max-w-sm mx-auto leading-relaxed mb-6">
              Subscribe and get the latest recipes and restaurant news delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-12 px-5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder:text-neutral-600 text-sm font-medium outline-none focus:border-[#ffcf1c] transition-colors"
              />
              <Button className="h-12 px-7 bg-[#ffcf1c] hover:opacity-90 text-black rounded-xl font-black uppercase tracking-wide text-xs transition-all active:scale-95 border-none shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}