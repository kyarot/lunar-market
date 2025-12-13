import { ImmersiveDashboard } from "@/components/ImmersiveDashboard";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Lunar Markets | Stock Prices vs Moon Phases</title>
        <meta
          name="description"
          content="Explore the fascinating correlation between stock market performance and lunar cycles with our premium data visualization dashboard."
        />
      </Helmet>
      <ImmersiveDashboard />
    </>
  );
};

export default Index;
