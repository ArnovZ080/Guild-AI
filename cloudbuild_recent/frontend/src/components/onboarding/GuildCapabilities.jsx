import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, FileText, Calendar, Zap, Palette, Mic, Mail, Target, 
  Camera, DollarSign, Brain, Users, ArrowRight, CheckCircle, 
  Star, Lightbulb, Shield, Database, TrendingUp, Heart
} from 'lucide-react';

const GuildCapabilities = ({ onComplete }) => {
  const capabilities = [
    { icon: Globe, title: 'Social Media Management', desc: 'Full-stack social media strategy, content creation, and posting', color: 'blue' },
    { icon: FileText, title: 'Content Creation', desc: 'Blog posts, articles, marketing copy, and lead magnets', color: 'green' },
    { icon: Calendar, title: 'Content Scheduling', desc: 'Automated content calendar and cross-platform posting', color: 'purple' },
    { icon: Zap, title: 'App Development', desc: 'Custom applications and tools for your business', color: 'yellow' },
    { icon: Palette, title: 'Design Work', desc: 'Graphics, logos, branding, and visual content', color: 'pink' },
    { icon: Mic, title: 'Voice Calls', desc: 'Customer service calls and cold calling automation', color: 'indigo' },
    { icon: Mail, title: 'Email Management', desc: 'Inbound, outbound, and campaign management', color: 'orange' },
    { icon: Target, title: 'Marketing & Advertising', desc: 'Full-stack marketing campaigns and ad management', color: 'red' },
    { icon: Camera, title: 'Computer Vision', desc: 'Screen recording and task automation learning', color: 'teal' },
    { icon: DollarSign, title: 'Bookkeeping', desc: 'Financial management and accounting automation', color: 'emerald' },
    { icon: Brain, title: 'Lead Magnets', desc: 'Asset creation for lead generation and nurturing', color: 'cyan' },
    { icon: Users, title: 'Customer Service', desc: 'Automated support and customer relationship management', color: 'rose' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      pink: 'bg-pink-100 text-pink-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      teal: 'bg-teal-100 text-teal-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      cyan: 'bg-cyan-100 text-cyan-600',
      rose: 'bg-rose-100 text-rose-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Guild Capabilities
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome to your AI workforce! Here's what your 52 specialized agents can do for your business. 
            Each capability is powered by autonomous AI agents that work together to achieve your goals.
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(capability.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{capability.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{capability.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Guild is Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Autonomous Operation</h3>
              <p className="text-gray-600 text-sm">Your agents work independently, making decisions and taking actions without constant supervision.</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">Your data is protected with enterprise-grade security and privacy controls.</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Continuous Learning</h3>
              <p className="text-gray-600 text-sm">Agents learn from your business patterns and improve their performance over time.</p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-6"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Your AI workforce is ready to take on your business challenges. 
              Let's start with your first goal and watch the magic happen!
            </p>
            <motion.button
              onClick={onComplete}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Enter Your Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Powered by 52 specialized AI agents</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GuildCapabilities;
