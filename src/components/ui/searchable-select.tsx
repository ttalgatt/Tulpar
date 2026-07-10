'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type SearchableOption = {
	value: string;
	label: string;
};

type Props = {
	options: SearchableOption[];
	value?: string;
	onValueChange: (value: string | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	/** Показать пункт «Все» / очистки вверху списка */
	clearLabel?: string;
	className?: string;
};

export function SearchableSelect({
	options,
	value,
	onValueChange,
	placeholder = '—',
	disabled,
	clearLabel,
	className,
}: Props) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const selected = options.find((o) => o.value === value);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return options;
		return options.filter((o) => o.label.toLowerCase().includes(q));
	}, [options, query]);

	useEffect(() => {
		if (!open) return;
		const onDoc = (e: MouseEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) {
				setOpen(false);
				setQuery('');
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
				setQuery('');
			}
		};
		document.addEventListener('mousedown', onDoc);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDoc);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	useEffect(() => {
		if (open) {
			queueMicrotask(() => inputRef.current?.focus());
		}
	}, [open]);

	return (
		<div ref={rootRef} className={cn('relative', className)}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => {
					if (disabled) return;
					setOpen((v) => !v);
					setQuery('');
				}}
				className={cn(
					'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					!selected && 'text-muted-foreground',
				)}
			>
				<span className="line-clamp-1 text-left">{selected?.label ?? placeholder}</span>
				<span className="flex shrink-0 items-center gap-1">
					{value && !disabled ? (
						<span
							role="button"
							tabIndex={-1}
							className="rounded p-0.5 hover:bg-muted"
							onClick={(e) => {
								e.stopPropagation();
								onValueChange(undefined);
								setOpen(false);
								setQuery('');
							}}
						>
							<X className="h-3.5 w-3.5 opacity-60" />
						</span>
					) : null}
					<ChevronDown className="h-4 w-4 opacity-50" />
				</span>
			</button>

			{open && !disabled ? (
				<div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
					<div className="border-b p-2">
						<Input
							ref={inputRef}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Поиск…"
							className="h-8"
						/>
					</div>
					<ul className="max-h-60 overflow-y-auto py-1">
						{clearLabel ? (
							<li>
								<button
									type="button"
									className={cn(
										'w-full px-3 py-2 text-left text-sm hover:bg-accent',
										!value && 'bg-accent',
									)}
									onClick={() => {
										onValueChange(undefined);
										setOpen(false);
										setQuery('');
									}}
								>
									{clearLabel}
								</button>
							</li>
						) : null}
						{filtered.length === 0 ? (
							<li className="px-3 py-2 text-sm text-muted-foreground">Ничего не найдено</li>
						) : (
							filtered.map((o) => (
								<li key={o.value}>
									<button
										type="button"
										className={cn(
											'w-full px-3 py-2 text-left text-sm hover:bg-accent',
											o.value === value && 'bg-accent',
										)}
										onClick={() => {
											onValueChange(o.value);
											setOpen(false);
											setQuery('');
										}}
									>
										{o.label}
									</button>
								</li>
							))
						)}
					</ul>
				</div>
			) : null}
		</div>
	);
}
