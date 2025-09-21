import React, { useState } from 'react';
import { motion } from '../common/AnimationWrapper';
import {
  Globe, FileText, Calendar, Zap, Palette, Mic, Mail, Target,
  Camera, DollarSign, Brain, Users, ArrowRight, Play, Sparkles
} from 'lucide-react';

const CapabilitiesStep = ({ answers, onNext }) => {
  const [activeDemo, setActiveDemo] = useState(null);

  const capabilities = [
    {
      icon: Globe,
      title: "Social Media Management",
      description: "Strategy, content creation, and automated posting",
      story: "Imagine: You wake up and your social media calendar is already filled with engaging posts, perfectly timed for your audience. Your Instagram, LinkedIn, and Twitter are all posting automatically while you focus on growing your business.",
      demo: "social"
    },
    {
      icon: FileText,
      title: "Content Creation",
      description: "Blog posts, articles, campaigns, and lead magnets",
      story: "Picture this: You need a blog post about your latest product. Instead of staring at a blank page, Guild's Content Agent researches your topic, writes a compelling article, and even creates supporting graphics — all while you sleep.",
      demo: "content"
    },
    {
      icon: Mail,
      title: "Email Management",
      description: "Outreach, replies, and campaign handling",
      story: "Think about it: Your inbox is always organized, important emails get priority responses, and your email campaigns are running on autopilot. You never miss a lead or opportunity again.",
      demo: "email"
    },
    {
      icon: Target,
      title: "Advertising",
      description: "Full-stack marketing campaigns & optimization",
      story: "Envision: Your ad campaigns are constantly optimizing themselves. A/B testing happens automatically, budgets are adjusted based on performance, and new audiences are discovered while you focus on other priorities.",
      demo: "ads"
    },
    {
      icon: DollarSign,
      title: "Bookkeeping",
      description: "Track finances & automate accounting",
      story: "Consider this: Your books are always up to date, expenses are categorized automatically, and you get weekly financial insights without ever opening a spreadsheet. Tax season becomes stress-free.",
      demo: "finance"
    },
    {
      icon: Users,
      title: "Customer Service",
      description: "Smart support agents for your clients",
      story: "Imagine: Your customers get instant, helpful responses 24/7. Common questions are answered immediately, issues are escalated appropriately, and your team only handles the complex cases that truly need human touch.",
      demo: "support"
    }
  ];

  const handleTryDemo = (demoType) => {
    setActiveDemo(demoType);
    // Simulate demo interaction
    setTimeout(() => {
      setActiveDemo(null);
    }, 3000);
  };

  const getDemoContent = (demoType) => {
    const demos = {
      social: {
        title: "Social Media Demo",
        content: "Creating a week's worth of social media posts for your business... ✨",
        result: "Generated 7 posts across 3 platforms with optimal timing!"
      },
      content: {
        title: "Content Creation Demo",
        content: "Writing a blog post about your industry... ✍️",
        result: "Created 1,200-word article with SEO optimization!"
      },
      email: {
        title: "Email Demo",
        content: "Crafting personalized outreach emails... 📧",
        result: "Generated 10 personalized emails with 95% open rate potential!"
      },
      ads: {
        title: "Advertising Demo",
        content: "Optimizing your ad campaigns... 🎯",
        result: "Improved campaign performance by 40%!"
      },
      finance: {
        title: "Finance Demo",
        content: "Categorizing your expenses... 💰",
        result: "Organized 50 transactions and generated monthly report!"
      },
      support: {
        title: "Support Demo",
        content: "Responding to customer inquiries... 🤖",
        result: "Answered 15 customer questions with 98% satisfaction!"
      }
    };
    return demos[demoType] || demos.social;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Here's what your Guild can already do for you
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Think of this as your <span className="font-semibold">AI team of specialists</span>.
            Each agent focuses on one area of your business so you can grow faster,
            with less effort on your side. You don't need to remember it all now —
            you'll be reminded whenever an agent can help.
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            const isDemoActive = activeDemo === cap.demo;
            const demoContent = getDemoContent(cap.demo);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-gray-100 shadow-lg hover:shadow-xl rounded-xl p-6 flex flex-col space-y-4 transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{cap.title}</h3>
                </div>

                <p className="text-sm text-gray-600">{cap.description}</p>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-700 italic">"{cap.story}"</p>

                  {isDemoActive ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
                    >
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">{demoContent.title}</span>
                      </div>
                      <p className="text-xs text-blue-700 mb-2">{demoContent.content}</p>
                      <p className="text-xs font-medium text-green-700">{demoContent.result}</p>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => handleTryDemo(cap.demo)}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Play className="w-4 h-4" />
                      <span>Try it now</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Transition to Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">This is just the beginning</h3>
            <p className="text-gray-700 leading-relaxed">
              As your Guild learns about your business, agents will take on more work for you —
              from strategy and content to outreach and finances. The more you use Guild,
              the smarter and more helpful it becomes.
            </p>
          </div>

          <motion.button
            onClick={() => onNext()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Show Me My Setup</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CapabilitiesStep;
