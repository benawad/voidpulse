"use client";
import { ProjectProvider } from "../../../providers/ProjectProvider";
import { HeaderNav } from "../ui/HeaderNav";
import { trpc } from "../utils/trpc";
import { PersonaCard } from "./PersonaCard";

export const examplePersonas = [
  {
    name: "Elon",
    description: "Elon is a junior PM who is learning the ropes.",
  },
  {
    name: "Kim",
    description: "Kim is a senior manager who has been around the block.",
  },
  {
    name: "Donald",
    description: "Donald is a businessman who is new to the product world.",
  },
  {
    name: "Lulu",
    description:
      "Lulu is a Lonely Voidpet. Be careful, she likes to eat credit cards.",
  },
  {
    name: "The Great Friend",
    description:
      "The Great Friend is a Voidpet who is always there for you. He is a great listener.",
  },
  {
    name: "Pandora",
    description:
      "Pandora loves to practice positivity, but is a cutthroat businesswoman when it comes to her metrics.",
  },
  {
    name: "Promise",
    description:
      "Promise will be proud of you as long as your revenue is going up. Big business is good business.",
  },
  {
    name: "Pecunia",
    description:
      "Pecunia loves leveraging arbitrage. She believes that less is more, and looks for clever shortcuts.",
  },
  {
    name: "Volo",
    description:
      "Volo is a practical thinker who studies data to identify people's pain points.",
  },
  {
    name: "Luden",
    description:
      "Luden is constantly worried about everything that is going wrong.",
  },
];

function Page() {
  const personas = examplePersonas;
  return (
    <div className="page text-center">
      <HeaderNav />
      {/* Currently just a UI shell for fun. TODO later ;) */}
      <div className="mt-12 text-2xl font-bold">Choose your AI PM 👩🏻‍💻</div>
      <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
        {personas.map((persona) => {
          return <PersonaCard persona={persona} />;
        })}
      </div>
    </div>
  );
}

export default trpc.withTRPC(Page);
