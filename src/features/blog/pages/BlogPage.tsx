import * as React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    image: 'https://picsum.photos/seed/hummus/800/600'
  },
  {
    id: '2',
    title: 'Top 5 Hidden Gems in Dubai',
    excerpt: 'Escape the tourist traps and explore these authentic eateries that locals keep to themselves.',
    author: 'Layla M.',
    date: 'Oct 10, 2026',
    category: 'Travel',
    image: 'https://picsum.photos/seed/dubai/800/600'
  },
  {
    id: '3',
    title: 'Sustainability in the Kitchen',
    excerpt: 'How Yalla Habibi restaurants are leading the way in reducing food waste and supporting local farmers.',
    author: 'Admin',
    date: 'Oct 05, 2026',
    category: 'Community',
    image: 'https://picsum.photos/seed/garden/800/600'
  }
];

export default function BlogPage() {
  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="bg-green-50 text-[#6EA15C] border-none px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-4">
            The Habibi Journal
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-[#6EA15C]">
            STORIES FROM THE KITCHEN
          </h1>
          <p className="text-neutral-500 text-lg font-medium mt-6">
            Explore the culture, recipes, and people behind the finest Middle Eastern flavors.
          </p>
        </motion.div>
      </section>

      {/* Featured Post */}
      <section>
        <Link to={`/blog/${BLOG_POSTS[0].id}`}>
          <Card className="border-none shadow-2xl rounded-[48px] overflow-hidden bg-white group">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-[400px] lg:h-auto overflow-hidden">
                <img 
                  src={BLOG_POSTS[0].image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={BLOG_POSTS[0].title}
                />
              </div>
              <CardContent className="p-12 flex flex-col justify-center space-y-8">
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#6EA15C] text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                    Featured
                  </Badge>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {BLOG_POSTS[0].date}
                  </span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none group-hover:text-[#6EA15C] transition-colors">
                  {BLOG_POSTS[0].title}
                </h2>
                <p className="text-neutral-500 text-lg font-medium leading-relaxed">
                  {BLOG_POSTS[0].excerpt}
                </p>
                <div className="flex items-center justify-between pt-8 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-neutral-400" />
                    </div>
                    <span className="font-bold text-[#6EA15C]">{BLOG_POSTS[0].author}</span>
                  </div>
                  <Button variant="ghost" className="font-black uppercase tracking-tight text-[#6EA15C] group-hover:translate-x-2 transition-transform">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      </section>

      {/* Post Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BLOG_POSTS.slice(1).map((post) => (
          <motion.div
            key={post.id}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link to={`/blog/${post.id}`}>
              <Card className="border-none shadow-sm hover:shadow-xl transition-all rounded-[32px] overflow-hidden bg-white group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={post.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={post.title}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-neutral-900 border-none font-bold px-3 py-1 rounded-full">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </div>
                  <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-[#6EA15C] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-neutral-500 text-sm font-medium line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="pt-6 flex items-center justify-between border-t">
                    <span className="text-sm font-bold text-[#6EA15C]">{post.author}</span>
                    <Button variant="ghost" size="sm" className="font-black uppercase tracking-tight text-[#6EA15C]">
                      Read <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Newsletter */}
      <section className="bg-neutral-900 rounded-[48px] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#6EA15C]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#6EA15C]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <div className="bg-[#6EA15C] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#6EA15C] tracking-tighter uppercase">
            NEVER MISS A STORY
          </h2>
          <p className="text-neutral-400 font-medium max-w-lg mx-auto">
            Subscribe to our newsletter and get the latest recipes and restaurant news delivered to your inbox.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="flex-1 h-14 px-6 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#6EA15C] transition-colors"
          />
          <Button className="h-14 px-8 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95">
            Subscribe
          </Button>
        </div>
      </section>
    </div>
  );
}
