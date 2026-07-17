import { articles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = articles.find((a) => a.slug === resolvedParams.slug);

  if (!article) {
    return {
      title: 'Article introuvable | Remedly',
      description: 'Cet article n\'existe pas ou a été supprimé.',
    };
  }

  return {
    title: `${article.title} | Remedly`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = articles.find((a) => a.slug === resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "datePublished": article.date,
    "author": {
      "@type": "Organization",
      "name": "Remedly"
    }
  };

  return (
    <main className="bg-[#1B1C3E] min-h-screen text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <article className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <Link href="/apprendre" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-indigo-400 mb-8 transition-colors">
          ← Retour à l'académie
        </Link>
        
        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#25274A] text-indigo-400 rounded-md">
              {article.category}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {article.date} • {article.readTime} de lecture
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            {article.excerpt}
          </p>
        </header>

        <div className="prose prose-lg prose-indigo prose-invert max-w-none text-gray-300">
          <ReactMarkdown
            components={{
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-10 mb-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-8 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="mb-6 leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
              li: ({node, ...props}) => <li className="" {...props} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        <div className="mt-16 bg-[#25274A] rounded-2xl p-8 text-center border border-white/10">
          <h3 className="text-xl font-bold text-white mb-3">Prêt à mettre en pratique ?</h3>
          <p className="text-gray-400 mb-6">Créez votre portefeuille sécurisé en quelques secondes et achetez vos premières cryptos.</p>
          <Link href="/acheter" className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30">
            Commencer maintenant
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
