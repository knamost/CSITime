const fs = require('fs');

let coreContent = fs.readFileSync('src/app/api/uploadthing/core.ts', 'utf8');

if (!coreContent.includes('imageUploader')) {
  coreContent = coreContent.replace(
    /resourceUploader: f\(/,
    `imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
  resourceUploader: f(`
  );
  fs.writeFileSync('src/app/api/uploadthing/core.ts', coreContent);
  console.log("core.ts updated");
}
