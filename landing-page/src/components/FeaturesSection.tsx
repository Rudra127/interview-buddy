
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      title: "AI Interview Assistant",
      description: "Real-time voice feedback and intelligent question suggestions powered by LLaMA 4.0 and AWS Speech Recognition.",
      icon: "🤖",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Blockchain Escrow",
      description: "Secure payments with smart contracts ensuring fair transactions for both candidates and interviewers.",
      icon: "🔒",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Group Discussions",
      description: "WebRTC Mesh technology enables seamless multi-participant video calls for team interviews.",
      icon: "👥",
      gradient: "from-green-500 to-teal-500"
    },
    {
      title: "Cheating Detection",
      description: "Advanced monitoring system ensures interview integrity with real-time behavior analysis.",
      icon: "🛡️",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Embedded IDE",
      description: "Live problem solving with CodeSandbox integration for real-time code collaboration and testing.",
      icon: "💻",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      title: "Role-based Dashboards",
      description: "Customized interfaces for candidates and interviewers with personalized analytics and insights.",
      icon: "📊",
      gradient: "from-pink-500 to-purple-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Modern Interviews
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of interview preparation with cutting-edge technology
            that brings candidates and interviewers together seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
