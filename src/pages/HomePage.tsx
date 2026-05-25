import { Hero } from "@/components/home/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { PetAdoptList } from "@/components/home/PetAdoptList";
import { Donation } from "@/components/home/Donation";
import { KnowledgeBase } from "@/components/home/KnowledgeBase";
import { RescueStories } from "@/components/home/RescueStories";
import { Partners } from "@/components/home/Partners";

export const HomePage = () => (
  <>
    <Hero />
    <AboutSection />
    <PetAdoptList />
    <Donation />
    <KnowledgeBase />
    <RescueStories />
    <Partners />
  </>
);
