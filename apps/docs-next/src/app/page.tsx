import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <h1 className="text-4xl font-bold text-center p-8">
        Azmara Platform Documentation
      </h1>
      <div className="flex-1">
        <p className="text-center p-8">
          This is the new Next.js documentation site. Content migration in progress.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/docs/guide/introduction"
            className="px-6 py-3 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Getting Started
          </Link>
          <Link
            href="/docs/packages/core"
            className="px-6 py-3 bg-border hover:bg-primary/10 text-primary hover:text-primary-dark border border-primary/20 rounded transition-colors"
          >
            Core Package
          </Link>
        </div>
      </div>
    </main>
  );
}