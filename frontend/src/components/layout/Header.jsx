import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FiCpu, FiUser } from "react-icons/fi";
import { UserIcon, LogOutIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const listItems = [
  { icon: UserIcon, property: "Profile", path: "/perfil" },
  {
    icon: LogOutIcon,
    property: "Sign Out",
  },
];

export default function Header() {
  const navigate = useNavigate();
  const handleAction = (item) => {
    if (item.property === "Sign Out") {
      navigate("/login");
    } else if (item.path) {
      navigate(item.path);
    }
  };
  const getNavClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? "text-primary-600 border-primary-600"
        : "text-gray-500 border-transparent hover:text-primary-600 hover:border-primary-200"
    }`;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src="/logo_cantv.png"
                alt="CANTV Logo"
                className="h-10 w-auto"
              />
              {/* <span className="font-bold text-xl text-gray-900 tracking-tight ml-2">CANTV Inventario</span> */}
            </Link>

            {/* Navegación Principal */}
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/dashboard" className={getNavClass}>
                Inicio
              </NavLink>
              <NavLink to="/busqueda" className={getNavClass}>
                Búsqueda
              </NavLink>
              <NavLink to="/registro" className={getNavClass}>
                Registro de Equipo
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center">
            {/* Perfil */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <img
                    src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
                    alt="Avatar"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40 min-w-[120px]"
                align="center"
                sideOffset={5}
              >
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {listItems.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={() => handleAction(item)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="text-popover-foreground">
                        {item.property}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
