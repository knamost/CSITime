const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add image to User
if (!schema.includes('image           String?')) {
  schema = schema.replace(
    /username        String\?    @unique/,
    'username        String?    @unique\n  image           String?'
  );
}

// Add isEdited to Resource
if (!schema.includes('isEdited     Boolean      @default(false)')) {
  schema = schema.replace(
    /createdAt    DateTime     @default\(now\(\)\)/,
    'createdAt    DateTime     @default(now())\n  isEdited     Boolean      @default(false)'
  );
}

// Add isEdited and histories to Post
if (!schema.includes('isEdited  Boolean   @default(false)')) {
  schema = schema.replace(
    /updatedAt DateTime  @updatedAt/,
    'updatedAt DateTime  @updatedAt\n  isEdited  Boolean   @default(false)\n  history   PostHistory[]'
  );
}

// Add isEdited and histories to Comment
if (!schema.includes('isEdited   Boolean   @default(false)')) {
  schema = schema.replace(
    /createdAt  DateTime  @default\(now\(\)\)/,
    'createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n  isEdited   Boolean   @default(false)\n  history    CommentHistory[]'
  );
}

// Add PostHistory and CommentHistory models
if (!schema.includes('model PostHistory')) {
  schema += `

model PostHistory {
  id        String   @id @default(cuid())
  postId    String
  title     String
  content   String
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model CommentHistory {
  id        String   @id @default(cuid())
  commentId String
  content   String
  createdAt DateTime @default(now())
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
}
`;
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully for Phase 1 and Phase 2.');
