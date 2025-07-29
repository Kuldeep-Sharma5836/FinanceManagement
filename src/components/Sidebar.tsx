import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  BarChart3, 
  Database,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    id: "add",
    label: "Add Transaction",
    icon: Plus,
    description: "Create new transaction"
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: List,
    description: "View all transactions"
  },
  {
    id: "budget",
    label: "Budget",
    icon: Target,
    description: "Manage spending limits"
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    description: "Generate reports"
  },
  {
    id: "data",
    label: "Data",
    icon: Database,
    description: "Manage your data"
  }
];

export const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  onToggleCollapse, 
  isMobileOpen, 
  onMobileToggle 
}: SidebarProps) => {
  const { user, logout } = useAuth();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // Close mobile menu when tab is clicked
    if (isMobileOpen) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileToggle}
          className="h-10 w-10 p-0 bg-gradient-card border border-border/50 shadow-glow"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex flex-col bg-gradient-card border-r border-border/50 transition-all duration-300 z-50",
        "lg:relative lg:translate-x-0",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen 
          ? "fixed left-0 top-0 h-full translate-x-0" 
          : "fixed -translate-x-full lg:translate-x-0"
      )}>
        {/* Desktop Toggle Button */}
        <div className="hidden lg:flex justify-end p-4 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-emerald-600">Finance Management</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileToggle}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200",
                  isCollapsed ? "px-2" : "px-4",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground shadow-glow" 
                    : "hover:bg-primary/10"
                )}
                onClick={() => handleTabClick(item.id)}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  isCollapsed ? "mr-0" : "mr-3"
                )} />
                {!isCollapsed && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs opacity-70">{item.description}</span>
                  </div>
                )}
              </Button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-border/50 p-4">
          {!isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 hover:bg-primary/10">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gradient-card border-border/50" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem className="hover:bg-primary/10">
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10">
                  <Settings className="mr-2 h-4 w-4 text-primary" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full p-2 hover:bg-primary/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gradient-card border-border/50" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem className="hover:bg-primary/10">
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10">
                  <Settings className="mr-2 h-4 w-4 text-primary" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center font-mono">
              Made with ❤️ by Kuldeep
            </div>
          </div>
        )}
      </div>
    </>
  );
}; 