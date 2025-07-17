import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EI</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Energy Insight</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/auth/sign-in" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Energy Insight
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your comprehensive platform for energy monitoring and insights. 
            Sign in to access your dashboard or create an account to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-in" className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg">
              Sign In
            </Link>
            <Link href="/auth/sign-up" className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium text-lg">
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
