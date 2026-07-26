import { NavLink } from 'react-router-dom';
import {
  Users,
  Shield,
  Menu,
  X,
  User,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  LayoutDashboard,
  Banknote,
  BaggageClaim,
  CalendarDays,
  Map,
  ClipboardCheck,
  FileText,
  BarChart3,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Slide from '../animations/Slide';
import { useAuthStore } from '../../hooks/useAuth';

const navigation = [
  {
    section: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },

  {
    section: 'Flight Operations',
    items: [
      {
        name: 'Flights',
        href: '/flights',
        icon: PlaneTakeoff,
      },
      {
        name: 'Flight Schedules',
        href: '/flight-schedules',
        icon: CalendarDays,
      },
      {
        name: 'Routes',
        href: '/routes',
        icon: Map,
      },
      {
        name: 'Airports',
        href: '/airports',
        icon: PlaneLanding,
      },
      {
        name: 'Aircraft',
        href: '/aircraft',
        icon: Plane,
      },
    ],
  },

  {
    section: 'Passenger Services',
    items: [
      {
        name: 'Bookings',
        href: '/bookings',
        icon: FileText,
      },
      {
        name: 'Check-in',
        href: '/check-in',
        icon: ClipboardCheck,
      },
      {
        name: 'Boarding Pass',
        href: '/boarding-pass',
        icon: PlaneLanding,
      },
      {
        name: 'Ancillary',
        href: '/ancillary',
        icon: BaggageClaim,
      },
    ],
  },

  {
    section: 'Finance',
    items: [
      {
        name: 'Payments',
        href: '/payments',
        icon: Banknote,
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: BarChart3,
        requiredPermissions: [['report', 'report', 'view']],
      },
    ],
  },

  {
    section: 'Administration',
    items: [
      {
        name: 'Users',
        href: '/users',
        icon: Users,
        requiredPermissions: [
          ['user', 'account', 'create'],
          ['user', 'account', 'update'],
          ['user', 'account', 'status'],
        ],
      },
      {
        name: 'Roles & Permissions',
        href: '/roles',
        icon: Shield,
        requiredPermissions: [['role', 'role', 'view']],
      },
    ],
  },

  {
    section: 'System',
    items: [
      {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell,
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: User,
      },
    ],
  },
] satisfies Array<{
  section: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
    requiredPermissions?: Array<[string, string, string]>;
  }>;
}>;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* MOBILE TOGGLE */}
      <div className="md:hidden fixed top-0 left-0 z-60 p-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="
            p-2.5
            rounded
            bg-primary
            text-white
            shadow-lg
            shadow-primary/30
          "
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="
              fixed
              inset-0
              z-40
              bg-slate-900/50
              backdrop-blur-sm
              md:hidden
            "
          />
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="
          hidden
          md:flex
          h-screen
          sticky
          top-0
          bg-primary
          border-r
          border-black/10
          flex-col
          shrink-0
          overflow-hidden
        "
      >
        <SidebarContent
          setIsOpen={setIsOpen}
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed((v) => !v)}
        />
      </motion.aside>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <Slide
            direction="right"
            className="
              fixed
              inset-y-0
              left-0
              z-50
              w-72
              bg-primary
              border-r
              border-black/10
              flex
              flex-col
              md:hidden
              h-screen
            "
          >
            <SidebarContent setIsOpen={setIsOpen} isCollapsed={false} />
          </Slide>
        )}
      </AnimatePresence>
    </>
  );
};

type SidebarContentProps = {
  setIsOpen: (value: boolean) => void;
  isCollapsed: boolean;
  onToggleCollapsed?: () => void;
};

const SidebarContent = ({
  setIsOpen,
  isCollapsed,
  onToggleCollapsed,
}: SidebarContentProps) => {
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);

  // Hide items the current role has none of the required permissions
  // for, then drop any section left with zero visible items so an
  // empty "Finance" or "Administration" heading doesn't linger.
  const visibleNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredPermissions || hasAnyPermission(item.requiredPermissions),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <Slide direction="down">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div
              className="
                w-11
                h-11
                rounded
                bg-white/15
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Plane className="text-white w-6 h-6" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white leading-tight truncate">
                  Passenger Service
                </h1>

                <p
                  className="
                    text-[11px]
                    uppercase
                    tracking-[0.2em]
                    text-white/60
                    font-semibold
                  "
                >
                  Admin Panel
                </p>
              </div>
            )}
          </div>
        </Slide>

        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="
              mt-4
              w-full
              flex
              items-center
              justify-center
              gap-2
              py-2
              rounded
              text-white/70
              hover:bg-white/10
              hover:text-white
              transition-colors
              text-xs
              font-semibold
            "
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 custom-scrollbar">
        <div className="space-y-6">
          {visibleNavigation.map((group, groupIndex) => (
            <div key={group.section}>
              {!isCollapsed && (
                <Slide
                  direction="right"
                  delay={groupIndex * 0.04}
                >
                  <p
                    className="
                      px-3
                      mb-2
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-white/50
                    "
                  >
                    {group.section}
                  </p>
                </Slide>
              )}

              <ul className="space-y-1.5">
                {group.items.map((item, index) => (
                  <li key={item.name}>
                    <Slide
                      direction="right"
                      delay={index * 0.04}
                    >
                      <motion.div
                        whileHover={{ x: isCollapsed ? 0 : 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <NavLink
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          title={isCollapsed ? item.name : undefined}
                          className={({ isActive }) =>
                            `
                              flex
                              items-center
                              ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                              py-3
                              rounded
                              transition-colors
                              duration-200
                              group
                              ${
                                isActive
                                  ? 'bg-white text-primary font-semibold shadow-sm'
                                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                              }
                            `
                          }
                        >
                          <item.icon className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />

                          {!isCollapsed && (
                            <span className="text-sm">
                              {item.name}
                            </span>
                          )}
                        </NavLink>
                      </motion.div>
                    </Slide>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10">
        <Slide direction="up" delay={0.2}>
          <motion.div
            whileHover={{ y: -2 }}
            className={`
              p-3
              rounded
              bg-white/10
              flex
              items-center
              gap-3
              hover:bg-white/15
              transition-colors
              cursor-pointer
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div
              className="
                w-10
                h-10
                rounded-full
                overflow-hidden
                ring-2
                ring-white/30
                shrink-0
              "
            >
              <img
                src="https://ui-avatars.com/api/?name=PSS&background=ffffff&color=2664FA"
                alt="PSS"
              />
            </div>

            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  Passenger Service
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    text-white/60
                    font-bold
                  "
                >
                  System Administrator
                </p>
              </div>
            )}
          </motion.div>
        </Slide>
      </div>
    </>
  );
};

export default Sidebar;
