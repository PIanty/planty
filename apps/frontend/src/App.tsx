import { DAppKitProvider, useWallet } from "@vechain/dapp-kit-react";
import { ChakraProvider, Container, Flex, Box } from "@chakra-ui/react";
import {
  Dropzone,
  InfoCard,
  SubmissionModal,
  BottomNavBar,
  WelcomeScreen,
  SubmissionHistory,
  FullHistory,
  AdminPage,
} from "./components";
import { lightTheme } from "./theme";
import { useEffect, useState } from "react";
import { navEvents } from "./components/BottomNavBar";

// Home component with only Dropzone
const Home = () => {
  return (
    <>
      <InfoCard />
      <Dropzone />
      <SubmissionHistory maxItems={5} showViewMore={true} />
    </>
  );
};

// Main app content when user is logged in
const MainApp = () => {
  const [activeView, setActiveView] = useState("home");
  
  useEffect(() => {
    // Setup navigation event handlers
    const handleHomeNav = () => {
      setActiveView("home");
    };
    
    const handleHistoryNav = () => {
      setActiveView("history");
    };
    
    const handleFullHistoryNav = () => {
      setActiveView("fullHistory");
    };
    
    const handleAdminNav = () => {
      setActiveView("admin");
    };
    
    navEvents.on("navigateToHome", handleHomeNav);
    navEvents.on("navigateToHistory", handleHistoryNav);
    navEvents.on("navigateToFullHistory", handleFullHistoryNav);
    navEvents.on("navigateToAdmin", handleAdminNav);
    
    return () => {
      // Cleanup listeners
      if (navEvents.listeners["navigateToHome"]) {
        navEvents.listeners["navigateToHome"] = 
          navEvents.listeners["navigateToHome"].filter(l => l !== handleHomeNav);
      }
      if (navEvents.listeners["navigateToHistory"]) {
        navEvents.listeners["navigateToHistory"] = 
          navEvents.listeners["navigateToHistory"].filter(l => l !== handleHistoryNav);
      }
      if (navEvents.listeners["navigateToFullHistory"]) {
        navEvents.listeners["navigateToFullHistory"] = 
          navEvents.listeners["navigateToFullHistory"].filter(l => l !== handleFullHistoryNav);
      }
      if (navEvents.listeners["navigateToAdmin"]) {
        navEvents.listeners["navigateToAdmin"] = 
          navEvents.listeners["navigateToAdmin"].filter(l => l !== handleAdminNav);
      }
    };
  }, []);

  return (
    <>
      <Flex 
        flex={1} 
        minHeight="100vh" 
        bg="#f0f7e8" // Lighter green background
        backgroundImage={`url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M20 30c0 0 10-15 25-15s15 25 0 25S20 30 20 30z' stroke='%234CAF50' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round' fill-opacity='0.1'/%3E%3Cpath d='M70 60c0 0 8-10 18-8s8 18-2 18S70 60 70 60z' stroke='%234CAF50' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round' fill-opacity='0.1'/%3E%3Cpath d='M30 70c0 0 5-8 12-7s7 12 0 12S30 70 30 70z' stroke='%238BC34A' stroke-width='0.6' stroke-linecap='round' stroke-linejoin='round' fill-opacity='0.1'/%3E%3Cpath d='M80 20c0 0 4-6 10-5s6 10-1 10S80 20 80 20z' stroke='%238BC34A' stroke-width='0.6' stroke-linecap='round' stroke-linejoin='round' fill-opacity='0.1'/%3E%3Cpath d='M15 80c0 0 6-12 15-10s10 15-3 15S15 80 15 80z' stroke='%234CAF50' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`}
        backgroundAttachment="fixed"
        backgroundSize="600px"
        pt={{ base: 6, md: 10 }}
        pb={{ base: "100px", md: "110px" }}
      >
        <Container
          maxW={"container.xl"}
          mb={{ base: 2, md: 4 }}
          display={"flex"}
          flex={1}
          alignItems={"center"}
          justifyContent={"flex-start"}
          flexDirection={"column"}
          px={{ base: 2, md: 4 }}
        >
          {activeView === "home" && <Home />}
          
          {activeView === "history" && (
            <>
              <InfoCard />
              <SubmissionHistory 
                maxItems={4} 
                showViewMore={true} 
                onViewMore={() => setActiveView("fullHistory")} 
              />
            </>
          )}
          
          {activeView === "fullHistory" && (
            <FullHistory onBack={() => setActiveView("history")} />
          )}

          {activeView === "admin" && <AdminPage />}
        </Container>
      </Flex>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </>
  );
};

// App wrapper that handles conditional rendering
const AppContent = () => {
  const { account } = useWallet();
  
  // Show welcome screen if user is not connected
  if (!account) {
    return <WelcomeScreen />;
  }
  
  // Show main app if user is connected
  return <MainApp />;
};

function App() {
  return (
    <ChakraProvider theme={lightTheme}>
      <DAppKitProvider
        usePersistence
        requireCertificate={false}
        genesis="test"
        nodeUrl="https://testnet.vechain.org/"
        logLevel={"DEBUG"}
      >
        <AppContent />

        {/* MODALS  */}
        <Box px={4}>
          <SubmissionModal />
        </Box>
      </DAppKitProvider>
    </ChakraProvider>
  );
}

export default App;
