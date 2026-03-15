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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/campground/:slug"} component={CampgroundLanding} />
      <Route path={"/top-campgrounds"} component={TopCampgrounds} />
      <Route path={"/campgrounds/:state"} component={StateLanding} />
      <Route path={"/build-spec"} component={BuildSpec} />
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
