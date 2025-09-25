import { Metadata } from 'next';
import Image from "next/image"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { GridBackgroundDemo } from '@/components/ui/grid-background';
import { FormOpinion } from '@/features/opinion/components/form-opinion';

export const metadata: Metadata = {
  title: 'Surva.',
  description: 'An intelligent analytics app for survey results.'
};

export default function Home() {
  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen">
      
      <GridBackgroundDemo>
        <section
          className="pt-20 md:pt-24 pb-16 min-h-screen grid grid-cols-1 md:grid-cols-2 items-center md:px-20 sm:px-10 px-5 from-primary-1 via-primary-2 to-primary-3 text-foreground"
        >
          <div className="col-span-1 md:row-start-1 row-start-2 flex flex-col gap-8 md:items-start items-center text-center md:text-left">
            <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl leading-tight">
              <span>Quick Surveys,</span>
              <br />
              <span className="text-primary-foreground">Instant Insights!</span>
            </h1>
            <p className="text-md sm:text-lg md:text-xl max-w-xl font-medium">
              <span className="block">
                Get critical data in just seconds!
              </span>
              <span className="block">
                A fast, simple, and accurate survey analytics platform to help you make the best decisions.
              </span>
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-8 py-4 text-2xl font-semibold
                rounded-tr-3xl rounded-bl-3xl
                bg-glass-background border border-glass-border
                backdrop-blur-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                text-primary-background
                transition-all hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)]
                hover:backdrop-blur-[14px] hover:brightness-110"
              style={{
                background: 'var(--glass-background)',
                borderColor: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'var(--glass-blur)',
              }}
            >
              Get Started
            </Link>
          </div>

          <div className="select-none col-span-1 row-start-1 flex items-center justify-center mt-10 md:mt-0">
            <Image
              src="/images/landing-page/hero-1.png"
              alt="Survey analytics visual"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto md:max-h-[600px] max-h-[400px] object-contain"
              priority
            />
          </div>
        </section>
      </GridBackgroundDemo>

      <section className="py-16 md:px-20 sm:px-10 px-5 grid grid-cols-1 md:grid-cols-2 md:gap-6 items-center text-foreground">
        <div className="select-none flex justify-center items-center w-full h-full">
          <Image
            src="/images/landing-page/hero-2.png"
            alt="Surva Analytics Illustration"
            width={0}
            height={0}
            sizes="50vw"
            className="w-full h-auto max-w-xl md:max-h-[500px] object-contain rounded-2xl"
            priority
          />
        </div>
        <div className="space-y-6 md:pr-10 text-center md:text-left font-medium">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
            What is <span className="text-primary">Surva?</span>
          </h2>
          <p className="text-md sm:text-lg leading-relaxed py-6 rounded-xl text-justify">
            <strong>SurvaAnalytics</strong> is a web-based application designed to simplify the entire process of creating, distributing, and analyzing surveys. It addresses common challenges such as low respondent participation, difficulty in reaching the right audience, and limited capabilities in data analysis and visualization—offering a streamlined and intuitive solution for data-driven decision-making.
          </p>
        </div>
      </section>

      <section className="flex flex-col py-20 md:px-20 sm:px-10 px-5 gap-16 text-foreground">
        <h2 className="text-4xl md:text-5xl font-bold text-center">
          How Surva Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {[
            {
              title: "Smart Data Collection",
              description:
                "Collect responses from target users easily with engaging surveys and real-time tracking.",
              image: "/images/landing-page/pie-analytics.png",
            },
            {
              title: "Instant Rewards",
              description:
                "Users can earn instant rewards by completing surveys. This increases participation rates effectively.",
              image: "/images/landing-page/rewards.png",
            },
            {
              title: "Integrated Analytics",
              description:
                "Analyze responses directly in your dashboard with built-in visual reports and summaries.",
              image: "/images/landing-page/dashboard-graph.png",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="w-full max-w-[300px] h-[380px] rounded-2xl overflow-hidden border backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col"
              style={{
                background: 'var(--glass-background)',
                borderColor: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'var(--glass-blur)',
              }}
            >
              <div className="h-[200px] w-full overflow-hidden border-b" style={{ borderColor: 'var(--glass-border)' }}>
                <Image
                  src={card.image}
                  alt={card.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-snug">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="py-20 md:px-20 sm:px-10 px-5 grid md:grid-cols-2 grid-cols-1 gap-12 
          bg-gradient-to-br from-background via-background/80 to-secondary-1/40 
          dark:from-background dark:via-background/80 dark:to-secondary-1/20 
          text-foreground transition-colors duration-300"
      >
        <div className="col-span-1 flex flex-col justify-center gap-6">
          <h2 className="md:text-4xl text-3xl font-bold">
            We still need your opinion
          </h2>
          <p className="md:text-lg text-base text-muted-foreground">
            We’re always improving your experience on Surva. Share your opinion, suggestion, or feedback to help us grow better!
          </p>
        </div>

        <div className="col-span-1 flex justify-center">
          <div
            className="w-full max-w-md rounded-2xl border border-glass-border bg-glass-bg p-6 shadow-xl backdrop-blur-xl transition"
            style={{
              boxShadow: 'var(--glass-shadow)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <h4 className="text-xl font-semibold mb-4 text-center text-foreground">Opinion Form</h4>
            <FormOpinion />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center py-20 md:px-20 sm:px-10 px-5 gap-10 text-foreground">
        <h2 className="text-center md:text-4xl text-3xl font-bold">
          Our Clients Know Best
        </h2>

        <div className="w-full space-y-8">
          <div className="overflow-hidden">
            <InfiniteMovingCards
              direction="right"
              speed="slow"
              items={[
                {
                  quote:
                    "Surva helped me collect thesis survey responses quickly. Everything was intuitive and professional!",
                  name: "Andi Pratama",
                  title: "Undergraduate Student",
                },
                {
                  quote:
                    "This platform significantly accelerated our customer data collection. Highly recommended for market research!",
                  name: "Dina Ayu",
                  title: "Market Analyst",
                },
                {
                  quote:
                    "The UI is simple, survey distribution is smooth, and the results are exportable in seconds. Super efficient!",
                  name: "Rudi Kurniawan",
                  title: "Independent Researcher",
                },
                {
                  quote:
                    "We used Surva to run user satisfaction surveys. The broadcast and response management tools are outstanding.",
                  name: "Sari Meilani",
                  title: "Product Manager",
                },
                {
                  quote:
                    "It's a great platform to reach broad audiences and gain real, high-quality insights from verified users.",
                  name: "Yusuf Hakim",
                  title: "Data Consultant",
                },
              ]}
            />
          </div>

          <div className="overflow-hidden">
            <InfiniteMovingCards
              direction="left"
              speed="slow"
              items={[
                {
                  quote:
                    "I was impressed by the analytic breakdowns provided after each survey. Very insightful and beautiful visualizations.",
                  name: "Natalie Chen",
                  title: "UX Research Lead",
                },
                {
                  quote:
                    "No coding needed, yet I was able to launch a complete survey campaign and get actionable insights within a day.",
                  name: "Ahmad Rizky",
                  title: "Startup Founder",
                },
                {
                  quote:
                    "We replaced our old tools with Surva because of its speed and convenience. A game-changer for survey distribution.",
                  name: "Maria Lopez",
                  title: "HR Coordinator",
                },
                {
                  quote:
                    "As a lecturer, I find Surva perfect for quick polls during lectures. Students respond instantly and results are visual.",
                  name: "Dr. Kevin W.",
                  title: "University Lecturer",
                },
                {
                  quote:
                    "Surva’s dashboard is sleek and real-time. It changed how we engage with our remote community for feedback.",
                  name: "Eka Sasmita",
                  title: "Community Manager",
                },
              ]}
            />
          </div>
        </div>
      </section>

    </main>
  );
}
