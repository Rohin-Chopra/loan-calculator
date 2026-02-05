export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-300 dark:text-gray-400 py-8 mt-16 border-t border-gray-700">
      <div className="container mx-auto px-4 text-center">
        <p className="text-base font-medium mb-2">
          Made with ❤️ for Australians looking to kill their loans faster
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
          This calculator is for informational purposes only. Always consult
          with a financial advisor for personalized advice.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Created by{' '}
          <a
            href="https://www.rohinchopra.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 dark:text-blue-500 hover:text-blue-300 dark:hover:text-blue-400 underline transition-colors"
          >
            Rohin Chopra
          </a>
        </p>
      </div>
    </footer>
  );
}
