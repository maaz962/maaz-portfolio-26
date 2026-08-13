import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePhotoProps {
  className?: string;
}

// TODO: Replace this placeholder with M. Maaz Arif's professional profile photo.
// 1. Add the final image at /public/images/profile.jpg (square, >=800x800px).
// 2. Delete the placeholder <div> below and replace it with:
//      import Image from "next/image";
//      <Image
//        src={profile.photoSrc}
//        alt={profile.name}
//        fill
//        priority
//        className="object-cover"
//      />
//    inside the same rounded wrapper, keeping the aspect-square container.
export function ProfilePhoto({ className }: ProfilePhotoProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Soft purple/blue halo behind the frame — stays subtle, no hard neon edge. */}
      <div
        aria-hidden="true"
        className="glow-orb absolute inset-4 bg-gradient-to-br from-primary/35 via-secondary/25 to-accent/20"
      />
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-background-secondary">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <UserRound
            className="h-10 w-10 text-muted"
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <span className="text-mono text-xs text-muted">
            [PROFILE PHOTO HERE]
          </span>
        </div>
      </div>
    </div>
  );
}
