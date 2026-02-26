import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import { FiCheckCircle, FiClock, FiTrendingUp, FiUsers, FiArrowRight, FiMenu, FiX, FiStar, FiPlay, FiCheck, FiChevronDown } from "react-icons/fi";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Animation controls
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const howItWorksInView = useInView(howItWorksRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });

  const heroControls = useAnimation();
  const featuresControls = useAnimation();
  const howItWorksControls = useAnimation();
  const testimonialsControls = useAnimation();
  const ctaControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (heroInView) {
      heroControls.start("visible");
    }
  }, [heroInView, heroControls]);

  useEffect(() => {
    if (featuresInView) {
      featuresControls.start("visible");
    }
  }, [featuresInView, featuresControls]);

  useEffect(() => {
    if (howItWorksInView) {
      howItWorksControls.start("visible");
    }
  }, [howItWorksInView, howItWorksControls]);

  useEffect(() => {
    if (testimonialsInView) {
      testimonialsControls.start("visible");
    }
  }, [testimonialsInView, testimonialsControls]);

  useEffect(() => {
    if (ctaInView) {
      ctaControls.start("visible");
    }
  }, [ctaInView, ctaControls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg" : "bg-transparent"}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <img src="/icons/icon128.png" alt="TodoApp Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">TodoApp</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                How it Works
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Testimonials
              </a>
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Get Started
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-gray-300">
                {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Features
                </a>
                <a href="#how-it-works" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  How it Works
                </a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Testimonials
                </a>
                <Link to="/login" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center"
        initial="hidden"
        animate={heroControls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 1,
              staggerChildren: 0.3,
            },
          },
        }}
      >
        {/* Background Animation - Di luar container konten */}
        <div className="absolute inset-0">
          {/* Base Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

          {/* Animated Gradient Overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 60% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Animated Orbs/Bubbles */}
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute bottom-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -80, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            }}
          />

          <motion.div
            className="absolute top-1/3 right-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply opacity-15 blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              x: [0, 60, -40, 0],
              y: [0, -60, 40, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10,
            }}
          />

          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          {/* Floating Dots
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${i % 3 === 0 ? "bg-blue-400" : i % 3 === 1 ? "bg-purple-400" : "bg-pink-400"}`}
              style={{
                left: `${10 + i * 7}%`,
                top: `${20 + i * 5}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))} */}
        </div>

        {/* Hero Content - Di atas background */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full text-center">
          <motion.div
            variants={{
              hidden: { y: 50, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                },
              },
            }}
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              variants={{
                hidden: { scale: 0.8, opacity: 0 },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 1,
                    ease: "easeOut",
                  },
                },
              }}
            >
              Manage Your Tasks
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.8,
                      delay: 0.2,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                Effortlessly
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.8,
                  delay: 0.4,
                  ease: "easeOut",
                },
              },
            }}
          >
            Stay organized, boost productivity, and achieve your goals with our intuitive todo list application. Track progress, set priorities, and collaborate seamlessly.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.8,
                  delay: 0.6,
                  ease: "easeOut",
                },
              },
            }}
          >
            <motion.div
              className="rounded-xl"
              whileHover={{
                scale: 1.05,
                y: -4,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to="/login"
                className="inline-flex items-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                Get Started
                <FiArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </motion.div>

            <motion.div
              className="rounded-xl"
              whileHover={{
                scale: 1.05,
                y: -4,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center px-10 py-4 border-2 border-gray-300 dark:border-gray-600 text-lg font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Create Account
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  delay: 1,
                  ease: "easeOut",
                },
              },
            }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        ref={featuresRef}
        id="features"
        className="py-24 bg-white dark:bg-gray-800"
        initial="hidden"
        animate={featuresControls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.8,
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Our Todo App?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Discover the features that make task management simple and effective.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.6,
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {[
              {
                icon: <FiCheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
                bg: "bg-blue-100 dark:bg-blue-900",
                title: "Easy Task Management",
                description: "Create, edit, and organize your tasks with an intuitive interface designed for productivity.",
              },
              {
                icon: <FiClock className="h-8 w-8 text-green-600 dark:text-green-400" />,
                bg: "bg-green-100 dark:bg-green-900",
                title: "Time Tracking",
                description: "Set deadlines, track progress, and never miss an important task with built-in reminders.",
              },
              {
                icon: <FiTrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
                bg: "bg-purple-100 dark:bg-purple-900",
                title: "Progress Analytics",
                description: "Visualize your productivity with detailed statistics and insights to improve your workflow.",
              },
              {
                icon: <FiUsers className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />,
                bg: "bg-yellow-100 dark:bg-yellow-900",
                title: "Collaboration",
                description: "Share tasks and projects with team members for better coordination and teamwork.",
              },
              {
                icon: <FiTrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />,
                bg: "bg-red-100 dark:bg-red-900",
                title: "Cross-Platform",
                description: "Access your tasks anywhere, anytime with our responsive web application.",
              },
              {
                icon: <FiCheckCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
                bg: "bg-indigo-100 dark:bg-indigo-900",
                title: "Secure & Private",
                description: "Your data is protected with industry-standard security measures and privacy controls.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                variants={{
                  hidden: { y: 50, opacity: 0, scale: 0.9 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut",
                      delay: index * 0.1,
                    },
                  },
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bg} rounded-full mb-4`} whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        ref={howItWorksRef}
        id="how-it-works"
        className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
        initial="hidden"
        animate={howItWorksControls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.8,
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Get started in just three simple steps</p>
          </motion.div>

          <div className="relative">
            {/* Animated Progress Line */}
            <motion.div
              className="hidden md:block absolute top-10 left-0 right-0 transform -translate-y-1/2"
              style={{ width: "calc(100% - 5rem)", left: "2.5rem", right: "2.5rem" }}
              initial={{ width: 0 }}
              animate={howItWorksControls}
              variants={{
                hidden: { width: 0 },
                visible: {
                  width: "calc(100% - 5rem)",
                  transition: {
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 0.3,
                  },
                },
              }}
            >
              <div className="h-0.5 bg-gray-300 dark:bg-gray-600 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ x: "-100%" }}
                  animate={howItWorksControls}
                  variants={{
                    hidden: { x: "-100%" },
                    visible: {
                      x: "0%",
                      transition: {
                        duration: 1.5,
                        ease: "easeInOut",
                        delay: 0.3,
                      },
                    },
                  }}
                />
              </div>

              {/* Progress Dots */}
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full"
                  style={{
                    left: `${index * 50}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={howItWorksControls}
                  variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: {
                      scale: 1,
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        delay: 0.5 + index * 0.3,
                        ease: "easeOut",
                      },
                    },
                  }}
                ></motion.div>
              ))}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    duration: 0.6,
                    staggerChildren: 0.15,
                  },
                },
              }}
            >
              {[
                {
                  step: "01",
                  title: "Create Your Account",
                  description: "Sign up for free and set up your profile in minutes.",
                  icon: <FiCheck className="h-6 w-6" />,
                },
                {
                  step: "02",
                  title: "Add Your Tasks",
                  description: "Create tasks, set priorities, and organize them into projects.",
                  icon: <FiCheckCircle className="h-6 w-6" />,
                },
                {
                  step: "03",
                  title: "Track & Complete",
                  description: "Monitor progress, collaborate with others, and achieve your goals.",
                  icon: <FiTrendingUp className="h-6 w-6" />,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="text-center relative z-10"
                  variants={{
                    hidden: { y: 50, opacity: 0, scale: 0.8 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      transition: {
                        duration: 0.6,
                        ease: "easeOut",
                        delay: 0.8 + index * 0.3,
                      },
                    },
                  }}
                >
                  <motion.div className="relative mb-8" whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white dark:border-gray-800 relative z-20"
                      whileHover={{
                        rotate: 360,
                        boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                      }}
                      transition={{ duration: 0.6 }}
                      initial={{ scale: 0 }}
                      animate={howItWorksControls}
                      variants={{
                        hidden: { scale: 0 },
                        visible: {
                          scale: 1,
                          transition: {
                            duration: 0.6,
                            delay: 0.8 + index * 0.3,
                            ease: "backOut",
                          },
                        },
                      }}
                    >
                      <span className="text-white font-bold text-lg">{step.step}</span>
                    </motion.div>
                  </motion.div>
                  <motion.h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    {step.title}
                  </motion.h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        ref={testimonialsRef}
        id="testimonials"
        className="py-24 bg-white dark:bg-gray-800"
        initial="hidden"
        animate={testimonialsControls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.8,
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Join thousands of satisfied users who have transformed their productivity</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.6,
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            {[
              {
                name: "Sarah Johnson",
                role: "Project Manager",
                content: "This todo app has revolutionized how I manage my team's tasks. The collaboration features are outstanding!",
                rating: 5,
              },
              {
                name: "Mike Chen",
                role: "Freelancer",
                content: "Simple, intuitive, and powerful. I've tried many apps, but this one keeps me organized and productive.",
                rating: 5,
              },
              {
                name: "Emily Davis",
                role: "Student",
                content: "Perfect for managing my study schedule and assignments. The analytics help me stay on track with my goals.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                variants={{
                  hidden: { y: 50, opacity: 0, scale: 0.8 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut",
                      delay: index * 0.2,
                    },
                  },
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div className="flex items-center mb-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: 0.4 + index * 0.1 + i * 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <FiStar className="h-5 w-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>
                <motion.p className="text-gray-600 dark:text-gray-300 mb-4 italic" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}>
                  "{testimonial.content}"
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        ref={ctaRef}
        className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden"
        initial="hidden"
        animate={ctaControls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.8,
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            variants={{
              hidden: { y: 30, opacity: 0, scale: 0.9 },
              visible: {
                y: 0,
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                },
              },
            }}
          >
            Ready to Get Organized?
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-8"
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.6,
                  delay: 0.2,
                  ease: "easeOut",
                },
              },
            }}
          >
            Join thousands of users who have transformed their productivity with our todo app.
          </motion.p>
          <motion.div
            variants={{
              hidden: { y: 30, opacity: 0, scale: 0.8 },
              visible: {
                y: 0,
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.6,
                  delay: 0.4,
                  ease: "easeOut",
                },
              },
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(255, 255, 255, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-block"
          >
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start Your Free Account
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>

        {/* Enhanced Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-20 right-20 w-24 h-24 border border-white rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            }}
          />
          <motion.div
            className="absolute bottom-10 left-1/4 w-20 h-20 border border-white rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10,
            }}
          />
          <motion.div
            className="absolute bottom-20 right-1/3 w-16 h-16 border border-white rounded-full"
            animate={{
              scale: [1, 1.4, 1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 15,
            }}
          />
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      {scrollY > 300 && (
        <motion.button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiChevronDown className="h-6 w-6 transform rotate-180" />
        </motion.button>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">© 2023 Todo App. All rights reserved. Built with ❤️ for productivity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
