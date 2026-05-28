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
  Bell,
  Settings,
} from 'lucide-react';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Slide from '../animations/Slide';

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
        name: 'Baggage',
        href: '/baggage',
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
        icon: FileText,
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
      },
      {
        name: 'Roles & Permissions',
        href: '/roles',
        icon: Shield,
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
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MOBILE TOGGLE */}
      <div className="md:hidden fixed top-0 left-0 z-60 p-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="
            p-2.5
            rounded-xl
            bg-primary
            text-white
            shadow-lg
            shadow-teal-200/50
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
      <aside
        className="
          hidden
          md:flex
          md:w-72
          md:min-w-72
          h-screen
          sticky
          top-0
          bg-white
          border-r
          border-slate-100
          flex-col
        "
      >
        <SidebarContent setIsOpen={setIsOpen} />
      </aside>

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
              bg-white
              border-r
              border-slate-100
              flex
              flex-col
              md:hidden
              h-screen
            "
          >
            <SidebarContent setIsOpen={setIsOpen} />
          </Slide>
        )}
      </AnimatePresence>
    </>
  );
};

type SidebarContentProps = {
  setIsOpen: (value: boolean) => void;
};

const SidebarContent = ({
  setIsOpen,
}: SidebarContentProps) => {
  return (
    <>
      {/* HEADER */}
      <div className="p-6 border-b border-slate-100">
        <Slide direction="down">
          <div className="flex items-center gap-3">
            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-primary
                flex
                items-center
                justify-center
                shadow-lg
                shadow-teal-200/50
              "
            >
              <Plane className="text-white w-6 h-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Passenger Service
              </h1>

              <p
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.2em]
                  text-slate-400
                  font-semibold
                "
              >
                Admin Panel
              </p>
            </div>
          </div>
        </Slide>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 custom-scrollbar">
        <div className="space-y-6">
          {navigation.map((group, groupIndex) => (
            <div key={group.section}>
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
                    text-slate-400
                  "
                >
                  {group.section}
                </p>
              </Slide>

              <ul className="space-y-1.5">
                {group.items.map((item, index) => (
                  <li key={item.name}>
                    <Slide
                      direction="right"
                      delay={index * 0.04}
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <NavLink
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `
                              flex
                              items-center
                              px-4
                              py-3
                              rounded-xl
                              transition-colors
                              duration-200
                              group
                              ${
                                isActive
                                  ? 'bg-teal-50 text-primary font-semibold shadow-sm'
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                              }
                            `
                          }
                        >
                          <item.icon className="w-5 h-5 mr-3 shrink-0" />

                          <span className="text-sm">
                            {item.name}
                          </span>
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
      <div className="p-4 border-t border-slate-100">
        <Slide direction="up" delay={0.2}>
          <motion.div
            whileHover={{ y: -2 }}
            className="
              p-3
              rounded-2xl
              bg-slate-50
              flex
              items-center
              gap-3
              hover:bg-slate-100
              transition-colors
              cursor-pointer
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                overflow-hidden
                ring-2
                ring-white
                shadow-sm
              "
            >
              <img
                src="https://ui-avatars.com/api/?name=PSS&background=0f172a&color=fff"
                alt="PSS"
              />
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                Passenger Service
              </p>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  font-bold
                "
              >
                System Administrator
              </p>
            </div>
          </motion.div>
        </Slide>
      </div>
    </>
  );
};

export default Sidebar;
