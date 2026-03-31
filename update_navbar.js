const fs = require('fs');

let navbarContent = fs.readFileSync('src/components/navbar.tsx', 'utf8');

// Use the new Avatar image if available
navbarContent = navbarContent.replace(
  /<Avatar className="h-9 w-9">\n\s*<AvatarFallback className="bg-primary\/10 text-primary">\n\s*\{session\.user\?\.name\?\.charAt\(0\)\.toUpperCase\(\) \|\| "U"\}\n\s*<\/AvatarFallback>\n\s*<\/Avatar>/,
  `<Avatar className="h-9 w-9">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="rounded-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>`
);

// Add Dashboard to mobile menu if logged in
navbarContent = navbarContent.replace(
  /<Link href="\/posts" className="px-2 py-1 text-lg font-medium hover:text-primary transition-colors">\n\s*Discussions\n\s*<\/Link>/,
  `<Link href="/posts" className="px-2 py-1 text-lg font-medium hover:text-primary transition-colors">
                    Discussions
                  </Link>
                  {session?.user && (
                    <Link href="/dashboard" className="px-2 py-1 text-lg font-medium hover:text-primary transition-colors text-primary">
                      Dashboard
                    </Link>
                  )}`
);

// Add Dashboard to desktop menu if logged in
navbarContent = navbarContent.replace(
  /<Link href="\/posts" className="text-sm font-medium hover:text-primary transition-colors">\n\s*Discussions\n\s*<\/Link>/,
  `<Link href="/posts" className="text-sm font-medium hover:text-primary transition-colors">
            Discussions
          </Link>
          {session?.user && (
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors text-primary">
              Dashboard
            </Link>
          )}`
);

// Update dropdown menu
navbarContent = navbarContent.replace(
  /<DropdownMenuItem>\n\s*<Link href="\/profile" className="w-full">Profile<\/Link>\n\s*<\/DropdownMenuItem>/,
  `<DropdownMenuItem>
                  <Link href="/dashboard" className="w-full">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">Settings</Link>
                </DropdownMenuItem>`
);

// Fix Admin Dashboard link text
navbarContent = navbarContent.replace(
  /<Link href="\/admin" className="w-full">Dashboard<\/Link>/,
  `<Link href="/admin" className="w-full text-destructive font-medium">Admin Panel</Link>`
);

fs.writeFileSync('src/components/navbar.tsx', navbarContent);
console.log("Navbar updated with Dashboard links");
