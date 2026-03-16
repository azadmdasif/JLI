import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'motion/react';
import React, { useRef, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  ArrowRight, Book, GraduationCap, Microscope, Compass, 
  ChevronRight, Sparkles, Globe, Lightbulb, Target, 
  ShieldCheck, Calendar, Menu, X, Mail, Phone, MapPin,
  Cpu, Rocket, Users, Home
} from 'lucide-react';

// --- Animation Variants ---

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

// --- Components ---

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-jli-accent origin-left z-[100]"
      style={{ scaleX }}
    />
  );
};

const Magnetic = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

const TiltCard = ({ children, className = "" }: { children: ReactNode, className?: string, key?: React.Key }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

const LensFlare = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      style={{ opacity: 0.4 }}
    >
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-jli-accent/10 blur-[120px]"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-white/5 blur-[80px]"
        style={{ 
          x: useTransform(x, (val) => val * 1.2), 
          y: useTransform(y, (val) => val * 1.2), 
          translateX: '-50%', translateY: '-50%' 
        }}
      />
    </motion.div>
  );
};

const Reveal = ({ children, width = "w-full", delay = 0 }: { children: ReactNode, width?: string, delay?: number }) => {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        initial: { opacity: 0, y: 40, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 }
      }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={width}
    >
      {children}
    </motion.div>
  );
};

