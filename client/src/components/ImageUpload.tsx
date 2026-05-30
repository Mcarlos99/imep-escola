import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide";
}

export default function ImageUpload({
  value,
  onChange,
  folder = "courses",
  className = "",
  aspectRatio = "video",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.admin.upload.image.useMutation({
    onSuccess: (data) => {
      onChange(data.url);
      setPreview(data.url);
      toast.success("Imagem enviada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao enviar imagem: ${error.message}`);
      setPreview(value);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Full = event.target?.result as string;
      setPreview(base64Full);

      // Extract base64 data (remove data:image/xxx;base64, prefix)
      const base64 = base64Full.split(",")[1];

      uploadMutation.mutate({
        base64,
        fileName: file.name,
        mimeType: file.type,
        folder,
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setPreview(undefined);
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
  }[aspectRatio];

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className={`relative ${aspectRatioClass} rounded-lg overflow-hidden border border-border bg-muted`}>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="ml-2">Trocar</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
              <span className="ml-2">Remover</span>
            </Button>
          </div>

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <span className="text-sm">Enviando...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full ${aspectRatioClass} rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">Enviando...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para enviar uma imagem
              </span>
              <span className="text-xs text-muted-foreground/70">
                PNG, JPG ou WEBP (máx. 5MB)
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
