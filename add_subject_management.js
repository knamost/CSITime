const fs = require('fs');

let actionsContent = fs.readFileSync('src/app/actions/admin.ts', 'utf8');

if (!actionsContent.includes('getAllSubjects')) {
  actionsContent += `
export async function getAllSubjects() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
  try {
    const subjects = await prisma.subject.findMany({
      include: { semester: true, _count: { select: { posts: true, resources: true } } },
      orderBy: { semesterId: 'asc' }
    })
    return { subjects }
  } catch (error) {
    return { error: "Failed to fetch subjects" }
  }
}

export async function createSubject(name: string, code: string, semesterId: number) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
  try {
    await prisma.subject.create({ data: { name, code, semesterId } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create subject" }
  }
}

export async function updateSubject(id: string, name: string, code: string, semesterId: number) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
  try {
    await prisma.subject.update({ where: { id }, data: { name, code, semesterId } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update subject" }
  }
}
`;
  fs.writeFileSync('src/app/actions/admin.ts', actionsContent);
}

// Update Admin Page
let adminContent = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

adminContent = adminContent.replace(
  /import \{ getAllUsers, getAllPosts, getAllResources, updateUserRole, deletePost, deleteResource \} from "@\/app\/actions\/admin"/,
  `import { getAllUsers, getAllPosts, getAllResources, updateUserRole, deletePost, deleteResource, getAllSubjects } from "@/app/actions/admin"\nimport { SubjectManager } from "./subject-manager"`
);

adminContent = adminContent.replace(
  /const \[usersResult, postsResult, resourcesResult\] = await Promise\.all\(\[/,
  `const [usersResult, postsResult, resourcesResult, subjectsResult] = await Promise.all([`
);

adminContent = adminContent.replace(
  /getAllResources\(\),\n\s*\]\)/,
  `getAllResources(),\n    getAllSubjects(),\n  ])`
);

adminContent = adminContent.replace(
  /const resources = "resources" in resourcesResult \? resourcesResult\.resources! : \[\]/,
  `const resources = "resources" in resourcesResult ? resourcesResult.resources! : []\n  const subjects = "subjects" in subjectsResult ? subjectsResult.subjects! : []`
);

adminContent = adminContent.replace(
  /<TabsList className="grid w-full grid-cols-3">/,
  `<TabsList className="grid w-full grid-cols-4">`
);

adminContent = adminContent.replace(
  /<TabsTrigger value="resources">Resources \(\{resources\.length\}\)<\/TabsTrigger>/,
  `<TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>\n          <TabsTrigger value="subjects">Subjects</TabsTrigger>`
);

adminContent = adminContent.replace(
  /<\/TabsContent>\n\s*<\/Tabs>/,
  `</TabsContent>\n\n        <TabsContent value="subjects" className="mt-4">\n          <SubjectManager subjects={subjects as any} />\n        </TabsContent>\n      </Tabs>`
);

// Add link to user profile for admins
adminContent = adminContent.replace(
  /<TableCell className="font-medium">\{user\.name\}<\/TableCell>/,
  `<TableCell className="font-medium">\n                        <Link href={\`/admin/user/\${user.id}\`} className="hover:underline text-primary">\n                          {user.name || "Unknown"}\n                        </Link>\n                      </TableCell>`
);

fs.writeFileSync('src/app/admin/page.tsx', adminContent);
console.log("Admin updated with Subjects");