const Section = ({ 
  children, 
  id, 
  className = "", 
  bgColor = "#ffffff",
  onInView 
}: { 
  children: ReactNode, 
  id?: string, 
  className?: string, 
  bgColor?: string,
  onInView?: (color: string) => void 
}) => {
  return (
    <motion.section
      id={id}
      onViewportEnter={() => onInView?.(bgColor)}
      className={`relative py-24 md:py-40 overflow-hidden transition-colors duration-1000 ${className}`}
    >
      {children}
    </motion.section>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Vision', href: '#vision' },
    { name: 'Curriculum', href: '#curriculum' },
    { name: 'Admissions', href: '#jyst' },
    { name: 'Faculty', href: '#faculty' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) ${isScrolled ? 'bg-white/80 backdrop-blur-2xl py-4 border-b border-black/5 shadow-2xl' : 'bg-transparent py-10'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        <motion.a 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          href="#" 
          className="flex items-center space-x-3 group"
        >
          <img src="/logo.png" alt="JiSRA Logo" className="h-12 w-auto" referrerPolicy="no-referrer" />
          <div className="flex flex-col">
            <span className="text-jli-text font-serif font-bold text-xl tracking-tight leading-none">JiSRA</span>
            <span className="text-jli-muted text-[8px] uppercase tracking-[0.4em] font-bold">Leadership Institute</span>
          </div>
        </motion.a>

        <div className="hidden lg:flex items-center space-x-12">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex items-center space-x-12"
          >
            {navLinks.map((link) => (
              <motion.a 
                key={link.name} 
                variants={fadeInUp}
                href={link.href} 
                className="relative text-[10px] uppercase tracking-[0.3em] font-bold text-jli-muted hover:text-jli-accent transition-colors group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-jli-accent transition-all duration-500 group-hover:w-full" />
              </motion.a>
            ))}
          </motion.div>
          <motion.a 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            href="#jyst" 
            className="glow-button bg-jli-gradient text-white px-8 py-3 rounded-sm font-bold text-[9px] uppercase tracking-[0.3em] hover:brightness-110 transition-all"
          >
            Apply Now
          </motion.a>
        </div>

        <button className="lg:hidden text-jli-text" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-black/5 p-8 space-y-6 overflow-hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[10px] uppercase tracking-[0.3em] font-bold text-jli-muted"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#jyst" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center bg-jli-accent text-white py-4 rounded-sm font-bold text-[9px] uppercase tracking-[0.3em]"
            >
              Apply for JYST
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onInView }: { onInView: (color: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <motion.section 
      ref={containerRef} 
      onViewportEnter={() => onInView("#ffffff")}
      className="relative min-h-screen flex items-start justify-center overflow-hidden pt-28 md:pt-36 pb-16"
    >
      <LensFlare />
      {/* Background Image with Parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000" 
          alt="Students Collaborating" 
          className="w-full h-full object-cover opacity-20 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white" />
      </motion.div>

      <div className="absolute inset-0 islamic-pattern opacity-[0.01] z-0" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ y: textY }}
          className="space-y-8 md:space-y-12"
        >
          {/* Header Stack */}
          <div className="flex flex-col items-center space-y-4 mb-4">
            

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col items-center gap-3"
            >
              <div className="inline-flex items-center space-x-2 px-6 py-2 rounded-full glass text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-jli-accent">
                <Sparkles size={12} />
                <span>Inaugural Cohort 2026</span>
              </div>
              <div className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-jli-accent/10 border border-jli-accent/20 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-jli-accent">
                <span>Classes 5 & 6 Only (CBSE)</span>
              </div>
            </motion.div>
          </div>
          
          <div className="space-y-6">
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-8xl font-display font-bold text-jli-text leading-tight tracking-tight"
            >
              Is your child <span className="text-gradient italic">ready to lead?</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-base md:text-2xl text-jli-text max-w-4xl mx-auto font-light leading-relaxed px-4"
            >
              JiSRA Leadership Institute is selecting 20 exceptional Muslim students from <span className="text-jli-accent font-bold underline decoration-jli-accent/30 underline-offset-8">Classes 5 and 6</span> for its inaugural cohort — exclusively for the <span className="font-bold">CBSE curriculum</span>.
            </motion.p>
          </div>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8 pt-4 md:pt-8"
          >
            <Magnetic>
              <a href="#jyst" className="glow-button bg-jli-gradient text-white px-10 md:px-12 py-5 md:py-6 rounded-sm font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] hover:brightness-110 shadow-2xl transition-all w-full sm:w-auto text-center">
                Apply for selection
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#program" className="glass text-jli-text px-10 md:px-12 py-5 md:py-6 rounded-sm font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] hover:bg-black/5 transition-all w-full sm:w-auto text-center">
                Explore the program
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Hidden on small screens to avoid overlap */}
      <motion.div 
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center space-y-4"
      >
        <span className="text-[9px] uppercase tracking-[0.5em] text-jli-muted font-bold">Explore</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-jli-accent to-transparent" />
      </motion.div>
    </motion.section>
  );
};

const Mission = ({ onInView }: { onInView: (color: string) => void }) => {
  const imageRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"]
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <Section id="vision" bgColor="#f0fdf4" onInView={onInView}>
      <div className="absolute inset-0 islamic-pattern opacity-[0.03]" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="space-y-10"
          >
            <motion.div variants={fadeInUp} className="w-12 h-[1px] bg-jli-accent" />
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-display font-bold text-jli-text leading-tight">
              Our <span className="text-gradient italic">Vision & Mission</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-jli-muted text-lg leading-relaxed font-light">
              JiSRA is more than a school; it is a bridge—a conduit between the present and the future, knowledge and action, this world and the next. Our mission is captured in three guiding words: <span className="text-jli-accent font-bold">Improve Learning Outcomes</span>. This simple yet profound objective shapes every facet of our educational journey.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-jli-muted text-lg leading-relaxed font-light">
              We are dedicated to shaping self-aware, articulate, and scientifically-literate individuals who are active contributors to society and steadfast in their spiritual lives.
            </motion.p>
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
              <div className="space-y-4">
                <div className="text-jli-accent font-serif text-3xl font-bold italic">Class 5 & 6</div>
                <p className="text-[10px] uppercase tracking-widest text-jli-muted font-bold">Exclusively for CBSE</p>
              </div>
              <div className="space-y-4">
                <div className="text-jli-accent font-serif text-3xl font-bold italic">20</div>
                <p className="text-[10px] uppercase tracking-widest text-jli-muted font-bold">Elite Scholars per Class</p>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div ref={imageRef} className="aspect-[4/5] rounded-sm overflow-hidden border border-black/5 relative group">
              <motion.img 
                style={{ y: imageY }}
                src="https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&q=80&w=1000" 
                alt="Classical Scholarship" 
                className="w-full h-[120%] object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 absolute top-[-10%]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="relative md:absolute mt-8 md:mt-0 md:-bottom-12 md:-left-12 glass p-6 md:p-10 rounded-sm max-w-xs border-jli-accent/20 shadow-2xl z-10"
            >
              <Compass className="text-jli-accent mb-4" size={32} />
              <p className="text-xs text-jli-muted italic leading-relaxed">
                "Guiding the soul while sharpening the mind. We believe true leadership is rooted in ethical clarity and scientific rigor."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

const Pedagogy = ({ onInView }: { onInView: (color: string) => void }) => {
  const pillars = [
    {
      title: "Self",
      desc: "Cultivating discipline, reflection, health, and responsibility.",
      icon: <Target size={24} />,
    },
    {
      title: "Speech",
      desc: "Mastering language, expression, and the art of communication.",
      icon: <Sparkles size={24} />,
    },
    {
      title: "Science",
      desc: "Understanding the world with curiosity, precision, and creativity.",
      icon: <Microscope size={24} />,
    },
    {
      title: "Society",
      desc: "Engaging responsibly with family, community, and the nation.",
      icon: <Globe size={24} />,
    },
    {
      title: "Spirit",
      desc: "Developing faith, ethics, and a sense of transcendence.",
      icon: <Compass size={24} />,
    }
  ];

  return (
    <Section bgColor="#fef2f2" onInView={onInView}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center mb-16 md:mb-32 space-y-6">
            <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">The 5S Framework</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-jli-text">
              The <span className="text-gradient italic">Five Pillars</span> of JiSRA
            </h2>
            <p className="text-jli-muted max-w-2xl mx-auto font-light leading-relaxed">
              At the core of JiSRA's pedagogy are the 5S Pillars, a holistic framework designed to nurture well-rounded individuals. Every subject, activity, and interaction is intentionally connected to one or more of these pillars.
            </p>
          </div>
        </Reveal>
        
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8"
        >
          {pillars.map((item, idx) => (
            <TiltCard key={idx} className="h-full">
              <motion.div 
                variants={fadeInUp}
                className="group relative p-8 rounded-sm bg-jli-secondary border border-black/5 hover:border-jli-accent transition-all duration-700 h-full"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-jli-accent mb-8 group-hover:scale-110 group-hover:bg-jli-accent group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-jli-text mb-4">{item.title}</h3>
                  <p className="text-jli-muted text-xs leading-relaxed font-light">{item.desc}</p>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>
      </div>
    </Section>
  );
};

const AgentsOfVision = ({ onInView }: { onInView: (color: string) => void }) => {
  const agents = [
    {
      title: "The Teacher",
      subtitle: "The Agent of Change",
      desc: "Our teachers are empowered with competitive compensation, autonomy to innovate, and strong content support for professional development.",
      icon: <Users size={24} />,
      features: ["Competitive Compensation", "Innovation Autonomy", "Content Staff Support"]
    },
    {
      title: "The Environment",
      subtitle: "Nurturing Atmosphere",
      desc: "A balanced environment where students collaborate through co-operation, strive for excellence in competition, and uphold Adab (manners).",
      icon: <Home size={24} />,
      features: ["Co-operation", "Healthy Competition", "Adab (Manners)"]
    },
    {
      title: "Motivation",
      subtitle: "Inspired Growth",
      desc: "Students are inspired through interactions with role models and a balanced understanding of accountability (Hope and Fear).",
      icon: <Rocket size={24} />,
      features: ["Real-world Role Models", "Hope and Fear Balance", "Accountability & Reward"]
    }
  ];

  return (
    <Section bgColor="#ffffff" onInView={onInView}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center mb-16 md:mb-32 space-y-6">
            <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">Implementation</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-jli-text">
              The <span className="text-gradient italic">Agents</span> of Our Vision
            </h2>
            <p className="text-jli-muted max-w-2xl mx-auto font-light leading-relaxed">
              The success of JiSRA's vision is upheld by three key agents that ensure our educational objectives are met with excellence.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {agents.map((agent, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="group p-10 rounded-sm glass border border-black/5 hover:border-jli-accent transition-all duration-700"
            >
              <div className="w-14 h-14 rounded-full bg-jli-accent/10 flex items-center justify-center text-jli-accent mb-8 group-hover:bg-jli-accent group-hover:text-white transition-all duration-500">
                {agent.icon}
              </div>
              <h3 className="text-2xl font-display font-bold text-jli-text mb-2">{agent.title}</h3>
              <p className="text-jli-accent text-[10px] uppercase tracking-widest font-bold mb-6">{agent.subtitle}</p>
              <p className="text-jli-muted text-sm leading-relaxed font-light mb-8 italic">
                "{agent.desc}"
              </p>
              <ul className="space-y-3">
                {agent.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-jli-accent" />
                    <span className="text-xs text-jli-text font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Curriculum = ({ onInView }: { onInView: (color: string) => void }) => {
  const pillars = [
    {
      title: "Academic Rigor",
      desc: "JiSRA follows the CBSE curriculum, integrating our 5S pillars into every lesson—from Mathematics to Science.",
      icon: <GraduationCap size={24} />,
    },
    {
      title: "Islamic Learning",
      desc: "The bedrock of our identity: Quran & Hifz, Islamic Studies, and Arabic Language fluency.",
      icon: <Book size={24} />,
    },
    {
      title: "Modern Skills",
      desc: "Preparing for the future with Coding, AI & Robotics, Entrepreneurship (BFK), and essential Life Skills.",
      icon: <Cpu size={24} />,
    },
    {
      title: "Residential Setup",
      desc: "A 24/7 immersive Islamic environment fostering holistic growth, cooperation, and the refinement of Adab (etiquette) in daily life.",
      icon: <Home size={24} />,
    }
  ];

  return (
    <Section bgColor="#f0f9ff" onInView={onInView}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center mb-16 md:mb-32 space-y-6">
            <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">The Curriculum</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-jli-text">
              What Students <span className="text-gradient italic">Will Learn</span>
            </h2>
            <p className="text-jli-muted max-w-2xl mx-auto font-light leading-relaxed">
              Our immersive residential program is designed to cultivate the whole person—intellectually, spiritually, and practically.
            </p>
          </div>
        </Reveal>
        
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {pillars.map((item, idx) => (
            <TiltCard key={idx} className="h-full">
              <motion.div 
                variants={fadeInUp}
                className="group relative p-10 rounded-sm bg-jli-card border border-black/5 hover:border-jli-accent transition-all duration-700 h-full"
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full glass flex items-center justify-center text-jli-accent mb-10 group-hover:scale-110 group-hover:bg-jli-accent group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-jli-text mb-6">{item.title}</h3>
                  <p className="text-jli-muted text-sm leading-relaxed font-light">{item.desc}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <Magnetic>
            <a href="#jyst" className="glow-button bg-jli-gradient text-white px-12 py-6 rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] hover:brightness-110 shadow-2xl transition-all">
              Apply for the JiSRA Young Scholars Test (JYST)
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </Section>
  );
};

const TheJiSRAWay = ({ onInView }: { onInView: (color: string) => void }) => {
  const sections = [
    {
      title: "Academic Rigor",
      subtitle: "The CBSE Curriculum",
      content: "JiSRA follows the nationally recognized CBSE curriculum, ensuring a strong foundation in core subjects while integrating our 5S pillars into every lesson.",
      points: [
        "Core Subjects: English, Hindi, Math, Science, Social Science, and IT.",
        "Beyond Textbooks: Connecting geometry to universal design (Spirit).",
        "Moral Context: Exploring history through societal structures and moral lessons.",
        "Character Building: Science experiments that foster patience and discipline (Self)."
      ],
      icon: <GraduationCap size={24} />,
      color: "bg-jli-card"
    },
    {
      title: "Islamic Learning",
      subtitle: "The Foundation of Our Identity",
      content: "Islamic education is the bedrock of our identity, seamlessly integrated into the academic fabric rather than being a separate track.",
      points: [
        "Quran & Hifz: Phased journey from Tajweed and 99 Names to specialized Hifz.",
        "Islamic Studies: Comprehensive curriculum covering Tafsir, Akhlaqiyat, and History.",
        "Building Character: Connecting Zakat to ethics and Sahabas to leadership."
      ],
      icon: <Book size={24} />,
      color: "bg-jli-secondary"
    },
    {
      title: "Modern Skills",
      subtitle: "Preparing for the Future",
      content: "Equipping students for the 21st-century economy through a blend of technology, business, and essential life competencies.",
      points: [
        "Tech Lab: Weekly classes in Coding, AI, Robotics, and Ethical Automation.",
        "Entrepreneurship: BFK program from idea generation to capstone ventures.",
        "Communication: Public speaking, debate, and effective writing."
      ],
      icon: <Cpu size={24} />,
      color: "bg-jli-tertiary"
    }
  ];

  return (
    <Section id="curriculum" bgColor="#ffffff" onInView={onInView}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center mb-16 md:mb-32 space-y-6">
            <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">Integrated Approach</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-jli-text">
              The <span className="text-gradient italic">JiSRA Way</span>
            </h2>
            <p className="text-jli-muted max-w-2xl mx-auto font-light leading-relaxed">
              We go beyond standard education by weaving faith, science, and future-ready skills into a single, cohesive journey.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="flex flex-col h-full"
            >
              <div className={`p-10 rounded-2xl ${section.color} border border-black/5 h-full flex flex-col`}>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-jli-accent shadow-sm mb-8">
                  {section.icon}
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-jli-text mb-1">{section.title}</h3>
                  <p className="text-jli-accent text-[10px] uppercase tracking-widest font-bold">{section.subtitle}</p>
                </div>
                <p className="text-jli-muted text-sm leading-relaxed mb-8 font-light italic">
                  "{section.content}"
                </p>
                <ul className="space-y-4 mt-auto">
                  {section.points.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start space-x-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-jli-accent flex-shrink-0" />
                      <span className="text-xs text-jli-text font-light leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Admissions = ({ onInView }: { onInView: (color: string) => void }) => {
  const dates = [
    { date: "28 March 2026", status: "Most seats available", highlight: true },
    { date: "05 April 2026", status: "Limited seats remaining", highlight: false },
    { date: "12 April 2026", status: "Final assessment date", highlight: false }
  ];

  return (
    <Section id="jyst" bgColor="#f0fdf4" onInView={onInView}>
      <div className="absolute inset-0 islamic-pattern opacity-[0.02]" />
      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
        <Reveal>
          <div className="text-center space-y-8 mb-12 md:mb-20">
            <div className="space-y-4">
              <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">Admissions Process</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-jli-text">
                JiSRA Young Scholars <br /><span className="text-gradient italic">Test (JYST) 2026</span>
                <div className="text-xl md:text-2xl mt-4 text-jli-accent font-serif italic">For Classes 5 & 6 (CBSE)</div>
              </h2>
              <p className="text-jli-muted text-[10px] uppercase tracking-[0.3em] font-bold">The selection process for admission to JiSRA Leadership Institute</p>
            </div>
            
            <p className="text-jli-muted text-lg md:text-xl leading-relaxed font-light max-w-3xl mx-auto">
              The JiSRA Young Scholars Test identifies exceptional Muslim students with curiosity, character, and leadership potential. Through this assessment, we select <span className="text-jli-accent font-bold underline decoration-jli-accent/30 underline-offset-8">20 students each from Classes 5 and 6</span> exclusively for our <span className="font-bold">CBSE-based</span> residential fellowship.
            </p>
          </div>
        </Reveal>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {dates.map((item, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              className={`p-10 rounded-sm border transition-all duration-500 text-center flex flex-col justify-center ${
                item.highlight 
                ? "bg-white border-jli-accent shadow-xl scale-105 z-10" 
                : "bg-white/50 border-black/5 hover:bg-white hover:border-black/10"
              }`}
            >
              <Calendar className={`mx-auto mb-6 ${item.highlight ? "text-jli-accent" : "text-jli-muted"}`} size={32} />
              <h3 className="text-2xl font-display font-bold text-jli-text mb-2">{item.date}</h3>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${item.highlight ? "text-jli-accent" : "text-jli-muted"}`}>
                {item.status}
              </p>
              {item.highlight && (
                <div className="mt-4 inline-block px-3 py-1 bg-jli-accent/10 rounded-full">
                  <span className="text-[8px] text-jli-accent font-bold uppercase tracking-widest">Recommended</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <Reveal delay={0.4}>
          <div className="text-center space-y-6">
            <Magnetic>
              <a href="#" className="glow-button inline-flex items-center bg-jli-gradient text-white px-16 py-8 rounded-sm font-bold text-[12px] uppercase tracking-[0.4em] hover:brightness-110 shadow-2xl transition-all w-full md:w-auto justify-center">
                Apply for the JiSRA Young Scholars Test
              </a>
            </Magnetic>
            <p className="text-[9px] text-jli-muted uppercase tracking-[0.3em] font-bold">
              Earlier assessment dates have more available seats.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

const Fellowship = ({ onInView }: { onInView: (color: string) => void }) => {
  return (
    <Section bgColor="#ffffff" onInView={onInView}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <Reveal>
          <div className="space-y-12">
            <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">The Journey Begins</span>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-display font-bold text-jli-text leading-tight">
              Become a JiSRA <br /> <span className="text-gradient italic">Young Fellow</span>
            </h2>
            <p className="text-jli-muted text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Join a community of exceptional peers and world-class mentors. Your path to leadership starts with a single test.
            </p>
            <motion.div 
              variants={fadeInUp}
              className="pt-12"
            >
              <Magnetic>
                <a href="#jyst" className="glow-button bg-jli-gradient text-white px-16 py-8 rounded-sm font-bold text-[12px] uppercase tracking-[0.4em] hover:brightness-110 shadow-2xl transition-all">
                  Apply for the JYST 2026
                </a>
              </Magnetic>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

const Faculty = ({ onInView }: { onInView: (color: string) => void }) => {
  const faculty = [
    { name: "Dr. Ahmed Mansour", role: "Dean of Islamic Sciences", bio: "Former Professor at Al-Azhar, specialist in Fiqh and Ethics." },
    { name: "Prof. Sarah Khalid", role: "Director of Modern Frontiers", bio: "AI Researcher with a focus on ethical computational models." },
    { name: "Ustadh Omar Farooq", role: "Master of Adab & Character", bio: "Specialist in classical Tarbiyah and spiritual mentorship." }
  ];

  return (
    <Section id="faculty" bgColor="#fffbeb" onInView={onInView}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center mb-16 md:mb-32 space-y-6">
            <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">Academic Leadership</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-jli-text">The <span className="text-gradient italic">Mentors</span></h2>
          </div>
        </Reveal>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {faculty.map((member, idx) => (
            <TiltCard key={idx}>
              <motion.div 
                variants={scaleIn}
                className="glass p-10 rounded-sm border-black/5 hover:border-jli-accent transition-all duration-500 text-center group h-full bg-jli-secondary/30"
              >
                <div className="w-24 h-24 rounded-full bg-jli-secondary mx-auto mb-8 flex items-center justify-center text-jli-accent group-hover:scale-110 group-hover:bg-jli-accent group-hover:text-white transition-all duration-500">
                  <Users size={40} />
                </div>
                <h3 className="text-2xl font-display font-bold text-jli-text mb-2">{member.name}</h3>
                <p className="text-jli-accent text-[10px] uppercase tracking-widest font-bold mb-6">{member.role}</p>
                <p className="text-jli-muted text-sm leading-relaxed font-light italic">"{member.bio}"</p>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>
      </div>
    </Section>
  );
};

const FAQ = ({ onInView }: { onInView: (color: string) => void }) => {
  const faqs = [
    { q: "What is the age requirement for classes 5 and 6?", a: "Students applying for Class 5 should typically be 10-11 years old, and Class 6 should be 11-12 years old." },
    { q: "Is the program fully residential?", a: "Yes, JLI is a fully residential institute designed to provide a 24/7 immersive learning and Tarbiyah environment." },
    { q: "How is the CBSE curriculum integrated?", a: "We follow the full CBSE syllabus with additional rigor in STEM subjects, ensuring students are prepared for national competitive exams." },
    { q: "What future skills are taught?", a: "Our students learn AI fundamentals, coding, critical thinking, and entrepreneurship through hands-on projects." }
  ];

  return (
    <Section id="faq" bgColor="#ffffff" onInView={onInView}>
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-12 md:mb-24 space-y-6">
            <span className="text-jli-accent text-[10px] uppercase tracking-[0.5em] font-bold">Inquiry</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-jli-text">Common <span className="text-gradient italic">Questions</span></h2>
          </div>
        </Reveal>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              className="glass p-8 rounded-sm border-black/5 hover:border-jli-accent/30 transition-all duration-500 bg-jli-secondary/20"
            >
              <h3 className="text-xl font-display font-bold text-jli-text mb-4">{faq.q}</h3>
              <p className="text-jli-muted text-sm leading-relaxed font-light">{faq.a}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white py-24 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24"
        >
          <motion.div variants={fadeInUp} className="space-y-8">
            <a href="#" className="flex items-center space-x-3">
              <img src="/logo.png" alt="JiSRA Logo" className="h-10 w-auto" referrerPolicy="no-referrer" />
              <div className="flex flex-col">
                <span className="text-jli-text font-serif font-bold text-xl tracking-tight leading-none">JiSRA</span>
                <span className="text-jli-muted text-[8px] uppercase tracking-[0.4em] font-bold">Leadership Institute</span>
              </div>
            </a>
            <p className="text-jli-muted text-xs leading-relaxed font-light italic">
              "Synthesizing the wisdom of Islamic civilization with the frontiers of modern knowledge."
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-8">
            <h4 className="text-jli-text font-display font-bold text-lg">Navigate</h4>
            <ul className="space-y-4">
              {['Philosophy', 'Program', 'JYST 2026', 'Faculty', 'FAQ'].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().split(' ')[0]}`} className="text-jli-muted text-xs hover:text-jli-accent transition-colors flex items-center group">
                    <ChevronRight size={10} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-8">
            <h4 className="text-jli-text font-display font-bold text-lg">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-jli-muted text-xs group cursor-pointer">
                <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-jli-accent group-hover:bg-jli-accent group-hover:text-white transition-all">
                  <Mail size={14} />
                </div>
                <span>admissions@jisra.edu</span>
              </li>
              <li className="flex items-center space-x-3 text-jli-muted text-xs group cursor-pointer">
                <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-jli-accent group-hover:bg-jli-accent group-hover:text-white transition-all">
                  <Phone size={14} />
                </div>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3 text-jli-muted text-xs group cursor-pointer">
                <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-jli-accent group-hover:bg-jli-accent group-hover:text-white transition-all">
                  <MapPin size={14} />
                </div>
                <span>New Delhi, India</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-8">
            <h4 className="text-jli-text font-display font-bold text-lg">Apply</h4>
            <p className="text-jli-muted text-xs leading-relaxed font-light">
              Registration for the JiSRA Young Scholars Test 2026 is now open.
            </p>
            <a href="#jyst" className="inline-block text-jli-accent font-bold text-[10px] uppercase tracking-[0.3em] border-b border-jli-accent/30 pb-2 hover:border-jli-accent transition-all">
              Register Now
            </a>
          </motion.div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-black/5 gap-8">
          <p className="text-[10px] text-jli-muted uppercase tracking-widest font-bold">
            © 2026 JiSRA Leadership Institute. All Rights Reserved.
          </p>
          <div className="flex space-x-8">
            <a href="#" className="text-[10px] text-jli-muted uppercase tracking-widest font-bold hover:text-jli-accent transition-colors">Privacy</a>
            <a href="#" className="text-[10px] text-jli-muted uppercase tracking-widest font-bold hover:text-jli-accent transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [bgColor, setBgColor] = useState('#ffffff');

  return (
    <div className="min-h-screen flex flex-col selection:bg-jli-accent/20 overflow-x-hidden relative">
      <motion.div 
        className="fixed inset-0 z-[-1]"
        animate={{ backgroundColor: bgColor }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <div className="noise" />
      <ProgressBar />
      <Navbar />
      <main className="flex-grow">
        <Hero onInView={setBgColor} />
        {/* Vision Section */}
        <Mission onInView={setBgColor} />
        <Pedagogy onInView={setBgColor} />
        <AgentsOfVision onInView={setBgColor} />
        
        {/* Curriculum Section */}
        <TheJiSRAWay onInView={setBgColor} />
        <Curriculum onInView={setBgColor} />
        
        {/* JYST Section */}
        <Admissions onInView={setBgColor} />
        <Fellowship onInView={setBgColor} />
        
        <Faculty onInView={setBgColor} />
        <FAQ onInView={setBgColor} />
      </main>
      <Footer />
    </div>
  );
}

