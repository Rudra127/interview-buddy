
import { Card, CardContent } from '@/components/ui/card';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "The AI feedback was incredibly insightful. I felt much more confident going into my actual interviews after practicing here.",
      avatar: "👩‍💻",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Senior Technical Interviewer",
      content: "As an interviewer, the platform's tools make conducting interviews so much more efficient. The live coding feature is game-changing.",
      avatar: "👨‍🏫",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Data Scientist at Meta",
      content: "The group discussion feature helped me prepare for panel interviews. The blockchain payment system gives me peace of mind.",
      avatar: "👩‍🔬",
      rating: 5
    },
    {
      name: "Alex Rodriguez",
      role: "Freelance Technical Interviewer",
      content: "I love how secure and transparent the payment system is. Getting paid automatically after each session is fantastic.",
      avatar: "👨‍💼",
      rating: 5
    }
  ];

  const Star = () => (
    <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
    </svg>
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of candidates and interviewers who have transformed their interview experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{testimonial.avatar}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                <p className="text-gray-600">Interview Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">10k+</div>
                <p className="text-gray-600">Mock Interviews Conducted</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-gray-600">Expert Interviewers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
