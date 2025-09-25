'use client';

import { useWordCloudImage } from '@/features/.python-service/hooks/useUserPythonService';
import Image from 'next/image';

export default function WordCloudVisualization({ texts }: { texts: string[] }) {
  const { data: imageUrl, isLoading, isError } = useWordCloudImage(texts);

  if (isLoading)
    return (
      <div className="text-center text-muted-foreground italic text-sm">
        Loading word cloud...
      </div>
    );

  if (isError || !imageUrl)
    return (
      <div className="text-center text-destructive text-sm">
        Failed to load word cloud.
      </div>
    );

  return (
    <div className="flex h-full justify-center items-center">
      <Image
        src={imageUrl}
        alt="Word Cloud Visualization"
        width={0}
        height={0}
        sizes="100vw"
        unoptimized
        className="max-h-[350px] w-full object-contain rounded-lg"
      />
    </div>
  );
}
