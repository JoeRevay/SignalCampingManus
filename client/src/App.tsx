import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CampgroundLanding from "./pages/CampgroundLanding";
import TopCampgrounds from "./pages/TopCampgrounds";
import StateLanding from "./pages/StateLanding";
import BuildSpec from "./pages/BuildSpec";
import MvpLaunch from "./pages/MvpLaunch";
import ProductV1 from "./pages/ProductV1";
import CityLanding from "./pages/CityLanding";
import CarrierLanding from "./pages/CarrierLanding";
import RemoteWorkLanding from "./pages/RemoteWorkLanding";
import AmenityLanding from "./pages/AmenityLanding";
import TripRouteLanding from "./pages/TripRouteLanding";
import SeoDirectory from "./pages/SeoDirectory";
import ShareableList from "./pages/ShareableList";
import ListsDirectory from "./pages/ListsDirectory";
import RouteFinder from "./pages/RouteFinder";
import BestRemoteWork from "./pages/BestRemoteWork";
import UpperPeninsulaSignal from "./pages/UpperPeninsulaSignal";
import VerizonMichigan from "./pages/VerizonMichigan";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />

      {/* Individual campground pages */}
      <Route path={"/campground/:slug"} component={CampgroundLanding} />

      {/* Top 100 listing */}
      <Route path={"/top-campgrounds"} component={TopCampgrounds} />

      {/* State pages - short state codes */}
      <Route path={"/campgrounds/:state"} component={StateLanding} />

      {/* City pages */}
      <Route path={"/campgrounds-with-cell-service/:slug"} component={CityLanding} />

      {/* Carrier pages - explicit carrier names to avoid pattern conflicts */}
      <Route path={"/campgrounds-with-verizon-signal/:state"} component={CarrierLanding} />
      <Route path={"/campgrounds-with-att-signal/:state"} component={CarrierLanding} />
      <Route path={"/campgrounds-with-tmobile-signal/:state"} component={CarrierLanding} />

      {/* Remote work pages */}
      <Route path={"/remote-work-camping/:state"} component={RemoteWorkLanding} />

      {/* Amenity pages - explicit amenity names to avoid pattern conflicts */}
      <Route path={"/waterfront-campgrounds-with-cell-service/:state"} component={AmenityLanding} />
      <Route path={"/tent-campgrounds-with-cell-service/:state"} component={AmenityLanding} />
      <Route path={"/rv-campgrounds-with-cell-service/:state"} component={AmenityLanding} />
      <Route path={"/electric-campgrounds-with-cell-service/:state"} component={AmenityLanding} />
      <Route path={"/lakefront-campgrounds-with-cell-service/:state"} component={AmenityLanding} />
      <Route path={"/forest-campgrounds-with-cell-service/:state"} component={AmenityLanding} />

      {/* Trip route pages */}
      <Route path={"/camping-trip/:slug"} component={TripRouteLanding} />

      {/* Shareable lists */}
      <Route path={"/lists"} component={ListsDirectory} />
      <Route path={"/list/:slug"} component={ShareableList} />

      {/* Route finder */}
      <Route path={"/route-finder"} component={RouteFinder} />

      {/* Best remote work campgrounds */}
      <Route path={"/best-remote-work-campgrounds"} component={BestRemoteWork} />

      {/* Upper Peninsula signal ranking */}
      <Route path={"/best-cell-signal-campgrounds-upper-peninsula"} component={UpperPeninsulaSignal} />

      {/* Verizon Michigan ranking */}
      <Route path={"/best-verizon-signal-campgrounds-michigan"} component={VerizonMichigan} />

      {/* SEO directory */}
      <Route path={"/seo-directory"} component={SeoDirectory} />

      {/* Documentation pages */}
      <Route path={"/build-spec"} component={BuildSpec} />
      <Route path={"/mvp-launch"} component={MvpLaunch} />
      <Route path={"/product-v1"} component={ProductV1} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
