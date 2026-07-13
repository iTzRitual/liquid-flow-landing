import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/sections/Hero';
import { CliSection } from '@/components/sections/CliSection';
import { McpSection } from '@/components/sections/McpSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CliSection />
        <McpSection />
      </main>
      <Footer />
    </>
  );
}
