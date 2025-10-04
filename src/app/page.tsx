import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons';

export default function Home() {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-accent" />,
      title: 'AI-Powered Analysis',
      description: 'Automatically extract summaries, identify risks, and get recommendations from your contracts in seconds.',
    },
    {
      icon: <Shield className="h-8 w-8 text-accent" />,
      title: 'Risk Assessment',
      description: 'Our AI provides a clear risk score and highlights potentially problematic clauses so you can negotiate better.',
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      title: 'Auditor Collaboration',
      description: 'Seamlessly connect with legal auditors to get expert feedback and approval on your contracts.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">ChitraGupt</span>
        </div>
        <nav>
          <Button asChild variant="ghost">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="ml-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline">
            Intelligent Contract Analysis, <br />
            <span className="text-accent">Simplified.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Stop drowning in legalese. ChitraGupt uses AI to help you understand contracts, mitigate risks, and collaborate with experts effortlessly.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/login">Upload Your First Contract</Link>
            </Button>
          </div>
        </section>

        <section className="bg-card/50 py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">A Smarter Way to Handle Contracts</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                From upload to analysis and auditor review, our platform streamlines your entire workflow.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card border-border/60 text-center">
                  <CardHeader>
                    <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold font-headline">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Transform Your Contract Management?</h2>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                    Join hundreds of businesses making smarter, faster legal decisions.
                </p>
                <div className="mt-8">
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/login">Start for Free</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ChitraGupt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
