import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  name: string;
  type: string;
  url: string;
  size: string;
}

interface ProjectDocumentsProps {
  documents: Document[];
}

const ProjectDocuments = ({ documents }: ProjectDocumentsProps) => {
  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{doc.name}</p>
              <p className="text-sm text-muted-foreground">
                {doc.type} • {doc.size}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={doc.url} download>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ProjectDocuments;
