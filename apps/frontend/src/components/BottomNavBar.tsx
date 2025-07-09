import { useState, useEffect } from "react";
import { Flex, Box, IconButton } from "@chakra-ui/react";
import { FaHome, FaHistory, FaUserCircle, FaUserShield } from "react-icons/fa";
import { useWallet, useWalletModal } from "@vechain/dapp-kit-react";
import { ReactElement } from "react";

// Admin address that is authorized to access admin page
const ADMIN_ADDRESS = "0x43b9a364a593316facceb21bc905e2d877f5bc7c";

// Type definitions for event emitter
type EventCallback = (data?: any) => void;
type EventMap = Record<string, EventCallback[]>;

// Create a simple event emitter for app navigation
export const navEvents = {
  listeners: {} as EventMap,
  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

export const BottomNavBar = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { account } = useWallet();
  const { open } = useWalletModal();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if current user is admin
    if (account) {
      setIsAdmin(account.toLowerCase() === ADMIN_ADDRESS.toLowerCase());
    } else {
      setIsAdmin(false);
    }
  }, [account]);

  useEffect(() => {
    // Listen for navigation events from other components
    const homeListener = () => {
      setActiveTab("home");
    };
    
    const historyListener = () => {
      setActiveTab("history");
    };
    
    const fullHistoryListener = () => {
      // When full history is shown, we want the history tab to be active
      setActiveTab("history");
    };

    const adminListener = () => {
      setActiveTab("admin");
    };
    
    navEvents.on("navigateToHome", homeListener);
    navEvents.on("navigateToHistory", historyListener);
    navEvents.on("navigateToFullHistory", fullHistoryListener);
    navEvents.on("navigateToAdmin", adminListener);
    
    return () => {
      // Clean up listeners
      if (navEvents.listeners["navigateToHome"]) {
        navEvents.listeners["navigateToHome"] = 
          navEvents.listeners["navigateToHome"].filter(l => l !== homeListener);
      }
      if (navEvents.listeners["navigateToHistory"]) {
        navEvents.listeners["navigateToHistory"] = 
          navEvents.listeners["navigateToHistory"].filter(l => l !== historyListener);
      }
      if (navEvents.listeners["navigateToFullHistory"]) {
        navEvents.listeners["navigateToFullHistory"] = 
          navEvents.listeners["navigateToFullHistory"].filter(l => l !== fullHistoryListener);
      }
      if (navEvents.listeners["navigateToAdmin"]) {
        navEvents.listeners["navigateToAdmin"] = 
          navEvents.listeners["navigateToAdmin"].filter(l => l !== adminListener);
      }
    };
  }, []);

  const handleNavClick = (tab: string) => {
    if (tab === activeTab) return; // Don't do anything if already on this tab
    
    setActiveTab(tab);
    
    // Handle specific tab actions
    if (tab === "profile") {
      open();
    } else if (tab === "history") {
      navEvents.emit("navigateToHistory");
    } else if (tab === "home") {
      navEvents.emit("navigateToHome");
    } else if (tab === "admin") {
      navEvents.emit("navigateToAdmin");
    }
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      pb={{ base: 6, md: 8 }}
      pt={3}
      px={4}
      zIndex={10}
      display="flex"
      justifyContent="center"
    >
      <Flex
        justify="space-around"
        align="center"
        width={{ base: "90%", md: "400px" }}
        maxW="500px"
        bg="rgba(255, 255, 255, 0.85)"
        backdropFilter="blur(12px)"
        borderRadius="full"
        py={3}
        px={5}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        border="1px dashed #8BC34A"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: "-8px",
          left: "50%",
          transform: "translateX(-50%) rotate(-2deg)",
          width: "40px",
          height: "16px",
          bg: "#DCEDC8",
          borderRadius: "4px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
          zIndex: -1
        }}
      >
        <NavButton 
          icon={<FaHome />} 
          isActive={activeTab === "home"}
          onClick={() => handleNavClick("home")}
          label="Home"
          color="#388E3C"
        />
        
        <NavButton 
          icon={<FaHistory />} 
          isActive={activeTab === "history"}
          onClick={() => handleNavClick("history")}
          label="History"
          color="#388E3C"
        />
        
        <NavButton 
          icon={<FaUserCircle />} 
          isActive={activeTab === "profile" || !!account}
          onClick={() => handleNavClick("profile")}
          label="Profile"
          isConnected={!!account}
          color="#388E3C"
        />

        {/* Admin button - only visible for admin */}
        {isAdmin && (
          <NavButton 
            icon={<FaUserShield />} 
            isActive={activeTab === "admin"}
            onClick={() => handleNavClick("admin")}
            label="Admin"
            color="#8BC34A"
          />
        )}
      </Flex>
    </Box>
  );
};

// Custom styled NavButton component
const NavButton = ({ 
  icon, 
  isActive, 
  onClick, 
  label,
  isConnected = false,
  color = "#718096"
}: { 
  icon: ReactElement; 
  isActive: boolean; 
  onClick: () => void; 
  label: string;
  isConnected?: boolean;
  color?: string;
}) => (
  <IconButton
    aria-label={label}
    icon={icon}
    fontSize="22px"
    variant="unstyled"
    color={isConnected ? color : "#388E3C"}
    size="lg"
    borderRadius="full"
    onClick={onClick}
    display="flex"
    alignItems="center"
    justifyContent="center"
    transition="all 0.2s"
    transform="none"
    _hover={{ 
      color: "#4CAF50",
      transform: "translateY(-2px)"
    }}
    _active={{ 
      transform: 'scale(0.95)',
      color: "#2E7D32",
    }}
    sx={{
      '&:active': {
        transform: 'scale(0.95)'
      }
    }}
  />
); 