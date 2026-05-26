'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
	images: string[];
	alt: string;
}

export function Gallery({ images, alt }: Props) {
	const [index, setIndex] = useState(0);

	if (images.length === 0) {
		return (
			<div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
				<ImageIcon className="h-16 w-16 opacity-30" />
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
				<Image
					src={images[index]}
					alt={alt}
					fill
					sizes="(min-width: 1024px) 60vw, 100vw"
					className="object-contain"
					priority
				/>
			</div>
			{images.length > 1 && (
				<div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
					{images.map((src, i) => (
						<button
							key={src}
							type="button"
							onClick={() => setIndex(i)}
							className={cn(
								'relative aspect-square overflow-hidden rounded-md border-2',
								i === index ? 'border-primary' : 'border-transparent',
							)}
						>
							<Image
								src={src}
								alt=""
								fill
								sizes="80px"
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
