
const HowItWorksSection = () => {
  const candidateSteps = [
    { step: "1", title: "Book Interview", description: "Choose your preferred time and interviewer", icon: "📅" },
    { step: "2", title: "Secure Payment", description: "Pay safely through blockchain escrow", icon: "💳" },
    { step: "3", title: "Join Session", description: "Connect via video call with live coding", icon: "🎥" },
    { step: "4", title: "Get Feedback", description: "Receive AI-powered insights and tips", icon: "📝" }
  ];

  const interviewerSteps = [
    { step: "1", title: "Create Profile", description: "Set your expertise and availability", icon: "👤" },
    { step: "2", title: "Accept Bookings", description: "Review and confirm interview requests", icon: "✅" },
    { step: "3", title: "Conduct Interview", description: "Use our tools for seamless interviews", icon: "🎯" },
    { step: "4", title: "Receive Payment", description: "Get paid automatically after completion", icon: "💰" }
  ];

  const StepCard = ({ step, title, description, icon, isLast }: any) => (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
          {step}
        </div>
        {!isLast && <div className="w-px h-16 bg-gray-300"></div>}
      </div>
      <div className="flex-1 mb-8">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple steps to get started with our platform, whether you're preparing for interviews or conducting them.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              For Candidates
            </h3>
            <div className="space-y-2">
              {candidateSteps.map((step, index) => (
                <StepCard
                  key={index}
                  {...step}
                  isLast={index === candidateSteps.length - 1}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              For Interviewers
            </h3>
            <div className="space-y-2">
              {interviewerSteps.map((step, index) => (
                <StepCard
                  key={index}
                  {...step}
                  isLast={index === interviewerSteps.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
