const fs = require('fs');

let content = fs.readFileSync('src/app/post/[id]/comment-section.tsx', 'utf8');

if (!content.includes('UploadButton')) {
  content = content.replace(
    /import \{ Textarea \} from "@\/components\/ui\/textarea"/,
    `import { Textarea } from "@/components/ui/textarea"\nimport { UploadButton } from "@/utils/uploadthing"\nimport { useRef } from "react"`
  );

  content = content.replace(
    /function CommentForm\(\{ postId, parentId, onSuccess \}: \{ postId: string; parentId\?: string; onSuccess\?: \(\) => void \}\) \{/,
    `function CommentForm({ postId, parentId, onSuccess }: { postId: string; parentId?: string; onSuccess?: () => void }) {\n  const contentRef = useRef<HTMLTextAreaElement>(null)\n  const [contentVal, setContentVal] = useState("")`
  );

  content = content.replace(
    /if \(form\) form\.reset\(\)/,
    `if (form) { form.reset(); setContentVal(""); }`
  );

  content = content.replace(
    /<Textarea name="content" placeholder="Write a comment\.\.\. \(Markdown supported\)" required minLength=\{2\} className="min-h-\[100px\]" \/>/,
    `<Textarea 
        ref={contentRef}
        name="content" 
        placeholder="Write a comment... (Markdown supported)" 
        required 
        minLength={2} 
        className="min-h-[100px]" 
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

  fs.writeFileSync('src/app/post/[id]/comment-section.tsx', content);
  console.log("CommentForm updated with UploadButton");
}
