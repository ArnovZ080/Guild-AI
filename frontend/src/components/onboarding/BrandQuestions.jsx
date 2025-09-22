import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Question from './Question';

const BrandQuestions = ({ onNext }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      id: 'brand_voice_tone',
      text: "How would you describe your brand's voice and tone?",
      subtext: "This helps Guild communicate in a way that feels authentically 'you' across all content and interactions.",
      options: [
        'Professional and authoritative',
        'Friendly and approachable',
        'Playful and creative',
        'Inspirational and motivational',
        'Expert and educational',
        'Casual and conversational',
        'Luxury and premium',
        "I'm not sure yet",
      ],
      allowCustom: true,
      reassurance:
        "Your brand voice is how you sound to your audience. If you're unsure, we can help you discover it through your existing content and audience feedback.",
    },
    {
      id: 'brand_personality',
      text: 'What personality traits best describe your brand?',
      subtext: 'Think of your brand as a person - what characteristics would they have?',
      options: [
        'Trustworthy and reliable',
        'Innovative and cutting-edge',
        'Caring and supportive',
        'Bold and confident',
        'Wise and experienced',
        'Fun and energetic',
        'Sophisticated and refined',
        'Authentic and genuine',
      ],
      allowCustom: true,
      reassurance:
        'Brand personality helps your audience connect with you emotionally. You can always refine this as your brand evolves.',
    },
    {
      id: 'brand_colors',
      text: 'Do you have established brand colors?',
      subtext: 'Colors are powerful brand elements that create recognition and emotional connection.',
      options: [
        'Yes, I have a complete color palette',
        'I have 2-3 main colors',
        'I have one primary color',
        "I know what colors I like but haven't formalized them",
        "I'm not sure what colors represent my brand",
      ],
      allowCustom: true,
      reassurance:
        "Brand colors create visual consistency. If you don't have them yet, our Brand Strategist can help you choose colors that align with your brand personality and industry.",
    },
    {
      id: 'logo_status',
      text: "What's the status of your logo?",
      subtext: 'A logo is often the first visual element people associate with your brand.',
      options: [
        'I have a professional logo I love',
        'I have a logo but want to improve it',
        'I have a simple text-based logo',
        "I'm using a placeholder logo",
        "I don't have a logo yet",
      ],
      allowCustom: true,
      reassurance:
        'A strong logo builds brand recognition. If you need help creating or improving yours, our Design Agent can assist with logo concepts and iterations.',
    },
    {
      id: 'brand_visual_style',
      text: "How would you describe your brand's visual style?",
      subtext:
        'This includes imagery, design elements, and overall aesthetic that represents your brand.',
      options: [
        'Clean and minimalist',
        'Bold and vibrant',
        'Elegant and sophisticated',
        'Playful and colorful',
        'Modern and tech-focused',
        'Warm and organic',
        'Professional and corporate',
        'Creative and artistic',
      ],
      allowCustom: true,
      reassurance:
        'Visual style consistency helps build brand recognition. We can help you develop a cohesive visual identity across all your materials.',
    },
    {
      id: 'brand_values',
      text: 'What core values drive your brand?',
      subtext:
        'These are the principles that guide your business decisions and how you interact with customers.',
      options: [
        'Quality and excellence',
        'Innovation and progress',
        'Customer service and care',
        'Transparency and honesty',
        'Sustainability and responsibility',
        'Community and connection',
        'Accessibility and inclusion',
        'Growth and empowerment',
      ],
      allowCustom: true,
      supportText:
        'Think about what principles are most important to you and your business. These values should guide all your decisions and communications.',
      reassurance:
        'Brand values help you make consistent decisions and attract customers who share similar beliefs. This creates deeper, more meaningful connections.',
    },
    {
      id: 'brand_story',
      text: 'Do you have a clear brand story or origin story?',
      subtext:
        'Your brand story explains why you started your business and what makes you unique.',
      options: [
        'Yes, I have a compelling brand story',
        'I have the basics but want to refine it',
        "I know my story but haven't written it down",
        "I'm not sure how to tell my story",
        "I don't think my story is very interesting",
      ],
      allowCustom: true,
      reassurance:
        'Every business has a unique story worth telling. Our Storytelling Agent can help you craft a compelling narrative that connects with your audience and differentiates your brand.',
    },
    {
      id: 'brand_positioning',
      text: 'How do you want to be positioned in your market?',
      subtext:
        'Brand positioning is how you want to be perceived relative to your competitors.',
      options: [
        'Premium/high-end option',
        'Affordable and accessible',
        'Innovative and cutting-edge',
        'Traditional and reliable',
        'Personal and relationship-focused',
        'Fast and efficient',
        'Comprehensive and full-service',
        'Specialized and expert',
      ],
      allowCustom: true,
      reassurance:
        'Clear positioning helps customers understand why they should choose you over competitors. We can help you find your unique position in the market.',
    },
    {
      id: 'brand_differentiation',
      text: 'What makes your brand unique or different?',
      subtext:
        'This is your competitive advantage - what sets you apart from others in your space.',
      allowCustom: true,
      supportText:
        'Think about what you do differently, better, or uniquely compared to your competitors. This could be your process, your approach, your expertise, or your personality.',
      reassurance:
        'Understanding your unique value proposition is crucial for effective marketing. If you are unsure, our Strategy Agent can help you identify and articulate what makes you special.',
    },
    {
      id: 'brand_consistency',
      text: 'How consistent is your current brand across different touchpoints?',
      subtext:
        'This includes your website, social media, email, marketing materials, and customer communications.',
      options: [
        'Very consistent - everything looks and feels the same',
        'Mostly consistent with some variations',
        'Somewhat consistent but could be better',
        'Not very consistent - varies a lot',
        "I'm not sure - I haven't really thought about it",
      ],
      allowCustom: true,
      reassurance:
        'Brand consistency builds trust and recognition. If you need help creating brand guidelines, our Brand Strategist can develop comprehensive guidelines for all your communications.',
    },
  ];

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        onNext(newAnswers);
      }
    }, 800);
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="text-purple-600 text-xl">🎨</div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">Let's define your brand identity</h3>
            <p className="text-purple-800 italic">
              Your brand is more than just your logo or colors - it's the complete experience people have with your business.
              These questions help Guild understand your brand so we can communicate authentically and create content that truly represents you.
              Don't worry if you don't have everything figured out yet - we can help you develop these elements together.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-center space-x-2 mb-8">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index <= currentQuestion ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Question
          text={currentQ.text}
          subtext={currentQ.subtext}
          options={currentQ.options}
          allowCustom={currentQ.allowCustom}
          supportText={currentQ.supportText}
          reassurance={currentQ.reassurance}
          onAnswer={(answer) => handleAnswer(currentQ.id, answer)}
        />
      </motion.div>

      <div className="text-center">
        <button
          onClick={() => onNext(answers)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Skip remaining brand questions
        </button>
      </div>
    </div>
  );
};

export default BrandQuestions;
