import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import FeaturedWork from "@/components/FeaturedWork";
import Departments from "@/components/Departments";
import AboutTeaser from "@/components/AboutTeaser";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <FeaturedWork />
      <Departments />
      <AboutTeaser />
    </>
  );
}
