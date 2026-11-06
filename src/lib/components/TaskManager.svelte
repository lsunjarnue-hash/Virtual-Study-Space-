<script lang="ts">
	import { study } from '#lib/state/study.svelte.ts';
	import { Check, ListChecks, Plus, Trash2 } from 'lucide-svelte';

	let draft = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	const remaining = $derived(study.tasks.filter((task) => !task.done).length);
	const completed = $derived(study.tasks.filter((task) => task.done).length);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!draft.trim()) return;
		study.addTask(draft);
		draft = '';
		inputEl?.focus();
	}
</script>

<section class="task-card card" aria-labelledby="tasks-heading">
	<header class="task-head">
		<div>
			<p class="eyebrow">Checklist</p>
			<h2 id="tasks-heading">Study tasks</h2>
		</div>
		<span class="task-count">{remaining} left</span>
	</header>

	<form class="task-form" onsubmit={handleSubmit}>
		<label class="sr-only" for="new-task">New study task</label>
		<input
			id="new-task"
			bind:value={draft}
			bind:this={inputEl}
			type="text"
			placeholder="What are you focusing on?"
			maxlength="120"
			autocomplete="off"
		/>
		<button type="submit" class="add-task" aria-label="Add task" disabled={!draft.trim()}>
			<Plus size={18} strokeWidth={2.4} />
		</button>
	</form>

	{#if study.tasks.length > 0}
		<ul class="task-list">
			{#each study.tasks as task (task.id)}
				<li class:done={task.done}>
					<label class="task-label">
						<input
							class="task-checkbox"
							type="checkbox"
							checked={task.done}
							onchange={() => study.toggleTask(task.id)}
						/>
						<span class="box" aria-hidden="true">
							{#if task.done}<Check size={13} strokeWidth={3} />{/if}
						</span>
						<span class="task-text">{task.text}</span>
					</label>
					<button
						class="remove"
						type="button"
						aria-label="Delete task: {task.text}"
						onclick={() => study.removeTask(task.id)}
					>
						<Trash2 size={15} />
					</button>
				</li>
			{/each}
		</ul>

		{#if completed > 0}
			<button class="clear-completed" type="button" onclick={() => study.clearCompleted()}>
				Clear {completed} completed
			</button>
		{/if}
	{:else}
		<div class="empty-state">
			<span class="empty-icon" aria-hidden="true"><ListChecks size={24} /></span>
			<p>No tasks yet. Add the first thing you want to finish.</p>
		</div>
	{/if}
</section>

<style>
	.task-card {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: clamp(1.35rem, 3vw, 1.85rem);
	}

	.task-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.task-head h2 {
		margin-top: 0.2rem;
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.task-count {
		flex-shrink: 0;
		padding: 0.35rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-muted);
		font-size: 0.72rem;
		font-weight: 600;
	}

	.task-form {
		display: flex;
		gap: 0.5rem;
	}

	.task-form input {
		flex: 1;
		min-width: 0;
		padding: 0.85rem 1rem;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.035);
		color: var(--text);
		font-size: 0.9rem;
		outline: none;
		transition:
			border-color 180ms ease,
			background 180ms ease,
			box-shadow 180ms ease;
	}

	.task-form input::placeholder {
		color: var(--text-dim);
	}

	.task-form input:focus {
		border-color: rgba(167, 139, 250, 0.5);
		background: rgba(255, 255, 255, 0.05);
		box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
	}

	.add-task {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		flex-shrink: 0;
		border: 0;
		border-radius: 14px;
		background: linear-gradient(135deg, #b79cff, var(--accent-strong) 55%, var(--accent-deep));
		color: #fff;
		box-shadow: 0 12px 26px -14px rgba(109, 63, 240, 0.9);
		transition:
			opacity 180ms ease,
			transform 180ms ease;
	}

	.add-task:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.add-task:disabled {
		cursor: not-allowed;
		opacity: 0.35;
		box-shadow: none;
	}

	.task-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.task-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.4rem 0.3rem 0.65rem;
		border: 1px solid transparent;
		border-radius: 14px;
		transition:
			background 160ms ease,
			border-color 160ms ease;
	}

	.task-list li:hover {
		background: rgba(255, 255, 255, 0.03);
		border-color: var(--border);
	}

	.task-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
		padding: 0.4rem 0;
		cursor: pointer;
	}

	.task-checkbox {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.box {
		display: grid;
		place-items: center;
		width: 21px;
		height: 21px;
		flex-shrink: 0;
		border: 1.5px solid #3b3548;
		border-radius: 7px;
		color: #0a0710;
		transition:
			background 160ms ease,
			border-color 160ms ease,
			transform 160ms ease;
	}

	.task-checkbox:focus-visible + .box {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}

	.task-label:hover .box {
		border-color: rgba(167, 139, 250, 0.55);
	}

	.task-checkbox:checked + .box {
		border-color: transparent;
		background: linear-gradient(135deg, #c4b5fd, var(--accent-strong));
	}

	.task-text {
		overflow: hidden;
		color: var(--text);
		font-size: 0.9rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition:
			color 160ms ease,
			opacity 160ms ease;
	}

	li.done .task-text {
		color: var(--text-dim);
		text-decoration: line-through;
	}

	.remove {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: var(--text-dim);
		opacity: 0.55;
		transition:
			color 160ms ease,
			background 160ms ease,
			opacity 160ms ease;
	}

	.remove:hover {
		background: rgba(251, 113, 133, 0.1);
		color: var(--danger);
		opacity: 1;
	}

	.clear-completed {
		align-self: flex-start;
		padding: 0.25rem 0;
		border: 0;
		background: none;
		color: var(--text-dim);
		font-size: 0.78rem;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 3px;
		transition:
			color 160ms ease,
			text-decoration-color 160ms ease;
	}

	.clear-completed:hover {
		color: var(--text-muted);
		text-decoration-color: currentColor;
	}

	.empty-state {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1.1rem;
		border: 1px dashed var(--border);
		border-radius: 16px;
		color: var(--text-dim);
	}

	.empty-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border-radius: 12px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.empty-state p {
		font-size: 0.84rem;
		line-height: 1.45;
	}

	@media (max-width: 420px) {
		.empty-state {
			align-items: flex-start;
		}
	}
</style>
