import Image from "next/image";
import { cn } from "@/lib/utils";
import { profile } from "@/data/profile";

interface ProfilePhotoProps {
  className?: string;
}

export function ProfilePhoto({ className }: ProfilePhotoProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="glow-orb absolute inset-4 bg-gradient-to-br from-primary/35 via-secondary/25 to-accent/20"
      />
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-background-secondary">
        <Image
          src={profile.photoSrc}
          alt={profile.name}
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
