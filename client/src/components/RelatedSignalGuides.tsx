/**
 * RelatedSignalGuides — A "Related Signal Guides" section for ranking pages.
 *
 * Renders internal links to other ranking/guide pages as styled cards.
 * Accepts an `exclude` prop to omit the current page from the list.
 */
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Signal, Laptop, Mountain, ChevronRight } from "lucide-react";

interface Guide {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
}

const ALL_GUIDES: Guide[] = [
  {
    href: "/best-verizon-signal-campgrounds-michigan",
    title: "Best Campgrounds with Verizon Signal in Michigan",
    description: "Top 25 Michigan campgrounds ranked by modeled Verizon signal score.",
    icon: <Signal className="w-5 h-5" />,
    accentClass: "text-red-600 bg-red-50 border-red-100",
  },
  {
    href: "/best-cell-signal-campgrounds-upper-peninsula",
    title: "Best Campgrounds with Cell Service in Michigan's Upper Peninsula",
    description: "Top 25 U.P. campgrounds ranked by overall signal score across all carriers.",
    icon: <Mountain className="w-5 h-5" />,
    accentClass: "text-green-700 bg-green-50 border-green-100",
  },
  {
    href: "/best-remote-work-campgrounds",
    title: "Best Remote Work Campgrounds",
    description: "Top 50 campgrounds ranked by remote work score — signal, town proximity, and highway access.",
    icon: <Laptop className="w-5 h-5" />,
    accentClass: "text-blue-700 bg-blue-50 border-blue-100",
  },
];

interface Props {
  /** The href of the current page, to exclude it from the list */
  exclude?: string;
}

export default function RelatedSignalGuides({ exclude }: Props) {
  const guides = ALL_GUIDES.filter(g => g.href !== exclude);

  if (guides.length === 0) return null;

  return (
    <section className="mt-12 mb-4">
      <h2
        className="text-lg font-bold text-gray-900 mb-4"
        style={{ fontFamily: "Space Grotesk, sans-serif" }}
      >
        Related Signal Guides
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {guides.map(guide => (
          <Link key={guide.href} href={guide.href}>
            <Card className={`hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border ${guide.accentClass.split(" ").find(c => c.startsWith("border-")) || "border-gray-100"}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${guide.accentClass.split(" ").filter(c => c.startsWith("bg-") || c.startsWith("text-")).join(" ")}`}>
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-sm text-gray-800 leading-snug mb-1"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {guide.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {guide.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
