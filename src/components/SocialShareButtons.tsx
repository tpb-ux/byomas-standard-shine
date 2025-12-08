import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link2, Linkedin, Twitter, Facebook, MessageCircle } from "lucide-react";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  compact?: boolean;
}

export const SocialShareButtons = ({
  url,
  title,
  description = "",
  hashtags = ["CreditoCarbono", "Sustentabilidade", "AmazoniaResearch"],
  compact = false,
}: SocialShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.join(",");

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${hashtagString}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("linkedin")}
          className="h-8 w-8 text-[#0077b5] hover:bg-[#0077b5]/10"
          title="Compartilhar no LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("twitter")}
          className="h-8 w-8 text-foreground hover:bg-muted"
          title="Compartilhar no Twitter/X"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("facebook")}
          className="h-8 w-8 text-[#1877f2] hover:bg-[#1877f2]/10"
          title="Compartilhar no Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("whatsapp")}
          className="h-8 w-8 text-[#25d366] hover:bg-[#25d366]/10"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyLink}
          className="h-8 w-8"
          title="Copiar link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        onClick={() => handleShare("linkedin")}
        className="gap-2 border-[#0077b5]/30 text-[#0077b5] hover:bg-[#0077b5]/10 hover:border-[#0077b5]"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </Button>
      <Button
        variant="outline"
        onClick={() => handleShare("twitter")}
        className="gap-2"
      >
        <Twitter className="h-4 w-4" />
        Twitter
      </Button>
      <Button
        variant="outline"
        onClick={() => handleShare("facebook")}
        className="gap-2 border-[#1877f2]/30 text-[#1877f2] hover:bg-[#1877f2]/10 hover:border-[#1877f2]"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>
      <Button
        variant="outline"
        onClick={() => handleShare("whatsapp")}
        className="gap-2 border-[#25d366]/30 text-[#25d366] hover:bg-[#25d366]/10 hover:border-[#25d366]"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
      <Button
        variant="outline"
        onClick={handleCopyLink}
        className="gap-2"
      >
        <Link2 className="h-4 w-4" />
        Copiar Link
      </Button>
    </div>
  );
};