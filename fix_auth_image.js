const fs = require('fs');

let authContent = fs.readFileSync('src/auth.ts', 'utf8');

authContent = authContent.replace(
  /currentElective: user\.currentElective,\n\s*\}/,
  `currentElective: user.currentElective,\n          image: user.image,\n        }`
);

authContent = authContent.replace(
  /token\.username = \(user as any\)\.username\n\s*\}/,
  `token.username = (user as any).username\n        token.image = (user as any).image\n      }`
);

authContent = authContent.replace(
  /session\.user\.username = token\.username as string \| null\n\s*return session/,
  `session.user.username = token.username as string | null\n      session.user.image = token.image as string | null\n      return session`
);

fs.writeFileSync('src/auth.ts', authContent);
console.log("Auth updated with image");
