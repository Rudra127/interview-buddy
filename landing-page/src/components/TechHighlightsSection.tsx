
const TechHighlightsSection = () => {
  const technologies = [
    {
      name: "Next.js & Node.js",
      description: "Modern full-stack framework for optimal performance",
      icon: "⚡",
      category: "Frontend & Backend"
    },
    {
      name: "MongoDB",
      description: "Scalable database for user data and interview sessions",
      icon: "🗄️",
      category: "Database"
    },
    {
      name: "WebRTC Mesh",
      description: "Direct peer-to-peer video calls with low latency",
      icon: "🔗",
      category: "Video Technology"
    },
    {
      name: "LLaMA 4.0 AI",
      description: "Advanced language model for intelligent feedback",
      icon: "🧠",
      category: "Artificial Intelligence"
    },
    {
      name: "AWS Speech Recognition",
      description: "Real-time voice analysis and transcription",
      icon: "🎤",
      category: "Speech Technology"
    },
    {
      name: "CodeSandbox",
      description: "Live code testing and collaboration environment",
      icon: "🛠️",
      category: "Development Tools"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built with Cutting-Edge Technology
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Our platform leverages the latest technologies to provide a seamless, 
            secure, and intelligent interview experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">{tech.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold">{tech.name}</h3>
                  <span className="text-sm opacity-75">{tech.category}</span>
                </div>
              </div>
              <p className="opacity-90 leading-relaxed">{tech.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-sm">Global CDN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechHighlightsSection;
