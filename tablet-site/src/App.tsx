import HomeTabletDashboard from "./features/dashboard/HomeTabletDashboard";
import HeroImageUploadPage from "./features/hero-images/HeroImageUploadPage";

export default function App() {
  if (window.location.pathname === "/upload") {
    return <HeroImageUploadPage />;
  }

  return <HomeTabletDashboard />;
}
