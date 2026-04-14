"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarsIcon,
  ImageIcon,
  VideoIcon,
} from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href="/">
          <Image
            src="/logo.png"
            alt="sensai logo"
            width={200}
            height={60}
            className="h-12 py-1 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="secondary" className="bg-white text-black hover:bg-gray-100">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Industry Insights</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="bg-white text-black hover:bg-gray-100">
                  <StarsIcon className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Growth Tools</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 bg-black border border-white/10 text-white shadow-xl" align="end">
                
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400">
                  Career Tools 
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Build Resume
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/ai-cover-letter" className="flex items-center gap-2">
                    <PenBox className="h-4 w-4" />
                    Cover Letter
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400">
                  AI Generators
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/ai-image" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-purple-400" />
                    Image Generator
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/ai-video" className="flex items-center gap-2">
                    <VideoIcon className="h-4 w-4 text-blue-400" />
                    Video Generator
                  </Link>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="secondary" className="bg-white text-black">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

        </div>
      </nav>
    </header>
  );
};

export default Header;