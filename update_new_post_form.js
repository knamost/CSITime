const fs = require('fs');

let content = fs.readFileSync('src/app/post/new/new-post-form.tsx', 'utf8');

if (!content.includes('UploadButton')) {
  content = content.replace(
    /import \{ useRouter \} from "next\/navigation"/,
    `import { useRouter } from "next/navigation"\nimport { UploadButton } from "@/utils/uploadthing"\nimport { useRef } from "react"`
  );

  content = content.replace(
    /const \[loading, setLoading\] = useState\(false\)/,
    `const [loading, setLoading] = useState(false)\n  const contentRef = useRef<HTMLTextAreaElement>(null)\n  const [contentVal, setContentVal] = useState("")`
  );

  // Replace Textarea
  content = content.replace(
    /<Textarea\s*id="content"\s*name="content"\s*required\s*placeholder="Provide more context..."\s*className="min-h-\[200px\]"\s*minLength=\{10\}\s*\/>/,
    `<Textarea
          ref={contentRef}
          id="content"
          name="content"
          required
          placeholder="Provide more context... (Markdown supported)"
          className="min-h-[200px]"
          minLength={10}
          value={contentVal}
          onChange={(e) => setContentVal(e.target.value)}
        />
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <span>Attach media:</span>
          <UploadButton
            endpoint="resourceUploader"
            appearance={{ button: "h-8 px-3 text-xs", allowedContent: "hidden" }}
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                const url = res[0].url;
                const name = res[0].name;
                const isImage = url.match(/\\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
                const markdown = isImage ? "\\n![" + name + "](" + url + ")\\n" : "\\n[" + name + "](" + url + ")\\n";
                
                const cursorPosition = contentRef.current?.selectionStart || contentVal.length;
                const newText = contentVal.substring(0, cursorPosition) + markdown + contentVal.substring(cursorPosition);
                setContentVal(newText);
                toast.success("Media attached!");
              }
            }}
            onUploadError={(error) => {
              toast.error("Upload failed: " + error.message);
            }}
          />
        </div>`
  );

  fs.writeFileSync('src/app/post/new/new-post-form.tsx', content);
  console.log("New Post Form updated with UploadButton");
}
