import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Play, Star, Users, BookOpen, Award,
  ChevronRight, Check, Zap, Globe, Shield, TrendingUp,
  Code, Palette, BarChart, Music, Camera, Brain
} from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Active Students', icon: Users },
  { value: '1,200+', label: 'Expert Courses', icon: BookOpen },
  { value: '350+', label: 'Top Instructors', icon: Award },
  { value: '4.8', label: 'Average Rating', icon: Star },
];

const features = [
  { icon: Zap, title: 'Learn at Your Pace', desc: 'Access courses anytime, anywhere. Lifetime access to all purchased content.' },
  { icon: Globe, title: 'World-Class Instructors', desc: 'Learn from industry experts with real-world experience and proven track records.' },
  { icon: Shield, title: 'Certificate of Completion', desc: 'Earn certificates recognised by top companies to boost your career.' },
  { icon: TrendingUp, title: 'Track Your Progress', desc: 'Detailed analytics to monitor your learning journey and stay motivated.' },
];

const categories = [
  { icon: Code, label: 'Development', count: '320 courses', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { icon: BarChart, label: 'Business', count: '180 courses', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { icon: Palette, label: 'Design', count: '140 courses', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { icon: Brain, label: 'AI & ML', count: '95 courses', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { icon: Camera, label: 'Photography', count: '75 courses', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  { icon: Music, label: 'Music', count: '60 courses', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at Google',
    avatar: 'PS',
    avatarColor: 'bg-violet-500',
    text: 'LMSPro completely transformed my career. The courses are incredibly well-structured and the instructors are world-class. Got my dream job within 3 months!',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Product Designer at Figma',
    avatar: 'RV',
    avatarColor: 'bg-blue-500',
    text: 'The UI/UX design course here is simply the best I have found online. Practical projects, expert feedback, and a supportive community. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Ananya Patel',
    role: 'Data Scientist at Amazon',
    avatar: 'AP',
    avatarColor: 'bg-green-500',
    text: 'I went from zero programming knowledge to landing a data science job. The AI/ML track is phenomenal — worth every penny.',
    rating: 5,
  },
];

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'Perfect for trying out LMSPro',
    features: ['Access to free courses', 'Basic progress tracking', 'Community forum access', 'Mobile app access'],
    cta: 'Get started free',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹999',
    period: '/month',
    desc: 'For serious learners',
    features: ['Unlimited course access', 'Certificate of completion', 'Offline downloads', 'Priority support', 'AI recommendations', '1-on-1 mentoring sessions'],
    cta: 'Start Pro plan',
    ctaLink: '/register',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '₹2,499',
    period: '/month',
    desc: 'For teams of 5+',
    features: ['Everything in Pro', 'Team analytics dashboard', 'Admin controls', 'Custom learning paths', 'API access', 'Dedicated account manager'],
    cta: 'Contact sales',
    ctaLink: '/register',
    highlighted: false,
  },
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950 pt-20 pb-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200 dark:bg-violet-900/30 rounded-full blur-3xl opacity-40 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900/30 rounded-full blur-3xl opacity-40 translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-sm font-medium rounded-full mb-6">
                <Zap className="w-3.5 h-3.5" />
                #1 Online Learning Platform in India
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                Learn Without
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500"> Limits</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-lg">
                Join over 50,000 students learning from world-class instructors. Build real skills, earn certificates, and transform your career today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:shadow-xl hover:-translate-y-0.5">
                  Start learning free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/courses"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-0.5">
                  <Play className="w-4 h-4 text-violet-600" />
                  Browse courses
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['bg-violet-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'].map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-white font-semibold`}>
                      {['P', 'R', 'A', 'S'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 ml-1">4.8</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">from 12,000+ reviews</p>
                </div>
              </div>
            </div>

            {/* Right — hero card */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
                {/* Course preview card */}
                <div className="bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl p-6 mb-4 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Code className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium opacity-90">Full Stack Development</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">React + Node.js Masterclass</h3>
                  <p className="text-sm opacity-75">42 lessons • 28 hours • Certificate</p>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span>Your progress</span>
                      <span>68%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-2 bg-white rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Students', value: '2.4K' },
                    { label: 'Rating', value: '4.9 ★' },
                    { label: 'Hours', value: '28h' },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-base font-bold text-gray-900 dark:text-white">{value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Next lesson */}
                <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                  <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">Up next</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Building REST APIs with Express</p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Certificate earned!</p>
                  <p className="text-xs text-gray-500">Python Fundamentals</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">New enrollment</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">+847 students today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Explore Top Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Thousands of courses across the most in-demand skills
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ icon: Icon, label, count, color }) => (
              <Link key={label} to={`/courses?category=${label.toLowerCase()}`}
                className="group flex flex-col items-center p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                Why students choose LMSPro
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                We combine cutting-edge technology with world-class content to deliver the best learning experience possible.
              </p>
              <div className="space-y-6">
                {features.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-11 h-11 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/courses" className="inline-flex items-center gap-2 mt-8 text-violet-600 dark:text-violet-400 font-semibold hover:gap-3 transition-all">
                Browse all courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature visual */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Completion rate', value: '94%', sub: 'industry leading', color: 'from-violet-500 to-violet-700' },
                { label: 'Student satisfaction', value: '4.8★', sub: '50K+ reviews', color: 'from-blue-500 to-blue-700' },
                { label: 'Career advancement', value: '78%', sub: 'got promotions', color: 'from-green-500 to-green-700' },
                { label: 'Active instructors', value: '350+', sub: 'industry experts', color: 'from-orange-500 to-orange-700' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}>
                  <p className="text-3xl font-extrabold mb-1">{value}</p>
                  <p className="text-sm font-semibold opacity-90">{label}</p>
                  <p className="text-xs opacity-70 mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Loved by learners worldwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Real stories from our students</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  i === activeTestimonial
                    ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-200 dark:shadow-violet-900/30 scale-105'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                }`}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className={`w-4 h-4 fill-current ${i === activeTestimonial ? 'text-yellow-300' : 'text-yellow-400'}`} />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${i === activeTestimonial ? 'text-violet-100' : 'text-gray-600 dark:text-gray-400'}`}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${i === activeTestimonial ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{t.name}</p>
                    <p className={`text-xs ${i === activeTestimonial ? 'text-violet-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-violet-600 w-6' : 'bg-gray-300 dark:bg-gray-700 w-2'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map(({ name, price, period, desc, features, cta, ctaLink, highlighted }) => (
              <div key={name}
                className={`relative rounded-2xl p-8 border ${
                  highlighted
                    ? 'bg-violet-600 border-violet-600 text-white shadow-2xl shadow-violet-200 dark:shadow-violet-900/30 scale-105'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                {highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-1 ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{name}</h3>
                <p className={`text-sm mb-4 ${highlighted ? 'text-violet-200' : 'text-gray-500 dark:text-gray-400'}`}>{desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-extrabold ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{price}</span>
                  <span className={`text-sm ${highlighted ? 'text-violet-200' : 'text-gray-500 dark:text-gray-400'}`}>{period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlighted ? 'bg-white/20' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <Check className={`w-3 h-3 ${highlighted ? 'text-white' : 'text-violet-600 dark:text-violet-400'}`} />
                      </div>
                      <span className={`text-sm ${highlighted ? 'text-violet-100' : 'text-gray-600 dark:text-gray-300'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={ctaLink}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    highlighted
                      ? 'bg-white text-violet-600 hover:bg-violet-50'
                      : 'bg-violet-600 hover:bg-violet-700 text-white'
                  }`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-800 dark:to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-lg text-violet-100 mb-8">
            Join 50,000+ learners already transforming their careers with LMSPro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-200">
              View all courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}