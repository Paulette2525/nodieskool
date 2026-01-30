import { Award, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CertificatePreviewProps {
  certificateNumber: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
  onDownload?: () => void;
}

export function CertificatePreview({
  certificateNumber,
  userName,
  courseTitle,
  issuedAt,
  onDownload,
}: CertificatePreviewProps) {
  const formattedDate = new Date(issuedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
        <div className="border-4 border-primary/20 rounded-lg p-8 bg-card/80 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Certificat de Réussite
            </h2>
            <p className="text-muted-foreground">Growth Academy</p>
          </div>

          {/* Content */}
          <div className="text-center space-y-4 mb-8">
            <p className="text-lg text-muted-foreground">
              Ce certificat atteste que
            </p>
            <p className="text-3xl font-bold">{userName}</p>
            <p className="text-lg text-muted-foreground">
              a complété avec succès la formation
            </p>
            <p className="text-2xl font-semibold text-primary">
              "{courseTitle}"
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Délivré le {formattedDate}</span>
            </div>
            <div>
              <span className="font-mono">{certificateNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {onDownload && (
        <CardContent className="pt-4">
          <Button onClick={onDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Télécharger le certificat
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
