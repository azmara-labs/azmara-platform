import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import { signal, effect } from '@azmr/core';
import { query } from '@azmr/query';
import { aiFix } from '@azmr/ai';

const features = [
  {
    title: "Reactive Core",
    description:
      "Signals, effects, and computed values with built-in infinite-loop protection. UI updates automatically when data changes.",
  },
  {
    title: "Data-First Queries",
    description:
      "Chainable, type-safe query builder over reactive or static data sources. No eval, no injection — predicates are TypeScript functions.",
  },
  {
    title: "Secure SQLite",
    description:
      "Parameterised queries only, WAL mode, identifier validation, and tamper-evident hash-chained audit logging baked in.",
  },
  {
    title: "AI Auto-Fix",
    description:
      "AI-powered code analysis running inside a true V8 isolate sandbox via isolated-vm — not the deprecated vm2.",
  },
  {
    title: "React UI",
    description:
      "XSS-safe Grid and Form components wired directly to Signals. Automatic re-renders, zero boilerplate.",
  },
  {
    title: "Security First",
    description:
      "Hash-chained audit logs, Zod validation at all boundaries, path traversal prevention, and OWASP-aligned design.",
  },
];

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className={clsx("col col--4", styles.feature)}>
      <div className="padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const [activeTab, setActiveTab] = useState('signals');

  useEffect(() => {
    // Handle tab clicks
    const handleTabClick = (e: MouseEvent) => {
      const target = e.target as HTMLButtonElement;
      if (target.classList.contains('tab')) {
        e.preventDefault();
        setActiveTab(target.dataset.tab || 'signals');
      }
    };

    document.addEventListener('click', handleTabClick);
    return () => document.removeEventListener('click', handleTabClick);
  }, []);

  return (
    <Layout description={siteConfig.tagline}>
      <header className="hero hero--primary relative overflow-hidden">
        <div className="container relative z-10">
          <div className="hero-content text-center">
            <Heading as="h1" className="hero__title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Build data-first applications<br/><span className="block text-primary">with reactive TypeScript</span>
            </Heading>
            <p className="hero__subtitle text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create powerful, responsive applications with our reactive engine, type-safe query builder, and secure data layers
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                className="button button--secondary button--lg px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                to="/docs/guide/introduction"
              >
                Get Started →
              </Link>
              <Link
                className="button button--outline button--secondary button--lg px-8 py-3 rounded-lg border-2 hover:border-primary/80 transition-all transform hover:-translate-y-1"
                href="https://github.com/coderchef26/azmara-platform"
              >
                View on GitHub
              </Link>
            </div>
          </div>
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="container relative z-10">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number text-4xl font-bold">7</div>
              <div className="stat-label text-muted-foreground">Packages</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-4xl font-bold">64+</div>
              <div className="stat-label text-muted-foreground">Tests Passing</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-4xl font-bold">MIT</div>
              <div className="stat-label text-muted-foreground">License</div>
            </div>
          </div>
          {/* Decorative elements for stats section */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-5 -left-5 w-10 h-10 bg-primary/10 rounded-full"></div>
            <div className="absolute bottom-5 right-5 w-10 h-10 bg-primary/10 rounded-full"></div>
          </div>
        </div>
      </section>

      <main>
        {/* Tabbed Code Demo */}
        <section className="relative overflow-hidden">
          <div className="container relative z-10">
            <Heading as="h2" className="section-title mb-8 text-center">Code Demo</Heading>
            <div className="tabs-container">
              <div className="tabs flex flex-wrap justify-center gap-2 mb-6">
                <button
                  className={clsx('tab', activeTab === 'signals' && 'active', "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-1")}
                  data-tab="signals"
                >
                  Reactive signals
                </button>
                <button
                  className={clsx('tab', activeTab === 'query' && 'active', "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-1")}
                  data-tab="query"
                >
                  Query engine (FoxPro-style)
                </button>
                <button
                  className={clsx('tab', activeTab === 'ai' && 'active', "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-1")}
                  data-tab="ai"
                >
                  AI auto-fix with sandbox
                </button>
              </div>
              <div className="tab-content">
                <div
                  className={clsx('tab-pane', activeTab === 'signals' && 'active', "space-y-4")}
                  id="signals"
                >
                  <div className="bg-background-emphasis dark:bg-background/50 rounded-lg p-4">
                    <pre><code className="language-typescript">const count = signal(0);
count.value = 42;</code></pre>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Signals automatically update dependent values when changed
                  </p>
                </div>
                <div
                  className={clsx('tab-pane', activeTab === 'query' && 'active', "space-y-4")}
                  id="query"
                >
                  <div className="bg-background-emphasis dark:bg-background/50 rounded-lg p-4">
                    <pre><code className="language-typescript">// Simple query example
const users = query.from('users')
  .where(user => user.active);</code></pre>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Type-safe, chainable queries without eval or injection risks
                  </p>
                </div>
                <div
                  className={clsx('tab-pane', activeTab === 'ai' && 'active', "space-y-4")}
                  id="ai"
                >
                  <div className="bg-background-emphasis dark:bg-background/50 rounded-lg p-4">
                    <pre><code className="language-typescript">const fixedCode = aiFix('Fix this code');
console.log(fixedCode);
// Outputs: Fixed this code</code></pre>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI-powered code analysis in a secure sandbox environment
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements for code demo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-5 -right-5 w-12 h-12 bg-primary/5 rounded-full blur-sm"></div>
            <div className="absolute bottom-5 left-5 w-12 h-12 bg-primary/5 rounded-full blur-sm"></div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="relative overflow-hidden">
          <div className="container relative z-10">
            <Heading as="h2" className="section-title mb-8 text-center">Platform Packages</Heading>
            <div className="packages-container">
              {features.map((f) => (
                <div key={f.title} className="package-card group">
                  <div className="package-icon">
                    <span className="package-letter">@azmr</span>
                  </div>
                  <div className="package-info">
                    <h3 className="package-title text-xl font-bold mb-2">{f.title}</h3>
                    <p className="package-description text-muted-foreground mb-4">{f.description}</p>
                    <div className="package-actions">
                      <a
                        href={`https://www.npmjs.com/package/${f.title.toLowerCase().replace('@azmr/', '')}`}
                        className="npm-link inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-primary/20 hover:border-primary hover:bg-primary hover:text-white"
                      >
                        npm install {f.title}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative elements for packages section */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-5 -left-5 w-16 h-16 bg-primary/5 rounded-full blur-sm"></div>
            <div className="absolute bottom-5 right-5 w-16 h-16 bg-primary/5 rounded-full blur-sm"></div>
          </div>
        </section>

        {/* Grand Vision */}
        <section className="relative overflow-hidden">
          <div className="container relative z-10">
            <Heading as="h2" className="section-title mb-8 text-center">Grand Vision</Heading>
            <div className="vision-steps flex flex-col items-center gap-8">
              <div className="vision-step flex flex-col items-center space-y-3">
                <div className="step-number w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full font-bold text-lg">1</div>
                <div className="vision-step-content text-center">
                  <h3 className="vision-step-title font-semibold mb-2">Platform</h3>
                  <p className="vision-step-description text-muted-foreground max-w-md">
                    Reactive TypeScript runtime with data-first architecture
                  </p>
                </div>
              </div>
              <div className="vision-arrow w-6 h-6 flex items-center justify-center">
                <span className="text-primary text-2xl font-bold">→</span>
              </div>
              <div className="vision-step flex flex-col items-center space-y-3">
                <div className="step-number w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full font-bold text-lg">2</div>
                <div className="vision-step-content text-center">
                  <h3 className="vision-step-title font-semibold mb-2">IDE</h3>
                  <p className="vision-step-description text-muted-foreground max-w-md">
                    Visual development environment with live preview
                  </p>
                </div>
              </div>
              <div className="vision-arrow w-6 h-6 flex items-center justify-center">
                <span className="text-primary text-2xl font-bold">→</span>
              </div>
              <div className="vision-step flex flex-col items-center space-y-3">
                <div className="step-number w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full font-bold text-lg">3</div>
                <div className="vision-step-content text-center">
                  <h3 className="vision-step-title font-semibold mb-2">OS</h3>
                  <p className="vision-step-description text-muted-foreground max-w-md">
                    Full operating system built on Azmara Platform
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements for grand vision */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-5 -left-5 w-20 h-20 bg-primary/5 rounded-full blur-sm"></div>
            <div className="absolute bottom-5 right-5 w-20 h-20 bg-primary/5 rounded-full blur-sm"></div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden">
          <div className="container relative z-10">
            <Heading as="h2" className="section-title mb-6 text-center text-3xl md:text-4xl font-bold">Ready to build?</Heading>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-center">
              Start building powerful applications with our modern, type-safe platform today
            </p>
            <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                className="button button--secondary button--lg px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                to="/docs/guide/introduction"
              >
                Read the docs →
              </Link>
              <Link
                className="button button--outline button--secondary button--lg px-8 py-3 rounded-lg border-2 hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-1"
                to="/docs/guide/installation"
              >
                npm install @azmr/core
              </Link>
            </div>
          </div>
          {/* Decorative elements for CTA section */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-5 -left-5 w-16 h-16 bg-primary/5 rounded-full blur-sm"></div>
            <div className="absolute bottom-5 right-5 w-16 h-16 bg-primary/5 rounded-full blur-sm"></div>
          </div>
        </section>
      </main>
    </Layout>
  );
}