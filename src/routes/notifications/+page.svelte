<script lang="ts">
	import Title from '$lib/components/Title.svelte';

	let { data } = $props();
	let notifications = $derived(() => data.notifications);

	function readNotification(id: number) {
		return async () => {
			await fetch(`/api/v1/notifications/${id}/read`, {
				method: 'POST'
			}).then(() => {
				location.reload();
			});
		};
	}
</script>

<Title>알림</Title>
<div class="notifications">
	{#if notifications().length === 0}
		<div>알림이 없습니다.</div>
	{:else}
		{#each notifications() as notification}
			<button
				class="notification"
				class:read={notification.is_read}
				onclick={readNotification(notification.id)}
			>
				<div class="notification-message">{notification.message}</div>
				<div class="notification-time">{new Date(notification.created_at).toLocaleString()}</div>
			</button>
		{/each}
	{/if}
</div>

<style>
	.notifications {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.notification {
		padding: 1rem;
		border-bottom: 1px solid #ddd;
		background-color: #fff0f0;
		transition: background-color 0.3s;
		text-align: left;
	}

	.notification:hover {
		background-color: #f0f0f0;
	}

	.notification.read {
		background-color: white;
	}

	.notification-message {
		font-size: 1rem;
		color: #333;
	}

	.notification-time {
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.5rem;
	}
</style>
