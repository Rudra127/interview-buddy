
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      question: "How does the AI feedback system work?",
      answer: "Our AI uses LLaMA 4.0 and AWS Speech Recognition to analyze your responses in real-time. It evaluates communication skills, technical accuracy, and provides personalized suggestions for improvement based on industry standards."
    },
    {
      question: "What cheating detection measures are in place?",
      answer: "We employ multiple detection methods including screen monitoring, unusual activity patterns, multiple device usage detection, and behavioral analysis. Our system ensures interview integrity while respecting privacy."
    },
    {
      question: "How does the blockchain payment system work?",
      answer: "Payments are held in a smart contract escrow until the interview is completed. This ensures both parties are protected - candidates get their money back if interviews don't happen, and interviewers get paid automatically upon completion."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "Yes! Our blockchain escrow system includes automatic refund mechanisms. If an interview doesn't meet quality standards or technical issues occur, refunds are processed instantly through smart contracts."
    },
    {
      question: "What technical requirements do I need?",
      answer: "You need a stable internet connection, a computer with a webcam and microphone, and a modern web browser. Our platform works on Chrome, Firefox, Safari, and Edge. No additional software installation required."
    },
    {
      question: "How are interviewers vetted?",
      answer: "All interviewers go through a rigorous screening process including background checks, technical assessments, and mock interview evaluations. We only accept experienced professionals from top companies."
    },
    {
      question: "Can I record my interview sessions?",
      answer: "Yes, with Professional and Enterprise plans, all sessions are automatically recorded (with consent) for your review. You can access recordings for up to 30 days to analyze your performance and track improvement."
    },
    {
      question: "Is my personal data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, comply with GDPR and SOC 2 standards, and never share personal data with third parties. Your interview data is stored securely and deleted according to our retention policy."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to common questions about our platform, technology, and processes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border border-gray-200 px-6">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get the most out of your interview preparation journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                Contact Support
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
